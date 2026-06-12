import { sql } from '@/lib/database'
import type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from '@/types/database'

// Busca todos os endereços (GetAll)
export async function getAllAddresses(): Promise<Address[]> {
  const rows = await sql`
    SELECT *
    FROM addresses
    ORDER BY city ASC, street ASC
  `
  return rows as Address[]
}

// Contagem total para paginação
export async function countAllAddresses(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM addresses
  `
  return Number((rows[0] as { count: number }).count)
}

// Lista paginada (mesma ordenação de getAllAddresses)
export async function getAllAddressesPaginated(
  limit: number,
  offset: number
): Promise<Address[]> {
  const rows = await sql`
    SELECT *
    FROM addresses
    ORDER BY city ASC, street ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `
  return rows as Address[]
}

// Busca endereços de um cliente (GetByCustomerId)
export async function getAddressesByCustomerId(
  customerId: string
): Promise<Address[]> {
  const rows = await sql`
    SELECT *
    FROM addresses
    WHERE customer_id = ${customerId}
    ORDER BY street ASC, number ASC
  `
  return rows as Address[]
}

// Busca um endereço por ID (GetById)
export async function getAddressById(
  id: string
): Promise<Address | null> {
  const rows = await sql`
    SELECT *
    FROM addresses
    WHERE id = ${id}
    LIMIT 1
  `
  return (rows[0] as Address | undefined) ?? null
}

// Cria um novo endereço (Create)
export async function createAddress(
  input: CreateAddressInput
): Promise<Address> {
  const rows = await sql`
    INSERT INTO addresses (
      customer_id,
      zip_code,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      latitude,
      longitude
    ) VALUES (
      ${input.customer_id},
      ${input.zip_code},
      ${input.street},
      ${input.number},
      ${input.complement   ?? null},
      ${input.neighborhood},
      ${input.city},
      ${input.state},
      ${input.latitude     ?? null},
      ${input.longitude    ?? null}
    )
    RETURNING *
  `
  return rows[0] as Address
}

// Atualiza um endereço existente (Update)
export async function updateAddress(
  id:    string,
  input: UpdateAddressInput
): Promise<Address | null> {
  const rows = await sql`
    UPDATE addresses
    SET
      customer_id  = COALESCE(${input.customer_id  ?? null}, customer_id),
      zip_code     = COALESCE(${input.zip_code     ?? null}, zip_code),
      street       = COALESCE(${input.street       ?? null}, street),
      number       = COALESCE(${input.number       ?? null}, number),
      complement   = COALESCE(${input.complement   ?? null}, complement),
      neighborhood = COALESCE(${input.neighborhood ?? null}, neighborhood),
      city         = COALESCE(${input.city         ?? null}, city),
      state        = COALESCE(${input.state        ?? null}, state),
      latitude     = COALESCE(${input.latitude     ?? null}, latitude),
      longitude    = COALESCE(${input.longitude    ?? null}, longitude)
    WHERE id = ${id}
    RETURNING *
  `
  return (rows[0] as Address | undefined) ?? null
}
