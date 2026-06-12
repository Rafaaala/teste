// app/api/pedidos/[id]/route.ts
import { NextResponse } from 'next/server'
import {
  getOrderById,
  updateOrder,
  ORDER_STATUSES,
} from '@/lib/database/queries/orders'
import { validateCustomerAndAddress } from '@/lib/database/validate-order-deps'
import type { UpdateOrderInput } from '@/types/database'

// GET /api/pedidos/:id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await getOrderById(params.id)

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('[GET /api/pedidos/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedido' },
      { status: 500 }
    )
  }
}

// PATCH /api/pedidos/:id
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await getOrderById(params.id)
    if (!existing) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    const body: UpdateOrderInput = await req.json()

    if (body.status && !ORDER_STATUSES.includes(body.status)) {
      return NextResponse.json(
        {
          error:
            'Status inválido. Use: pendente, confirmado, em_preparo, saindo, entregue ou cancelado',
        },
        { status: 400 }
      )
    }

    if (body.status === 'cancelado' && !body.cancellation_reason?.trim()) {
      return NextResponse.json(
        { error: 'Motivo do cancelamento é obrigatório' },
        { status: 400 }
      )
    }

    if (body.subtotal !== undefined && body.subtotal < 0) {
      return NextResponse.json(
        { error: 'Subtotal deve ser maior ou igual a zero' },
        { status: 400 }
      )
    }

    if (body.delivery_fee !== undefined && body.delivery_fee < 0) {
      return NextResponse.json(
        { error: 'Taxa de entrega deve ser maior ou igual a zero' },
        { status: 400 }
      )
    }

    const customerId = body.customer_id ?? existing.customer_id
    const addressId = body.address_id ?? existing.address_id

    if (body.customer_id || body.address_id) {
      const deps = await validateCustomerAndAddress(customerId, addressId)
      if (!deps.ok) {
        return NextResponse.json(
          { error: deps.error },
          { status: deps.status }
        )
      }
    }

    // TODO: substituir pelo ID do usuário autenticado
    const TEMP_USER_ID = 'system'

    const payload: UpdateOrderInput = {
      ...body,
      ...(body.status === 'cancelado' && {
        cancelled_by: body.cancelled_by ?? TEMP_USER_ID,
      }),
    }

    const order = await updateOrder(params.id, payload)

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('[PATCH /api/pedidos/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
      { status: 500 }
    )
  }
}
