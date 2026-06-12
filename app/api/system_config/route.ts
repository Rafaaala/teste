// app/api/system_config/route.ts
import { NextResponse } from 'next/server'
import {
  getAllSystemConfig,
  createSystemConfig,
  isValidConfigKey,
  parseConfigValue,
} from '@/lib/database/queries/system-config'
import type { CreateSystemConfigInput } from '@/types/database'

// GET /api/system_config
export async function GET() {
  try {
    const configs = await getAllSystemConfig()
    return NextResponse.json(configs)
  } catch (error) {
    console.error('[GET /api/system_config]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

// POST /api/system_config
export async function POST(req: Request) {
  try {
    const body: CreateSystemConfigInput = await req.json()

    if (!body.key?.trim()) {
      return NextResponse.json(
        { error: 'Chave é obrigatória' },
        { status: 400 }
      )
    }

    if (!isValidConfigKey(body.key)) {
      return NextResponse.json(
        {
          error:
            'Chave inválida. Use letras minúsculas, números e underscore (máx. 80 caracteres)',
        },
        { status: 400 }
      )
    }

    const value = parseConfigValue(body.value)
    if (value === null) {
      return NextResponse.json(
        { error: 'Valor é obrigatório e deve ser JSON válido' },
        { status: 400 }
      )
    }

    const config = await createSystemConfig({
      ...body,
      value,
    })
    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    console.error('[POST /api/system_config]', error)
    return NextResponse.json(
      { error: 'Erro ao criar configuração' },
      { status: 500 }
    )
  }
}
