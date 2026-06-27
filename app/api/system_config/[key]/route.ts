// app/api/system_config/[key]/route.ts
import { NextResponse } from 'next/server'
import {
  getSystemConfigByKey,
  updateSystemConfig,
  parseConfigValue,
} from '@/lib/database/queries/system-config'
import type { UpdateSystemConfigInput } from '@/types/database'

function decodeKey(key: string): string {
  return decodeURIComponent(key)
}

// GET /api/system_config/:key
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: keyValue } = await params
    const key = decodeKey(keyValue)
    const config = await getSystemConfigByKey(key)

    if (!config) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('[GET /api/system_config/:key]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configuração' },
      { status: 500 }
    )
  }
}

// PATCH /api/system_config/:key
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: keyValue } = await params
    const key = decodeKey(keyValue)
    const existing = await getSystemConfigByKey(key)

    if (!existing) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 }
      )
    }

    const body: UpdateSystemConfigInput = await req.json()

    if (body.value === undefined && body.description === undefined) {
      return NextResponse.json(
        { error: 'Informe value e/ou description para atualizar' },
        { status: 400 }
      )
    }

    let value: UpdateSystemConfigInput['value'] | undefined
    if (body.value !== undefined) {
      const parsed = parseConfigValue(body.value)
      if (parsed === null) {
        return NextResponse.json(
          { error: 'Valor deve ser JSON válido (string, número, boolean, array ou objeto)' },
          { status: 400 }
        )
      }
      value = parsed
    }

    // TODO: substituir pelo ID do usuário autenticado (UUID em users)
    const payload: UpdateSystemConfigInput = {
      ...body,
      ...(value !== undefined && { value }),
      updated_by: body.updated_by ?? null,
    }

    const config = await updateSystemConfig(key, payload)

    if (!config) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('[PATCH /api/system_config/:key]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configuração' },
      { status: 500 }
    )
  }
}

