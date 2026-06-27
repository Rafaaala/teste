import { NextResponse }               from 'next/server'
import { requireAuth }                from '@/lib/auth/require-auth'
import { getSessionById }             from '@/lib/database/queries/sessions'
import {
  getSessionItemsBySessionId,
  createSessionItem,
} from '@/lib/database/queries/session-items'
import { recalculateSessionTotals }   from '@/lib/database/queries/sessions'
import { validateOrderAndProduct }    from '@/lib/database/validate-order-item-deps'

// GET /api/sessions/:id/itens
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req, ['admin', 'gerente', 'garcom'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const session = await getSessionById(id)
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      )
    }

    const items = await getSessionItemsBySessionId(id)
    return NextResponse.json(items)
  } catch (error) {
    console.error('[GET /api/sessions/:id/itens]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar itens' },
      { status: 500 }
    )
  }
}

// POST /api/sessions/:id/itens
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req, ['admin', 'gerente', 'garcom'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const session = await getSessionById(id)
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      )
    }

    if (session.status !== 'aberta') {
      return NextResponse.json(
        { error: 'Não é possível adicionar itens a uma sessão que não está aberta' },
        { status: 422 }
      )
    }

    const body = await req.json()

    if (!body.product_id) {
      return NextResponse.json(
        { error: 'Produto é obrigatório' },
        { status: 400 }
      )
    }

    if (!body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Reutiliza o validator de produto — valida se existe e está ativo
    const deps = await validateOrderAndProduct(id, body.product_id)
    if (!deps.ok) {
      return NextResponse.json(
        { error: deps.error },
        { status: deps.status }
      )
    }

    const item = await createSessionItem({
      session_id:    id,
      product_id:    body.product_id,
      product_name:  deps.product.name,
      product_price: deps.product.price,
      quantity:      body.quantity,
      added_by:      auth.user.id,
      notes:         body.notes,
    })

    // Recalcula totais da sessão
    await recalculateSessionTotals(id)

    // Log simulando impressão na cozinha
    console.log(`
[SESSION] ─────────────────────────────
Mesa: ${session.table_id}
Item adicionado por: ${auth.user.name}
─────────────────────────────────────
${item.quantity}x ${item.product_name}  R$ ${(item.product_price * item.quantity).toFixed(2)}
${item.notes ? `Obs: ${item.notes}` : ''}
─────────────────────────────────────
    `)

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('[POST /api/sessions/:id/itens]', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar item' },
      { status: 500 }
    )
  }
}