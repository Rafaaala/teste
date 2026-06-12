import { geocodeAddress } from '@/lib/geolocation/geocode'

// Mock do fetch global — evita chamadas reais ao Nominatim nos testes
global.fetch = jest.fn()

describe('geocodeAddress', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna coordenadas quando Nominatim responde com sucesso', async () => {
    const mockResponse = [
      { lat: '-7.3106', lon: '-35.3175' }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    const resultado = await geocodeAddress(
      'Rua Teste', '123', 'Itabaiana', 'PB'
    )

    expect(resultado).not.toBeNull()
    expect(resultado?.latitude).toBeCloseTo(-7.3106, 4)
    expect(resultado?.longitude).toBeCloseTo(-35.3175, 4)
  })

  it('retorna null quando Nominatim não encontra o endereço', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],  // array vazio = endereço não encontrado
    })

    const resultado = await geocodeAddress(
      'Rua Inexistente', '999', 'Cidade Fantasma', 'XX'
    )

    expect(resultado).toBeNull()
  })

  it('constrói a query corretamente', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [{ lat: '-7.31', lon: '-35.31' }],
    })

    await geocodeAddress('Rua A', '1', 'Itabaiana', 'PB')

    const urlChamada = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(urlChamada).toContain('nominatim.openstreetmap.org')
    expect(urlChamada).toContain('Itabaiana')
    expect(urlChamada).toContain('Brasil')
  })
})