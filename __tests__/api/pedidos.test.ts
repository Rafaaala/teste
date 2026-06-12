import { GET, POST } from '@/app/api/pedidos/route'

jest.mock('@/lib/database/queries/orders', () => ({
  getAllOrders:          jest.fn(),
  getOrdersByCustomerId: jest.fn(),
  createOrder:          jest.fn(),
}))

jest.mock('@/lib/database/queries/customer', () => ({
  getCustomerById: jest.fn(),
}))

jest.mock('@/lib/database/validate-order-deps', () => ({
  validateCustomerAndAddress: jest.fn(),
}))

import { getAllOrders, createOrder }       from '@/lib/database/queries/orders'
import { getCustomerById }                 from '@/lib/database/queries/customer'
import { validateCustomerAndAddress }      from '@/lib/database/validate-order-deps'

const orderMock = {
  id:           'order-uuid',
  customer_id:  'customer-uuid',
  address_id:   'address-uuid',
  status:       'pendente',
  subtotal:     52.00,
  delivery_fee: 5.00,
  total:        57.00,
  notes:        null,
  created_at:   new Date(),
  updated_at:   new Date(),
}

function makeRequest(body?: object): Request {
  return new Request('http://localhost:3000/api/pedidos', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    body ? JSON.stringify(body) : undefined,
  })
}

describe('GET /api/pedidos', () => {
  beforeEach(() => jest.clearAllMocks())

  it('retorna lista de pedidos', async () => {
    ;(getAllOrders as jest.Mock).mockResolvedValueOnce([orderMock])

    const req      = new Request('http://localhost:3000/api/pedidos')
    const response = await GET(req)
    const data     = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0].id).toBe('order-uuid')
  })

  it('retorna 500 quando banco falha', async () => {
    ;(getAllOrders as jest.Mock).mockRejectedValueOnce(new Error('DB error'))

    const req      = new Request('http://localhost:3000/api/pedidos')
    const response = await GET(req)
    const data     = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Erro ao buscar pedidos')
  })
})

describe('POST /api/pedidos', () => {
  beforeEach(() => jest.clearAllMocks())

  it('retorna 400 quando customer_id está ausente', async () => {
    const req      = makeRequest({ address_id: 'addr-uuid', subtotal: 52 })
    const response = await POST(req)
    const data     = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Cliente e endereço são obrigatórios')
  })

  it('retorna 400 quando address_id está ausente', async () => {
    const req      = makeRequest({ customer_id: 'cust-uuid', subtotal: 52 })
    const response = await POST(req)
    const data     = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Cliente e endereço são obrigatórios')
  })

  it('retorna 400 quando subtotal é negativo', async () => {
    const req = makeRequest({
      customer_id: 'cust-uuid',
      address_id:  'addr-uuid',
      subtotal:    -10,
    })
    const response = await POST(req)
    const data     = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Subtotal')
  })

  it('cria pedido com sucesso quando dados são válidos', async () => {
    ;(validateCustomerAndAddress as jest.Mock).mockResolvedValueOnce({
      ok: true
    })
    ;(createOrder as jest.Mock).mockResolvedValueOnce(orderMock)

    const req = makeRequest({
      customer_id:  'customer-uuid',
      address_id:   'address-uuid',
      subtotal:     52.00,
      delivery_fee: 5.00,
    })

    const response = await POST(req)
    const data     = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe('order-uuid')
    expect(data.status).toBe('pendente')
  })

  it('retorna 400 quando body está vazio', async () => {
    const req = new Request('http://localhost:3000/api/pedidos', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    '{}',
    })

    const response = await POST(req)
    const data     = await response.json()

    expect(response.status).toBe(400)
  })
})