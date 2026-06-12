// lib/geolocation/haversine.ts

const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export interface Coordinates {
  latitude:  number
  longitude: number
}


// Calcula a distância em km entre dois pontos geográficos usando a fórmula de Haversine.
export function haversineDistance(
  origin:      Coordinates,
  destination: Coordinates
): number {
  const dLat = toRadians(destination.latitude  - origin.latitude)
  const dLon = toRadians(destination.longitude - origin.longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.latitude))  *
    Math.cos(toRadians(destination.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

//Verifica se um endereço está dentro do raio de entrega e retorna a distância calculada junto com o resultado
export interface DeliveryRangeResult {
  allowed:      boolean
  distanceKm:   number
  maxRadiusKm:  number
}

export function isWithinDeliveryRange(
  restaurantCoords: Coordinates,
  customerCoords:   Coordinates,
  maxRadiusKm:      number
): DeliveryRangeResult {
  const distanceKm = haversineDistance(restaurantCoords, customerCoords)

  return {
    allowed:     distanceKm <= maxRadiusKm,
    distanceKm:  parseFloat(distanceKm.toFixed(2)),
    maxRadiusKm,
  }
}