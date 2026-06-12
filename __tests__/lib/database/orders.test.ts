import { createOrder } from '@/lib/database/queries/orders'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock do módulo de banco — evita conexão real ao Neon nos testes
jest.mock('@/lib/database', () => ({
  sql: jest.fn(),
}))

import { sql } from '@/lib/database'

describe('createOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('cria pedido com delivery_fee padrão zero quando não informado', async () => {
    const mockOrder = {
      id:           'uuid-teste',
      customer_id:  'customer-uuid',
      address_id:   'address-uuid',
      status:       'pendente',
      subtotal:     52.00,
      delivery_fee: 0,
      total:        52.00,
      notes:        null,
      created_at:   new Date(),
      updated_at:   new Date(),
    }

    ;(sql as unknown as jest.Mock<any>).mockResolvedValueOnce([mockOrder])

    const resultado = await createOrder({
      customer_id: 'customer-uuid',
      address_id:  'address-uuid',
      subtotal:    52.00,
    })

    expect(resultado.delivery_fee).toBe(0)
    expect(resultado.total).toBe(52.00)
    expect(resultado.status).toBe('pendente')
  })

  it('calcula total corretamente com delivery_fee', async () => {
    const mockOrder = {
      id:           'uuid-teste',
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

    ;(sql as unknown as jest.Mock<any>).mockResolvedValueOnce([mockOrder])

    const resultado = await createOrder({
      customer_id:  'customer-uuid',
      address_id:   'address-uuid',
      subtotal:     52.00,
      delivery_fee: 5.00,
    })

    expect(resultado.total).toBe(57.00)
  })
})