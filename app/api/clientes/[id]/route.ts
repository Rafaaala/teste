// app/api/clientes/[id]/route.ts
import { NextResponse } from 'next/server'
import {
  getCustomerById,
  updateCustomer,
} from '@/lib/database/queries/customer'
import type { UpdateCustomerInput } from '@/types/database'

// GET /api/clientes/:id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await getCustomerById(params.id)

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('[GET /api/clientes/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    )
  }
}

// PATCH /api/clientes/:id
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateCustomerInput = await req.json()
    const customer = await updateCustomer(params.id, body)

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('[PATCH /api/clientes/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    )
  }
}