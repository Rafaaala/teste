import { GET } from '@/app/api/cardapio/route'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'

jest.mock<any>('@/lib/database/queries/products', () => ({
  getMenu: jest.fn(),
}))

import { getMenu } from '@/lib/database/queries/products'

const menuMock = [
  {
    id:          'cat-uuid-1',
    name:        'Entradas',
    description: null,
    sort_order:  1,
    products: [
      {
        id:            'prod-uuid-1',
        category_id:   'cat-uuid-1',
        category_name: 'Entradas',
        name:          'Gyoza',
        description:   '6 unidades',
        price:         24.00,
        image_url:     null,
        sort_order:    1,
      },
    ],
  },
]

describe('GET /api/cardapio', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna o menu agrupado por categoria', async () => {
    ;(getMenu as jest.Mock<any>).mockResolvedValueOnce(menuMock)

    const response = await GET()
    const data     = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe('Entradas')
    expect(data[0].products).toHaveLength(1)
    expect(data[0].products[0].name).toBe('Gyoza')
  })

  it('retorna array vazio quando não há categorias ativas', async () => {
    ;(getMenu as jest.Mock<any>).mockResolvedValueOnce([])

    const response = await GET()
    const data     = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(0)
  })

  it('retorna 500 quando o banco falha', async () => {
    ;(getMenu as jest.Mock<any>).mockRejectedValueOnce(
      new Error('Conexão com banco falhou')
    )

    const response = await GET()
    const data     = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Erro ao buscar cardápio')
  })
})