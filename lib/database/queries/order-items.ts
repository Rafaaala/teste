import { sql } from '@/lib/database'
import type {
  OrderItem,
  ItemStatus,
  CreateOrderItemInput,
  UpdateOrderItemInput,
} from '@/types/database'

// Busca itens de um pedido (GetByOrderId)
export async function getOrderItemsByOrderId(
  orderId: string
): Promise<OrderItem[]> {
  const rows = await sql`
    SELECT *
    FROM order_items
    WHERE order_id = ${orderId}
    ORDER BY created_at ASC
  `
  return rows as OrderItem[]
}

// Busca um item por ID (GetById)
export async function getOrderItemById(
  id: string
): Promise<OrderItem | null> {
  const rows = await sql`
    SELECT *
    FROM order_items
    WHERE id = ${id}
    LIMIT 1
  `
  return (rows[0] as OrderItem | undefined) ?? null
}

// Cria um item no pedido (Create)
export async function createOrderItem(
  input: CreateOrderItemInput
): Promise<OrderItem> {
  const rows = await sql`
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      product_price,
      quantity,
      notes,
      status
    ) VALUES (
      ${input.order_id},
      ${input.product_id},
      ${input.product_name},
      ${input.product_price},
      ${input.quantity},
      ${input.notes ?? null},
      'pendente'
    )
    RETURNING *
  `
  return rows[0] as OrderItem
}

// Atualiza um item (Update)
export async function updateOrderItem(
  id:    string,
  input: UpdateOrderItemInput
): Promise<OrderItem | null> {
  const status = input.status ?? null

  const rows = await sql`
    UPDATE order_items
    SET
      quantity      = COALESCE(${input.quantity      ?? null}, quantity),
      notes         = COALESCE(${input.notes         ?? null}, notes),
      status        = COALESCE(${status}, status),
      cancel_reason = COALESCE(${input.cancel_reason ?? null}, cancel_reason),
      cancelled_by  = COALESCE(${input.cancelled_by  ?? null}, cancelled_by),
      updated_at    = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return (rows[0] as OrderItem | undefined) ?? null
}

export const ITEM_STATUSES: ItemStatus[] = [
  'pendente',
  'em_preparo',
  'pronto',
  'cancelado',
]
