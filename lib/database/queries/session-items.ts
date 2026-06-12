import { sql } from '@/lib/database'
import type { ItemStatus } from '@/types/database'

export interface SessionItem {
  id:             string
  session_id:     string
  product_id:     string
  product_name:   string
  product_price:  number
  quantity:       number
  notes:          string | null
  status:         ItemStatus
  added_by:       string
  cancelled_by:   string | null
  cancel_reason:  string | null
  created_at:     Date
  updated_at:     Date
}

export interface CreateSessionItemInput {
  session_id:     string
  product_id:     string
  product_name:   string
  product_price:  number
  quantity:       number
  added_by:       string
  notes?:         string
}

export interface UpdateSessionItemInput {
  status?:        ItemStatus
  cancel_reason?: string
  cancelled_by?:  string
}

// Busca itens de uma sessão
export async function getSessionItemsBySessionId(
  sessionId: string
): Promise<SessionItem[]> {
  const rows = await sql`
    SELECT *
    FROM session_items
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
  `
  return rows as SessionItem[]
}

// Busca item por ID
export async function getSessionItemById(
  id: string
): Promise<SessionItem | null> {
  const rows = await sql`
    SELECT *
    FROM session_items
    WHERE id = ${id}
    LIMIT 1
  `
  return (rows[0] as SessionItem | undefined) ?? null
}

// Adiciona item à comanda
export async function createSessionItem(
  input: CreateSessionItemInput
): Promise<SessionItem> {
  const rows = await sql`
    INSERT INTO session_items (
      session_id,
      product_id,
      product_name,
      product_price,
      quantity,
      notes,
      added_by
    ) VALUES (
      ${input.session_id},
      ${input.product_id},
      ${input.product_name},
      ${input.product_price},
      ${input.quantity},
      ${input.notes    ?? null},
      ${input.added_by}
    )
    RETURNING *
  `
  return rows[0] as SessionItem
}

// Cancela um item
export async function cancelSessionItem(
  id:    string,
  input: UpdateSessionItemInput
): Promise<SessionItem | null> {
  const rows = await sql`
    UPDATE session_items
    SET
      status        = 'cancelado',
      cancel_reason = ${input.cancel_reason ?? null},
      cancelled_by  = ${input.cancelled_by  ?? null},
      updated_at    = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return (rows[0] as SessionItem | undefined) ?? null
}