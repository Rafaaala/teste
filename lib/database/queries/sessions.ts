import { sql } from '@/lib/database'

export type SessionStatus =
  | 'aberta'
  | 'fechamento_solicitado'
  | 'fechada'

export interface Session {
  id:                  string
  table_id:            string
  opened_by:           string
  closed_by:           string | null
  guest_count:         number
  status:              SessionStatus
  service_fee_pct:     number
  subtotal:            number
  service_fee:         number
  total:               number
  notes:               string | null
  opened_at:           Date
  close_requested_at:  Date | null
  closed_at:           Date | null
  created_at:          Date
  updated_at:          Date
}

export interface CreateSessionInput {
  table_id:         string
  opened_by:        string
  guest_count?:     number
  service_fee_pct?: number
  notes?:           string
}

export interface UpdateSessionInput {
  status?:              SessionStatus
  guest_count?:         number
  notes?:               string
  closed_by?:           string
  close_requested_at?:  Date
  closed_at?:           Date
}

// Busca todas as sessões abertas
export async function getActiveSessions(): Promise<Session[]> {
  const rows = await sql`
    SELECT s.*, t.number AS table_number
    FROM sessions s
    JOIN tables t ON t.id = s.table_id
    WHERE s.status != 'fechada'
    ORDER BY s.opened_at ASC
  `
  return rows as Session[]
}

// Busca sessão por ID
export async function getSessionById(
  id: string
): Promise<Session | null> {
  const rows = await sql`
    SELECT *
    FROM sessions
    WHERE id = ${id}
    LIMIT 1
  `
  return (rows[0] as Session | undefined) ?? null
}

// Busca sessão aberta de uma mesa
export async function getActiveSessionByTableId(
  tableId: string
): Promise<Session | null> {
  const rows = await sql`
    SELECT *
    FROM sessions
    WHERE table_id = ${tableId}
      AND status  != 'fechada'
    LIMIT 1
  `
  return (rows[0] as Session | undefined) ?? null
}

// Abre uma nova sessão (comanda)
export async function createSession(
  input: CreateSessionInput
): Promise<Session> {
  const rows = await sql`
    INSERT INTO sessions (
      table_id,
      opened_by,
      guest_count,
      service_fee_pct,
      notes
    ) VALUES (
      ${input.table_id},
      ${input.opened_by},
      ${input.guest_count     ?? 1},
      ${input.service_fee_pct ?? 10},
      ${input.notes           ?? null}
    )
    RETURNING *
  `

  // Marca a mesa como ocupada
  await sql`
    UPDATE tables
    SET
      status     = 'ocupada',
      updated_at = NOW()
    WHERE id = ${input.table_id}
  `

  return rows[0] as Session
}

// Atualiza a sessão
export async function updateSession(
  id:    string,
  input: UpdateSessionInput
): Promise<Session | null> {
  const rows = await sql`
    UPDATE sessions
    SET
      status             = COALESCE(${input.status             ?? null}, status),
      guest_count        = COALESCE(${input.guest_count        ?? null}, guest_count),
      notes              = COALESCE(${input.notes              ?? null}, notes),
      closed_by          = COALESCE(${input.closed_by          ?? null}, closed_by),
      close_requested_at = COALESCE(${input.close_requested_at ?? null}, close_requested_at),
      closed_at          = COALESCE(${input.closed_at          ?? null}, closed_at),
      updated_at         = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return (rows[0] as Session | undefined) ?? null
}

// Recalcula totais da sessão após adição/cancelamento de item
export async function recalculateSessionTotals(
  sessionId: string
): Promise<void> {
  await sql`
    UPDATE sessions
    SET
      subtotal   = (
        SELECT COALESCE(SUM(product_price * quantity), 0)
        FROM session_items
        WHERE session_id = ${sessionId}
          AND status    != 'cancelado'
      ),
      service_fee = (
        SELECT COALESCE(SUM(product_price * quantity), 0) * (service_fee_pct / 100)
        FROM session_items
        WHERE session_id = ${sessionId}
          AND status    != 'cancelado'
      ),
      total = (
        SELECT COALESCE(SUM(product_price * quantity), 0) * (1 + service_fee_pct / 100)
        FROM session_items
        WHERE session_id = ${sessionId}
          AND status    != 'cancelado'
      ),
      updated_at = NOW()
    WHERE id = ${sessionId}
  `
}