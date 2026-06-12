// app/api/pedidos/[id]/itens/route.ts
import { NextResponse } from 'next/server'
import { getOrderById } from '@/lib/database/queries/orders'
import {
  getOrderItemsByOrderId,
  createOrderItem,
} from '@/lib/database/queries/order-items'
import { validateOrderAndProduct } from '@/lib/database/validate-order-item-deps'
import type { CreateOrderItemBody } from '@/types/database'

// GET /api/pedidos/:id/itens
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

    const items = await getOrderItemsByOrderId(params.id)
    return NextResponse.json(items)
  } catch (error) {
    console.error('[GET /api/pedidos/:id/itens]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar itens do pedido' },
      { status: 500 }
    )
  }
}

// POST /api/pedidos/:id/itens
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: CreateOrderItemBody = await req.json()

    if (!body.product_id) {
      return NextResponse.json(
        { error: 'Produto é obrigatório' },
        { status: 400 }
      )
    }

    if (!body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantidade é obrigatória e deve ser maior que zero' },
        { status: 400 }
      )
    }

    const deps = await validateOrderAndProduct(params.id, body.product_id)
    if (!deps.ok) {
      return NextResponse.json(
        { error: deps.error },
        { status: deps.status }
      )
    }

    const item = await createOrderItem({
      order_id:      params.id,
      product_id:    body.product_id,
      product_name:  deps.product.name,
      product_price: deps.product.price,
      quantity:      body.quantity,
      notes:         body.notes,
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('[POST /api/pedidos/:id/itens]', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar item ao pedido' },
      { status: 500 }
    )
  }
}
