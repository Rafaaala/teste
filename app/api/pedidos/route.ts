// app/api/pedidos/route.ts
import { NextResponse } from 'next/server'
import { getCustomerById } from '@/lib/database/queries/customer'
import { getAddressById } from '@/lib/database/queries/addresses'
import { getSystemConfigByKey } from '@/lib/database/queries/system-config'
import {
  getAllOrders,
  getOrdersByCustomerId,
  createOrder,
} from '@/lib/database/queries/orders'
import { isWithinDeliveryRange } from '@/lib/geolocation/haversine'
import { validateCustomerAndAddress } from '@/lib/database/validate-order-deps'
import type { CreateOrderInput } from '@/types/database'

// GET /api/pedidos
// Query param ?customer_id=uuid filtra por cliente
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customer_id')

    if (customerId) {
      const customer = await getCustomerById(customerId)
      if (!customer) {
        return NextResponse.json(
          { error: 'Cliente não encontrado' },
          { status: 404 }
        )
      }

      const orders = await getOrdersByCustomerId(customerId)
      return NextResponse.json(orders)
    }

    const orders = await getAllOrders()
    return NextResponse.json(orders)
  } catch (error) {
    console.error('[GET /api/pedidos]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}

// POST /api/pedidos
export async function POST(req: Request) {
  try {
    let body: CreateOrderInput

    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: 'Body da requisição inválido ou ausente' },
        { status: 400 }
      )
    }

    if (!body.customer_id || !body.address_id) {
      return NextResponse.json(
        { error: 'Cliente e endereço são obrigatórios' },
        { status: 400 }
      )
    }

    if (body.subtotal === undefined || body.subtotal < 0) {
      return NextResponse.json(
        { error: 'Subtotal é obrigatório e deve ser maior ou igual a zero' },
        { status: 400 }
      )
    }

    if (body.delivery_fee !== undefined && body.delivery_fee < 0) {
      return NextResponse.json(
        { error: 'Taxa de entrega deve ser maior ou igual a zero' },
        { status: 400 }
      )
    }

    const deps = await validateCustomerAndAddress(
      body.customer_id,
      body.address_id
    )
    if (!deps.ok) {
      return NextResponse.json(
        { error: deps.error },
        { status: deps.status }
      )
    }

    const [latConfig, lngConfig] = await Promise.all([
      getSystemConfigByKey('restaurant_lat'),
      getSystemConfigByKey('restaurant_lng'),
    ])

    if (!latConfig || !lngConfig) {
      return NextResponse.json(
        { error: 'Coordenadas do restaurante não configuradas' },
        { status: 500 }
      )
    }

    const address = await getAddressById(body.address_id)

    if (!address?.latitude || !address?.longitude) {
      return NextResponse.json(
        { error: 'Endereço sem coordenadas. Informe latitude e longitude.' },
        { status: 400 }
      )
    }

    const radiusConfig = await getSystemConfigByKey('delivery_radius_km')
    const maxRadiusKm = Number(radiusConfig?.value ?? 10)

    const rangeResult = isWithinDeliveryRange(
      {
        latitude: Number(latConfig.value),
        longitude: Number(lngConfig.value),
      },
      {
        latitude: address.latitude,
        longitude: address.longitude,
      },
      maxRadiusKm
    )

    if (!rangeResult.allowed) {
      return NextResponse.json(
        {
          error:
            `Endereço fora da área de entrega. Distância: ${rangeResult.distanceKm}km. Máximo permitido: ${rangeResult.maxRadiusKm}km.`,
        },
        { status: 422 }
      )
    }

    const order = await createOrder(body)
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('[POST /api/pedidos]', error)
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 500 }
    )
  }
}
