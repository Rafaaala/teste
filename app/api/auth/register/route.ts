import { NextResponse } from 'next/server'
import { getNextAuthSession } from '@/lib/nextAuth'
import {
  getCustomerById,
  getCustomerByPhone,
  getCustomerByEmail,
  createCustomer,
  updateCustomer,
} from '@/lib/database/queries/customer'
import type { CreateCustomerInput, UpdateCustomerInput } from '@/types/database'

export async function POST(req: Request) {
  try {
    // If there's an existing session, prefer that userId; otherwise allow registration flow
    const session = await getNextAuthSession(req)
    const body = (await req.json()) as CreateCustomerInput
    const name = body.name?.trim()
    const phone = body.phone?.trim()
    const email = body.email?.trim()?.toLowerCase()

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Telefone ou email são necessários' },
        { status: 400 }
      )
    }

    const normalizedPhone = phone ? phone.replace(/\D/g, '') : null

    let customer = null
    if (session?.userId) {
      customer = await getCustomerById(session.userId)
    }

    if (!customer && normalizedPhone) {
      customer = await getCustomerByPhone(normalizedPhone)
    }

    if (!customer && email) {
      customer = await getCustomerByEmail(email)
    }

    const updateInput: UpdateCustomerInput = {
      name,
      phone: normalizedPhone ?? undefined,
      email,
    }

    if (customer) {
      const updatedCustomer = await updateCustomer(customer.id, updateInput)
      return NextResponse.json(updatedCustomer)
    }

    const createInput: CreateCustomerInput = {
      name,
      phone: normalizedPhone ?? undefined,
      email,
    }

    const newCustomer = await createCustomer(createInput)
    return NextResponse.json(newCustomer, { status: 201 })
  } catch (error) {
    console.error('[POST /api/auth/register]', error)
    return NextResponse.json({ error: 'Erro ao registrar cliente' }, { status: 500 })
  }
}
