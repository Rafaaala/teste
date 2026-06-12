import { sql } from '@/lib/database'
import type {
  Order,
  OrderStatus,
  CreateOrderInput,
  UpdateOrderInput,
} from '@/types/database'

// Busca todos os pedidos (GetAll)
export async function getAllOrders(): Promise<Order[]> {
  const rows = await sql`
    SELECT *
    FROM orders
    ORDER BY created_at DESC
  `
  return rows as Order[]
}

// Busca pedidos de um cliente (GetByCustomerId)
export async function getOrdersByCustomerId(
  customerId: string
): Promise<Order[]> {
  const rows = await sql`
    SELECT *
    FROM orders
    WHERE customer_id = ${customerId}
    ORDER BY created_at DESC
  `
  return rows as Order[]
}

// Busca um pedido por ID (GetById)
export async function getOrderById(
  id: string
): Promise<Order | null> {
  const rows = await sql`
    SELECT *
    FROM orders
    WHERE id = ${id}
    LIMIT 1
  `
  return (rows[0] as Order | undefined) ?? null
}

// Cria um novo pedido (Create)
export async function createOrder(
  input: CreateOrderInput
): Promise<Order> {
  const deliveryFee = input.delivery_fee ?? 0
  const total = input.subtotal + deliveryFee

  const rows = await sql`
    INSERT INTO orders (
      customer_id,
      address_id,
      status,
      subtotal,
      delivery_fee,
      total,
      notes
    ) VALUES (
      ${input.customer_id},
      ${input.address_id},
      'pendente',
      ${input.subtotal},
      ${deliveryFee},
      ${total},
      ${input.notes ?? null}
    )
    RETURNING *
  `
  return rows[0] as Order
}

// Atualiza um pedido existente (Update)
export async function updateOrder(
  id:    string,
  input: UpdateOrderInput
): Promise<Order | null> {
  const status = input.status ?? null

  const rows = await sql`
    UPDATE orders
    SET
      customer_id         = COALESCE(${input.customer_id         ?? null}, customer_id),
      address_id          = COALESCE(${input.address_id          ?? null}, address_id),
      status              = COALESCE(${status}, status),
      subtotal            = COALESCE(${input.subtotal            ?? null}, subtotal),
      delivery_fee        = COALESCE(${input.delivery_fee        ?? null}, delivery_fee),
      total               = (
                            COALESCE(${input.subtotal     ?? null}, subtotal) +
                            COALESCE(${input.delivery_fee ?? null}, delivery_fee)
                          ),
      notes               = COALESCE(${input.notes               ?? null}, notes),
      cancellation_reason = COALESCE(${input.cancellation_reason ?? null}, cancellation_reason),
      cancelled_by        = COALESCE(${input.cancelled_by        ?? null}, cancelled_by),
      confirmed_at        = CASE
                              WHEN ${status} = 'confirmado'
                              THEN COALESCE(confirmed_at, NOW())
                              ELSE confirmed_at
                            END,
      preparing_at        = CASE
                              WHEN ${status} = 'em_preparo'
                              THEN COALESCE(preparing_at, NOW())
                              ELSE preparing_at
                            END,
      dispatched_at       = CASE
                              WHEN ${status} = 'saindo'
                              THEN COALESCE(dispatched_at, NOW())
                              ELSE dispatched_at
                            END,
      delivered_at        = CASE
                              WHEN ${status} = 'entregue'
                              THEN COALESCE(delivered_at, NOW())
                              ELSE delivered_at
                            END,
      cancelled_at        = CASE
                              WHEN ${status} = 'cancelado'
                              THEN COALESCE(cancelled_at, NOW())
                              ELSE cancelled_at
                            END,
      updated_at          = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return (rows[0] as Order | undefined) ?? null
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pendente',
  'confirmado',
  'em_preparo',
  'saindo',
  'entregue',
  'cancelado',
]
