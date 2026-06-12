// app/api/clientes/telefone/[phone]/route.ts
import { NextResponse } from 'next/server'
import { getCustomerWithAddressesByPhone } from '@/lib/database/queries/customer'

// GET /api/clientes/telefone/:phone
// Chamado no checkout assim que o cliente termina de digitar o telefone
export async function GET(
  _req: Request,
  { params }: { params: { phone: string } }
) {
  try {
    const phone = params.phone.trim()

    if (!phone) {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      )
    }

    const customer = await getCustomerWithAddressesByPhone(phone)

    // Cliente não encontrado — retorna null sem erro
    // O frontend trata esse caso pedindo os dados completos
    if (!customer) {
      return NextResponse.json({ customer: null })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('[GET /api/clientes/telefone/:phone]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    )
  }
}