// app/api/pedidos/[id]/itens/[itemId]/route.ts
import { NextResponse } from 'next/server'
import {
  getOrderItemById,
  updateOrderItem,
  ITEM_STATUSES,
} from '@/lib/database/queries/order-items'
import type { UpdateOrderItemInput } from '@/types/database'

async function getItemForOrder(orderId: string, itemId: string) {
  const item = await getOrderItemById(itemId)
  if (!item || item.order_id !== orderId) return null
  return item
}

// GET /api/pedidos/:id/itens/:itemId
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params
    const item = await getItemForOrder(id, itemId)

    if (!item) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('[GET /api/pedidos/:id/itens/:itemId]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar item' },
      { status: 500 }
    )
  }
}

// PATCH /api/pedidos/:id/itens/:itemId
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params
    const existing = await getItemForOrder(id, itemId)
    if (!existing) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    const body: UpdateOrderItemInput = await req.json()

    if (body.status && !ITEM_STATUSES.includes(body.status)) {
      return NextResponse.json(
        {
          error:
            'Status inválido. Use: pendente, em_preparo, pronto ou cancelado',
        },
        { status: 400 }
      )
    }

    if (body.quantity !== undefined && body.quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser maior que zero' },
        { status: 400 }
      )
    }

    if (body.status === 'cancelado' && !body.cancel_reason?.trim()) {
      return NextResponse.json(
        { error: 'Motivo do cancelamento é obrigatório' },
        { status: 400 }
      )
    }

    // TODO: substituir pelo ID do usuário autenticado
    const TEMP_USER_ID = 'system'

    const payload: UpdateOrderItemInput = {
      ...body,
      ...(body.status === 'cancelado' && {
        cancelled_by: body.cancelled_by ?? TEMP_USER_ID,
      }),
    }

    const item = await updateOrderItem(itemId, payload)

    if (!item) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('[PATCH /api/pedidos/:id/itens/:itemId]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar item' },
      { status: 500 }
    )
  }
}
