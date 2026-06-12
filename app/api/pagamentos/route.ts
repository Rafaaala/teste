// app/api/pagamentos/route.ts
import { NextResponse }        from 'next/server'
import { getNextAuthSession }  from '@/lib/nextAuth'
import { createPixPayment }    from '@/lib/mercadopago/pix'
import { createCardPayment }   from '@/lib/mercadopago/card'
import { getOrderById }        from '@/lib/database/queries/orders'
import { getCustomerById }     from '@/lib/database/queries/customer'
import { sql }                 from '@/lib/database'


interface CreatePaymentBody {
  order_id:  string
  method:    'pix' | 'cartao_credito' | 'cartao_debito'
  // campos exclusivos do cartão
  token?:          string
  installments?:   number
  payment_method?: string
  // dados do cliente quando não logado
  name?: string
  phone?: string
}

export async function POST(req: Request) {
  try {
    // Verifica autenticação via token (se houver)
    const session = await getNextAuthSession(req)

    const body: CreatePaymentBody = await req.json()

    if (!body.order_id || !body.method) {
      return NextResponse.json(
        { error: 'Pedido e método de pagamento são obrigatórios' },
        { status: 400 }
      )
    }

    // 1. Busca o pedido e o cliente
    const order = await getOrderById(body.order_id)
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    if (order.status !== 'pendente') {
      return NextResponse.json(
        { error: 'Pedido já foi processado' },
        { status: 422 }
      )
    }

    const customer = await getCustomerById(order.customer_id)
    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Função utilitária para normalizar telefones (apenas dígitos)
    const normalizePhone = (p?: string | null) => (p || '').replace(/\D/g, '')

    // Validação de propriedade do pedido:
    // Se autenticado via NextAuth, valida pelo ID da sessão
    // Se não autenticado, valida por nome+telefone do body
    let ownerValidated = false

    if (session?.userId && session.userId === customer.id) {
      ownerValidated = true
    }

    // Se não validado pela sessão, tenta validação por nome+telefone enviados no body
    if (!ownerValidated) {
      const anonName = (body as any).name?.trim()
      const anonPhone = (body as any).phone?.trim()

      if (!anonName || !anonPhone) {
        return NextResponse.json({ error: 'Autenticação ou nome/telefone obrigatórios' }, { status: 401 })
      }

      if (anonName.toLowerCase() !== (customer.name || '').trim().toLowerCase() || normalizePhone(anonPhone) !== normalizePhone(customer.phone)) {
        return NextResponse.json({ error: 'Nome ou telefone não conferem com o pedido' }, { status: 403 })
      }

      ownerValidated = true
    }

    // Email placeholder — MP exige mas o sistema não coleta
    const customerEmail = `${customer.phone}@pedido.restaurante.com`

    // 2. Processa Pix
    if (body.method === 'pix') {
      const pix = await createPixPayment({
        orderId:      order.id,
        amount:       order.total,
        customerName: customer.name,
        customerEmail,
        customerCpf:  customer.cpf ?? undefined,
      })

      // Salva o pagamento pendente no banco
      await sql`
        INSERT INTO payments (
          order_id,
          method,
          amount,
          status,
          external_id,
          pix_qr_code,
          pix_qr_code_text,
          pix_expires_at,
          expires_at
        ) VALUES (
          ${order.id},
          'pix',
          ${order.total},
          'pendente',
          ${pix.paymentId},
          ${pix.qrCode},
          ${pix.qrCodeText},
          ${pix.expiresAt.toISOString()},
          ${pix.expiresAt.toISOString()}
        )
      `

      return NextResponse.json({
        method:      'pix',
        paymentId:   pix.paymentId,
        qrCode:      pix.qrCode,
        qrCodeText:  pix.qrCodeText,
        expiresAt:   pix.expiresAt,
      })
    }

    // 3. Processa cartão
    if (
      body.method === 'cartao_credito' ||
      body.method === 'cartao_debito'
    ) {
      if (!body.token || !body.payment_method) {
        return NextResponse.json(
          { error: 'Token e método do cartão são obrigatórios' },
          { status: 400 }
        )
      }

      const card = await createCardPayment({
        orderId:       order.id,
        amount:        order.total,
        token:         body.token,
        installments:  body.installments ?? 1,
        paymentMethod: body.payment_method,
        customerEmail,
        customerName:  customer.name,
        customerCpf:   customer.cpf ?? undefined,
      })

      const paymentStatus =
        card.status === 'approved' ? 'confirmado' :
        card.status === 'rejected' ? 'recusado'   : 'pendente'

      // Salva o pagamento no banco
      await sql`
        INSERT INTO payments (
          order_id,
          method,
          amount,
          status,
          external_id,
          failure_reason,
          confirmed_at
        ) VALUES (
          ${order.id},
          ${body.method},
          ${order.total},
          ${paymentStatus},
          ${card.paymentId},
          ${card.status === 'rejected' ? card.detail : null},
          ${card.status === 'approved' ? new Date().toISOString() : null}
        )
      `

      // Cartão aprovado — atualiza pedido e dispara workers
      if (card.status === 'approved') {
        await sql`
          UPDATE orders
          SET
            status       = 'confirmado',
            confirmed_at = NOW(),
            updated_at   = NOW()
          WHERE id = ${order.id}
        `

        triggerWorkers(order.id, card.paymentId).catch(err =>
          console.error('[PAGAMENTO CARTÃO] Erro ao disparar workers:', err)
        )
      }

      return NextResponse.json({
        method:    body.method,
        paymentId: card.paymentId,
        status:    card.status,
        detail:    card.detail,
      })
    }

    return NextResponse.json(
      { error: 'Método de pagamento inválido' },
      { status: 400 }
    )

  } catch (error) {
    console.error('[POST /api/pagamentos]', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
}

async function triggerWorkers(orderId: string, paymentId: string) {
  const workerUrl = process.env.RAILWAY_WORKER_URL

  if (!workerUrl) {
    console.log(`[WORKER] Pedido confirmado: ${orderId} | Pagamento: ${paymentId}`)
    return
  }

  await fetch(`${workerUrl}/jobs/processar-pedido`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET}`,
    },
    body: JSON.stringify({ orderId, paymentId }),
  })
}