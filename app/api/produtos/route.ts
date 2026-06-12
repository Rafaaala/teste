// app/api/produtos/route.ts
import { NextResponse } from 'next/server'
import {
  getAllProducts,
  createProduct,
} from '@/lib/database/queries/products'
import type { CreateProductInput } from '@/types/database'

// GET /api/produtos (admin)
export async function GET() {
  try {
    const products = await getAllProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error('[GET /api/produtos]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

// POST /api/produtos (admin)
export async function POST(req: Request) {
  try {
    const body: CreateProductInput = await req.json()

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    if (!body.price || body.price <= 0) {
      return NextResponse.json(
        { error: 'Preço deve ser maior que zero' },
        { status: 400 }
      )
    }

    if (!body.category_id) {
      return NextResponse.json(
        { error: 'Categoria é obrigatória' },
        { status: 400 }
      )
    }

    // TODO: substituir pelo ID do usuário autenticado
    // quando o Auth.js estiver pronto
    const TEMP_USER_ID = 'system'

    const product = await createProduct(body, TEMP_USER_ID)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('[POST /api/produtos]', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}