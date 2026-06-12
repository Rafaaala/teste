// app/api/cardapio/route.ts
import { NextResponse } from 'next/server'
import { getMenu }      from '@/lib/database/queries/products'

// GET /api/cardapio — público, sem autenticação
export async function GET() {
  try {
    const menu = await getMenu()
    return NextResponse.json(menu)
  } catch (error) {
    console.error('[GET /api/cardapio]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cardápio' },
      { status: 500 }
    )
  }
}