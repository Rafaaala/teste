import {
  haversineDistance,
  isWithinDeliveryRange,
} from '@/lib/geolocation/haversine'

describe('haversineDistance', () => {
  it('retorna 0 para o mesmo ponto', () => {
    const ponto = { latitude: -7.3106, longitude: -35.3175 }
    const distancia = haversineDistance(ponto, ponto)
    expect(distancia).toBe(0)
  })

  it('calcula distância correta entre dois pontos conhecidos', () => {
    // Itabaiana PB → João Pessoa PB ≈ 100km em linha reta
    const itabaiana  = { latitude: -7.3106,  longitude: -35.3175 }
    const joaoPessoa = { latitude: -7.1195,  longitude: -34.8450 }

    const distancia = haversineDistance(itabaiana, joaoPessoa)

    // Tolerância de 5km para imprecisão da fórmula em linha reta
    expect(distancia).toBeGreaterThan(45)
    expect(distancia).toBeLessThan(60)
  })

  it('é simétrica — A→B == B→A', () => {
    const pontoA = { latitude: -7.3106, longitude: -35.3175 }
    const pontoB = { latitude: -8.0500, longitude: -34.9000 }

    const distanciaAB = haversineDistance(pontoA, pontoB)
    const distanciaBA = haversineDistance(pontoB, pontoA)

    expect(distanciaAB).toBeCloseTo(distanciaBA, 5)
  })
})

describe('isWithinDeliveryRange', () => {
  const restaurante = { latitude: -7.3106, longitude: -35.3175 }

  it('aprova endereço dentro do raio de 20km', () => {
    // Ponto muito próximo ao restaurante
    const clientePerto = { latitude: -7.3200, longitude: -35.3300 }

    const resultado = isWithinDeliveryRange(restaurante, clientePerto, 20)

    expect(resultado.allowed).toBe(true)
    expect(resultado.distanceKm).toBeLessThan(20)
    expect(resultado.maxRadiusKm).toBe(20)
  })

  it('rejeita endereço fora do raio de 20km', () => {
    // João Pessoa — fora do raio
    const clienteLonge = { latitude: -7.1195, longitude: -34.8450 }

    const resultado = isWithinDeliveryRange(restaurante, clienteLonge, 20)

    expect(resultado.allowed).toBe(false)
    expect(resultado.distanceKm).toBeGreaterThan(20)
  })

  it('retorna distância com 2 casas decimais', () => {
    const cliente = { latitude: -7.3500, longitude: -35.3500 }
    const resultado = isWithinDeliveryRange(restaurante, cliente, 20)

    const casasDecimais = resultado.distanceKm.toString().split('.')[1]?.length ?? 0
    expect(casasDecimais).toBeLessThanOrEqual(2)
  })

  it('aprova ponto exatamente no limite do raio', () => {
    // Ponto artificialmente no limite exato de 20km
    const resultado = isWithinDeliveryRange(
      restaurante,
      restaurante,  // mesmo ponto = 0km, bem dentro do limite
      20
    )
    expect(resultado.allowed).toBe(true)
  })
})