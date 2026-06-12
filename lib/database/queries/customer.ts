// lib/database/queries/customer.ts
import { sql } from '@/lib/database'
import type {
  Address,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from '@/types/database'

// Busca todos os clientes (GetAll)
export async function getCustomerByEmail(
  email: string
): Promise<Customer | null> {
  const rows = await sql`
    SELECT *
    FROM customers
    WHERE email = ${email}
    LIMIT 1
  `
  return (rows[0] as Customer | undefined) ?? null
}


// Busca um cliente por ID (GetById)
export async function getCustomerById(
  id: string
): Promise<Customer | null> {
  const rows = await sql`
    SELECT *
    FROM customers
    WHERE id = ${id}
    LIMIT 1
  `
  return (rows[0] as Customer | undefined) ?? null
}

export async function getCustomerByPhone(
  phone: string
): Promise<Customer | null> {
  const rows = await sql`
    SELECT *
    FROM customers
    WHERE phone = ${phone}
    LIMIT 1
  `
  return (rows[0] as Customer | undefined) ?? null
}

// Retorna o customer com seus endereços já inclusos
export async function getCustomerWithAddressesByPhone(
  phone: string
): Promise<(Customer & { addresses: Address[] }) | null> {
  const customerRows = await sql`
    SELECT *
    FROM customers
    WHERE phone = ${phone}
    LIMIT 1
  `

  if (!customerRows[0]) return null

  const customer = customerRows[0] as Customer

  const addressRows = await sql`
    SELECT *
    FROM addresses
    WHERE customer_id = ${customer.id}
    ORDER BY created_at DESC
  `

  return {
    ...customer,
    addresses: addressRows as Address[],
  }
}

// Cria um novo cliente (Create)
export async function createCustomer(
  input: CreateCustomerInput
): Promise<Customer> {
  const rows = await sql`
    INSERT INTO customers (
      name,
      phone,
      cpf
    ) VALUES (
      ${input.name},
      ${input.phone},
      ${input.cpf ?? null}
    )
    RETURNING *
  `
  return rows[0] as Customer
}

// Atualiza um cliente existente (Update)
export async function updateCustomer(
  id:    string,
  input: UpdateCustomerInput
): Promise<Customer | null> {
  const rows = await sql`
    UPDATE customers
    SET
      name          = COALESCE(${input.name  ?? null}, name),
      phone         = COALESCE(${input.phone ?? null}, phone),
      cpf           = COALESCE(${input.cpf   ?? null}, cpf),
      updated_at    = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return (rows[0] as Customer | undefined) ?? null
}

// ------------------------------------------------------------

