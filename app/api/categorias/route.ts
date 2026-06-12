// app/api/categorias/route.ts
import { NextResponse } from 'next/server'
import {
  getActiveCategories,
  getAllCategories,
  createCategory,
} from '@/lib/database/queries/categories'
import type { CreateCategoryInput } from '@/types/database'

// GET /api/categorias
// Query param ?all=true retorna inativas também (admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'

    const categories = all
      ? await getAllCategories()
      : await getActiveCategories()

    return NextResponse.json(categories)
  } catch (error) {
    console.error('[GET /api/categorias]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    )
  }
}

// POST /api/categorias
export async function POST(req: Request) {
  try {
    const body: CreateCategoryInput = await req.json()

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const category = await createCategory(body)
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('[POST /api/categorias]', error)
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    )
  }
}