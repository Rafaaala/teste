import { NextResponse }        from 'next/server'
import { requireAuth }         from '@/lib/auth/require-auth'
import {
  getSessionById,
  updateSession,
} from '@/lib/database/queries/sessions'
import { updateTable }         from '@/lib/database/queries/tables'

// GET /api/sessions/:id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(['admin', 'gerente', 'garcom'])
  if (auth.response) return auth.response

  try {
    const session = await getSessionById(params.id)
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('[GET /api/sessions/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar sessão' },
      { status: 500 }
    )
  }
}

// PATCH /api/sessions/:id
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(['admin', 'gerente'])
  if (auth.response) return auth.response

  try {
    const body = await req.json()

    const existing = await getSessionById(params.id)
    if (!existing) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      )
    }

    if (existing.status === 'fechada') {
      return NextResponse.json(
        { error: 'Sessão já está fechada' },
        { status: 422 }
      )
    }

    const input: Record<string, unknown> = {}

    // Solicitar fechamento
    if (body.status === 'fechamento_solicitado') {
      input.status             = 'fechamento_solicitado'
      input.close_requested_at = new Date()
    }

    // Fechar sessão — apenas gerente/admin
    if (body.status === 'fechada') {
      input.status    = 'fechada'
      input.closed_by = auth.user.id
      input.closed_at = new Date()

      // Libera a mesa
      await updateTable(existing.table_id, { status: 'disponivel' })
    }

    if (body.guest_count !== undefined) input.guest_count = body.guest_count
    if (body.notes       !== undefined) input.notes       = body.notes

    const session = await updateSession(params.id, input as any)

    return NextResponse.json(session)
  } catch (error) {
    console.error('[PATCH /api/sessions/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar sessão' },
      { status: 500 }
    )
  }
}