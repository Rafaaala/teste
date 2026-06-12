// app/api/pedidos/validar-localizacao/route.ts
import { NextResponse } from 'next/server'
import { isWithinDeliveryRange } from '@/lib/geolocation/haversine'
import { getSystemConfigByKey }  from '@/lib/database/queries/system-config'
import type { Coordinates }      from '@/lib/geolocation/haversine'

interface ValidateLocationBody {
  latitude:  number
  longitude: number
}

// POST /api/pedidos/validar-localizacao
// Valida se a localização atual do cliente está no raio de entrega
// Não cria nenhum registro no banco
export async function POST(req: Request) {
  try {
    const body: ValidateLocationBody = await req.json()

    if (
      typeof body.latitude  !== 'number' ||
      typeof body.longitude !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Latitude e longitude são obrigatórias' },
        { status: 400 }
      )
    }

    const [latConfig, lngConfig, radiusConfig] = await Promise.all([
      getSystemConfigByKey('restaurant_lat'),
      getSystemConfigByKey('restaurant_lng'),
      getSystemConfigByKey('delivery_radius_km'),
    ])

    if (!latConfig || !lngConfig) {
      return NextResponse.json(
        { error: 'Coordenadas do restaurante não configuradas' },
        { status: 500 }
      )
    }

    const restaurantCoords: Coordinates = {
      latitude:  Number(latConfig.value),
      longitude: Number(lngConfig.value),
    }

    const customerCoords: Coordinates = {
      latitude:  body.latitude,
      longitude: body.longitude,
    }

    const maxRadiusKm = Number(radiusConfig?.value ?? 20)

    const result = isWithinDeliveryRange(
      restaurantCoords,
      customerCoords,
      maxRadiusKm
    )

    return NextResponse.json({
      allowed:     result.allowed,
      distanceKm:  result.distanceKm,
      maxRadiusKm: result.maxRadiusKm,
      message:     result.allowed
        ? `Entrega disponível — ${result.distanceKm}km do restaurante`
        : `Fora da área de entrega — ${result.distanceKm}km (máximo ${result.maxRadiusKm}km)`,
    })
  } catch (error) {
    console.error('[POST /api/pedidos/validar-localizacao]', error)
    return NextResponse.json(
      { error: 'Erro ao validar localização' },
      { status: 500 }
    )
  }
}