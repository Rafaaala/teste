// app/api/webhooks/mercadopago/route.ts
import { NextResponse }              from 'next/server'
import { Payment }                   from 'mercadopago'
import { mpClient }                  from '@/lib/mercadopago/client'
import { validateWebhookSignature }  from '@/lib/mercadopago/webhook'
import { sql }                       from '@/lib/database'

export async function POST(req: Request) {
  try {
    console.log('[WEBHOOK MP] Webhook recebido')
    
    const rawBody    = await req.text()
    console.log('[WEBHOOK MP] Body recebido')
    
    const body       = JSON.parse(rawBody)
    const xSignature = req.headers.get('x-signature')
    const xRequestId = req.headers.get('x-request-id')

    console.log('[WEBHOOK MP] Headers:', { xSignature: xSignature?.slice(0, 20), xRequestId })
    console.log('[WEBHOOK MP] Body type:', body.type)

    // RESPONDE RÁPIDO PRIMEIRO
    const response = NextResponse.json({ received: true })

    // PROCESSA DE FORMA ASSÍNCRONA (sem await)
    processWebhookAsync(rawBody, body, xSignature, xRequestId).catch(err =>
      console.error('[WEBHOOK MP] Erro ao processar webhook:', err)
    )

    return response

  } catch (error) {
    console.error('[WEBHOOK MP] Erro crítico:', error)
    return NextResponse.json({ received: true })
  }
}

async function processWebhookAsync(
  rawBody: string,
  body: any,
  xSignature: string | null,
  xRequestId: string | null
) {
  try {
    // 1. Valida autenticidade do webhook
    console.log('[WEBHOOK MP ASYNC] Validando assinatura...')
    const isValid = validateWebhookSignature(
      xSignature,
      xRequestId,
      body.data?.id,
      rawBody
    )

    if (!isValid) {
      console.warn('[WEBHOOK MP ASYNC] Assinatura inválida')
      return
    }

    // 2. Processa apenas eventos de pagamento
    if (body.type !== 'payment') {
      console.log('[WEBHOOK MP ASYNC] Tipo não é payment:', body.type)
      return
    }

    // 3. Busca detalhes do pagamento na API do MP
    console.log('[WEBHOOK MP ASYNC] Buscando pagamento no MP...')
    const mpPayment = new Payment(mpClient)
    const payment   = await mpPayment.get({ id: body.data.id })

    const orderId   = payment.metadata?.order_id
    const status    = payment.status
    const externalId = String(payment.id)

    console.log('[WEBHOOK MP ASYNC] Pagamento:', { orderId, status, externalId })

    if (!orderId) {
      console.warn('[WEBHOOK MP ASYNC] order_id ausente no metadata')
      return
    }

    // 4. Atualiza o pagamento no banco (se estiver disponível)
    if (status === 'approved') {
      console.log('[WEBHOOK MP ASYNC] Atualizando pagamento para confirmado...')
      try {
        await sql`
          UPDATE payments
          SET
            status       = 'confirmado',
            confirmed_at = NOW(),
            updated_at   = NOW()
          WHERE external_id = ${externalId}
        `

        // Atualiza o pedido para confirmado
        await sql`
          UPDATE orders
          SET
            status       = 'confirmado',
            confirmed_at = NOW(),
            updated_at   = NOW()
          WHERE id = ${orderId}
        `
      } catch (dbError) {
        console.warn('[WEBHOOK MP ASYNC] Banco indisponível, salvando para reprocessar:', dbError)
        // TODO: Salvar em fila para reprocessar depois
        return
      }

      // 5. Dispara os workers de forma assíncrona
      triggerWorkers(orderId, externalId).catch(err =>
        console.error('[WEBHOOK MP ASYNC] Erro ao disparar workers:', err)
      )
    }

    if (status === 'rejected') {
      console.log('[WEBHOOK MP ASYNC] Pagamento recusado, atualizando banco...')
      try {
        await sql`
          UPDATE payments
          SET
            status         = 'recusado',
            failure_reason = ${payment.status_detail ?? 'Pagamento recusado'},
            updated_at     = NOW()
          WHERE external_id = ${externalId}
        `
      } catch (dbError) {
        console.warn('[WEBHOOK MP ASYNC] Banco indisponível para rejeição:', dbError)
      }
    }

    console.log('[WEBHOOK MP ASYNC] Webhook processado com sucesso')

  } catch (error) {
    console.error('[WEBHOOK MP ASYNC] Erro crítico no processamento:', error)
  }
}

async function triggerWorkers(orderId: string, paymentId: string) {
  const workerUrl = process.env.RAILWAY_WORKER_URL

  if (!workerUrl) {
    // Fallback: loga no terminal (comportamento MVP)
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