import { NextResponse } from 'next/server'
import { getOrderById } from '@/lib/database/queries/orders'
import { sql } from '@/lib/database'

export async function GET(
  _req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await getOrderById(params.orderId)

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    const rows = await sql`
      SELECT *
      FROM payments
      WHERE order_id = ${params.orderId}
      ORDER BY created_at DESC
      LIMIT 1
    `

    const payment = rows[0] as any | undefined

    if (!payment) {
      return NextResponse.json({
        order,
        payment: null,
        status: order.status === 'confirmado' ? 'confirmado' : 'pendente',
      })
    }

    const pixExpiresAt = payment.pix_expires_at ?? payment.expires_at ?? null
    const isExpired =
      payment.status === 'pendente' &&
      pixExpiresAt &&
      new Date(pixExpiresAt).getTime() < Date.now()

    if (isExpired) {
      await sql`
        UPDATE payments
        SET status = 'expirado', updated_at = NOW()
        WHERE id = ${payment.id}
      `
    }

    return NextResponse.json({
      order,
      payment: {
        id: payment.id,
        order_id: payment.order_id,
        method: payment.method,
        amount: payment.amount,
        status: isExpired ? 'expirado' : payment.status,
        external_id: payment.external_id,
        pix_qr_code: payment.pix_qr_code,
        pix_qr_code_text: payment.pix_qr_code_text,
        pix_expires_at: payment.pix_expires_at,
        expires_at: payment.expires_at,
        failure_reason: payment.failure_reason,
        confirmed_at: payment.confirmed_at,
      },
      status: isExpired ? 'expirado' : payment.status,
    })
  } catch (error) {
    console.error('[GET /api/pagamentos/:orderId]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pagamento' },
      { status: 500 }
    )
  }
}