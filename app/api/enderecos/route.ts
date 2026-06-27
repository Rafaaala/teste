// app/api/enderecos/route.ts
import { NextResponse } from 'next/server'
import { getCustomerById } from '@/lib/database/queries/customer'
import {
  countAllAddresses,
  getAllAddressesPaginated,
  getAddressesByCustomerId,
  createAddress,
} from '@/lib/database/queries/addresses'
import { geocodeAddress } from '@/lib/geolocation/geocode'
import type { CreateAddressInput } from '@/types/database'

function validateRequiredFields(body: CreateAddressInput): string | null {
  if (!body.zip_code?.trim())     return 'CEP é obrigatório'
  if (!body.street?.trim())       return 'Rua é obrigatória'
  if (!body.number?.trim())       return 'Número é obrigatório'
  if (!body.neighborhood?.trim()) return 'Bairro é obrigatório'
  if (!body.city?.trim())         return 'Cidade é obrigatória'
  if (!body.state?.trim())        return 'Estado é obrigatório'
  if (body.state.trim().length !== 2) {
    return 'Estado deve ser a sigla UF com 2 caracteres'
  }
  return null
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function parsePagination(searchParams: URLSearchParams): {
  page: number
  limit: number
} | { error: string } {
  const pageRaw = searchParams.get('page')
  const limitRaw = searchParams.get('limit')

  const page =
    pageRaw === null || pageRaw === ''
      ? DEFAULT_PAGE
      : Number.parseInt(pageRaw, 10)
  const limit =
    limitRaw === null || limitRaw === ''
      ? DEFAULT_LIMIT
      : Number.parseInt(limitRaw, 10)

  if (!Number.isFinite(page) || page < 1) {
    return { error: 'Parâmetro page deve ser um inteiro maior ou igual a 1' }
  }
  if (!Number.isFinite(limit) || limit < 1 || limit > MAX_LIMIT) {
    return {
      error: `Parâmetro limit deve ser um inteiro entre 1 e ${MAX_LIMIT}`,
    }
  }

  return { page, limit }
}

// GET /api/enderecos
// Query param ?customer_id=uuid filtra por cliente
// Sem customer_id: paginação ?page=1&limit=20 (limit máx. 100)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customer_id')

    // if (customerId) {
    //   const customer = await getCustomerById(customerId)
    //   if (!customer) {
    //     return NextResponse.json(
    //       { error: 'Cliente não encontrado' },
    //       { status: 404 }
    //     )
    //   }

    //   const addresses = await getAddressesByCustomerId(customerId)
    //   return NextResponse.json(addresses)
    // }

    const parsed = parsePagination(searchParams)
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const { page, limit } = parsed
    const offset = (page - 1) * limit

    const [total, data] = await Promise.all([
      countAllAddresses(),
      getAllAddressesPaginated(limit, offset),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      data,
      page,
      limit,
      total,
      totalPages,
    })
  } catch (error) {
    console.error('[GET /api/enderecos]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar endereços' },
      { status: 500 }
    )
  }
}

// POST /api/enderecos
export async function POST(req: Request) {
  try {
    const body: CreateAddressInput = await req.json()

    // if (!body.customer_id) {
    //   return NextResponse.json(
    //     { error: 'Cliente é obrigatório' },
    //     { status: 400 }
    //   )
    // }

    // const customer = await getCustomerById(body.customer_id)
    // if (!customer) {
    //   return NextResponse.json(
    //     { error: 'Cliente não encontrado' },
    //     { status: 404 }
    //   )
    // }

    const validationError = validateRequiredFields(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    let latitude = body.latitude
    let longitude = body.longitude

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      const geocoded = await geocodeAddress(
        body.street,
        body.number,
        body.city,
        body.state
      )

      if (!geocoded) {
        return NextResponse.json(
          {
            error:
              'Não foi possível obter coordenadas para o endereço informado',
          },
          { status: 422 }
        )
      }

      latitude = geocoded.latitude
      longitude = geocoded.longitude
    }

    const address = await createAddress({
      ...body,
      state: body.state.trim().toUpperCase(),
      latitude,
      longitude,
    })
    return NextResponse.json(address, { status: 201 })
  } catch (error) {
    console.error('[POST /api/enderecos]', error)
    return NextResponse.json(
      { error: 'Erro ao criar endereço' },
      { status: 500 }
    )
  }
}
