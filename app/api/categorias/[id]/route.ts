// app/api/categorias/[id]/route.ts
import { NextResponse } from 'next/server'
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '@/lib/database/queries/categories'
import type { UpdateCategoryInput } from '@/types/database'

// GET /api/categorias/:id 
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const category = await getCategoryById(params.id)

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('[GET /api/categorias/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categoria' },
      { status: 500 }
    )
  }
}

// PATCH /api/categorias/:id
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateCategoryInput = await req.json()
    const category = await updateCategory(params.id, body)

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('[PATCH /api/categorias/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    )
  }
}

// DELETE /api/categorias/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteCategory(params.id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/categorias/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao deletar categoria' },
      { status: 500 }
    )
  }
}