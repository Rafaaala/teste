// app/api/enderecos/[id]/route.ts
import { NextResponse } from 'next/server'
import { getCustomerById } from '@/lib/database/queries/customer'
import {
  getAddressById,
  updateAddress,
} from '@/lib/database/queries/addresses'
import type { UpdateAddressInput } from '@/types/database'

// GET /api/enderecos/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const address = await getAddressById(id)

    if (!address) {
      return NextResponse.json(
        { error: 'Endereço não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(address)
  } catch (error) {
    console.error('[GET /api/enderecos/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar endereço' },
      { status: 500 }
    )
  }
}

// PATCH /api/enderecos/:id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateAddressInput = await req.json()

    if (body.customer_id) {
      const customer = await getCustomerById(body.customer_id)
      if (!customer) {
        return NextResponse.json(
          { error: 'Cliente não encontrado' },
          { status: 404 }
        )
      }
    }

    if (body.state !== undefined) {
      if (!body.state.trim()) {
        return NextResponse.json(
          { error: 'Estado não pode ser vazio' },
          { status: 400 }
        )
      }
      if (body.state.trim().length !== 2) {
        return NextResponse.json(
          { error: 'Estado deve ser a sigla UF com 2 caracteres' },
          { status: 400 }
        )
      }
    }

    const payload: UpdateAddressInput = {
      ...body,
      ...(body.state && { state: body.state.trim().toUpperCase() }),
    }

    const address = await updateAddress(id, payload)

    if (!address) {
      return NextResponse.json(
        { error: 'Endereço não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(address)
  } catch (error) {
    console.error('[PATCH /api/enderecos/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar endereço' },
      { status: 500 }
    )
  }
}
