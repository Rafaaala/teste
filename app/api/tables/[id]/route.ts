// app/api/tables/[id]/route.ts
import { NextResponse } from 'next/server'
import {
  getTableById,
  updateTable,
  deleteTable,
} from '@/lib/database/queries/tables'
import type { UpdateTableInput } from '@/types/database'
import { TABLE_STATUSES } from '@/lib/database/queries/tables'

// GET /api/tables/:id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const table = await getTableById(params.id)

    if (!table) {
      return NextResponse.json(
        { error: 'Mesa não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(table)
  } catch (error) {
    console.error('[GET /api/tables/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar mesa' },
      { status: 500 }
    )
  }
}

// PATCH /api/tables/:id
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateTableInput = await req.json()

    if (body.number !== undefined && body.number <= 0) {
      return NextResponse.json(
        { error: 'Número da mesa deve ser maior que zero' },
        { status: 400 }
      )
    }

    if (body.capacity !== undefined && body.capacity <= 0) {
      return NextResponse.json(
        { error: 'Capacidade deve ser maior que zero' },
        { status: 400 }
      )
    }

    if (body.status && !TABLE_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Status inválido. Use: ${TABLE_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const table = await updateTable(params.id, body)

    if (!table) {
      return NextResponse.json(
        { error: 'Mesa não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(table)
  } catch (error) {
    console.error('[PATCH /api/tables/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar mesa' },
      { status: 500 }
    )
  }
}

// DELETE /api/tables/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteTable(params.id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Mesa não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/tables/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao deletar mesa' },
      { status: 500 }
    )
  }
}
