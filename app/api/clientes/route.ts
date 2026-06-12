// app/api/clientes/route.ts
import { NextResponse } from 'next/server'
import {
  getAllCustomers,
  createCustomer,
} from '@/lib/database/queries/customer'
import type { CreateCustomerInput } from '@/types/database'

// GET /api/clientes
export async function GET() {
  try {
    const customers = await getAllCustomers()
    return NextResponse.json(customers)
  } catch (error) {
    console.error('[GET /api/clientes]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    )
  }
}

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
