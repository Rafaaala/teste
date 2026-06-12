// app/api/tables/route.ts
import { NextResponse } from 'next/server'
import {
  getActiveTables,
  getAllTables,
  createTable,
} from '@/lib/database/queries/tables'
import type { CreateTableInput } from '@/types/database'
import { TABLE_STATUSES } from '@/lib/database/queries/tables'

// GET /api/tables
// Query param ?all=true retorna inativas também (admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'

    const tables = all ? await getAllTables() : await getActiveTables()

    return NextResponse.json(tables)
  } catch (error) {
    console.error('[GET /api/tables]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar mesas' },
      { status: 500 }
    )
  }
}

// POST /api/tables
export async function POST(req: Request) {
  try {
    const body: CreateTableInput = await req.json()

    if (!body.number || body.number <= 0) {
      return NextResponse.json(
        { error: 'Número da mesa é obrigatório e deve ser maior que zero' },
        { status: 400 }
      )
    }

    if (!body.capacity || body.capacity <= 0) {
      return NextResponse.json(
        { error: 'Capacidade é obrigatória e deve ser maior que zero' },
        { status: 400 }
      )
    }

    if (body.status && !TABLE_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: 'Status inválido. Use: livre, ocupada ou reservada' },
        { status: 400 }
      )
    }

    const table = await createTable(body)
    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error('[POST /api/tables]', error)
    return NextResponse.json(
      { error: 'Erro ao criar mesa' },
      { status: 500 }
    )
  }
}
