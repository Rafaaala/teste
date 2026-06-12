import { sql } from '@/lib/database'
import type {
  Table,
  TablePublic,
  CreateTableInput,
  UpdateTableInput,
  TableStatus,
} from '@/types/database'

// Enum
export const TABLE_STATUSES: TableStatus[] = [
  'disponivel',
  'ocupada',
  'bloqueada',
]

// Busca todas as mesas ativas (GetAllActive)
export async function getActiveTables(): Promise<TablePublic[]> {
  const rows = await sql`
    SELECT
      id,
      number,
      capacity,
      status
    FROM tables
    WHERE is_active  = TRUE
      AND deleted_at IS NULL
    ORDER BY number ASC
  `
  return rows as TablePublic[]
}

// Busca todas as mesas ativas e inativas (GetAll)
export async function getAllTables(): Promise<Table[]> {
  const rows = await sql`
    SELECT *
    FROM tables
    WHERE deleted_at IS NULL
    ORDER BY number ASC
  `
  return rows as Table[]
}

// Busca uma mesa por ID (GetById)
export async function getTableById(
  id: string
): Promise<Table | null> {
  const rows = await sql`
    SELECT *
    FROM tables
    WHERE id         = ${id}
      AND deleted_at IS NULL
    LIMIT 1
  `
  return (rows[0] as Table | undefined) ?? null
}

// Cria uma nova mesa (Create)
export async function createTable(
  input: CreateTableInput
): Promise<Table> {
  const rows = await sql`
    INSERT INTO tables (
      number,
      capacity,
      status,
      is_active
    ) VALUES (
      ${input.number},
      ${input.capacity},
      ${input.status    ?? 'disponivel'},
      ${input.is_active ?? true}
    )
    RETURNING *
  `
  return rows[0] as Table
}

// Atualiza uma mesa existente (Update)
export async function updateTable(
  id:    string,
  input: UpdateTableInput
): Promise<Table | null> {
  const rows = await sql`
    UPDATE tables
    SET
      number     = COALESCE(${input.number    ?? null}, number),
      capacity   = COALESCE(${input.capacity  ?? null}, capacity),
      status     = COALESCE(${input.status    ?? null}, status),
      is_active  = COALESCE(${input.is_active ?? null}, is_active),
      updated_at = NOW()
    WHERE id         = ${id}
      AND deleted_at IS NULL
    RETURNING *
  `
  return (rows[0] as Table | undefined) ?? null
}

// Soft delete — não apaga fisicamente (Delete)
export async function deleteTable(
  id: string
): Promise<boolean> {
  const rows = await sql`
    UPDATE tables
    SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE id         = ${id}
      AND deleted_at IS NULL
    RETURNING id
  `
  return rows.length > 0
}
