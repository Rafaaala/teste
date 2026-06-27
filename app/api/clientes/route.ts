// app/api/clientes/route.ts
import { NextResponse } from 'next/server'
import {
  createCustomer,
} from '@/lib/database/queries/customer'
import type { CreateCustomerInput } from '@/types/database'

// NOTE: GET endpoint removed - getAllCustomers does not exist in customer.ts
// Use specific queries (getCustomerById, getCustomerByPhone, getCustomerByEmail) instead

// POST /api/clientes
export async function POST(req: Request) {
  try {
    const body: CreateCustomerInput = await req.json()

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const customer = await createCustomer(body)
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('[POST /api/clientes]', error)
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}
