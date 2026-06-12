import { NextResponse }             from 'next/server'
import { requireAuth }              from '@/lib/auth/require-auth'
import { getSessionById }           from '@/lib/database/queries/sessions'
import {
  getSessionItemById,
  cancelSessionItem,
} from '@/lib/database/queries/session-items'
import { recalculateSessionTotals } from '@/lib/database/queries/sessions'

// PATCH /api/sessions/:id/itens/:itemId — apenas cancelamento
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const auth = await requireAuth(['admin', 'gerente'])
  if (auth.response) return auth.response

  try {
    const session = await getSessionById(params.id)
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      )
    }

    const item = await getSessionItemById(params.itemId)
    if (!item || item.session_id !== params.id) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    if (item.status === 'cancelado') {
      return NextResponse.json(
        { error: 'Item já está cancelado' },
        { status: 422 }
      )
    }

    const body = await req.json()

    if (!body.cancel_reason?.trim()) {
      return NextResponse.json(
        { error: 'Motivo do cancelamento é obrigatório' },
        { status: 400 }
      )
    }

    const updated = await cancelSessionItem(params.itemId, {
      cancel_reason: body.cancel_reason,
      cancelled_by:  auth.user.id,
    })

    // Recalcula totais após cancelamento
    await recalculateSessionTotals(params.id)

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/sessions/:id/itens/:itemId]', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar item' },
      { status: 500 }
    )
  }
}