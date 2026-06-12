import { workerFiscal } from '@/server/workers/fiscal.worker'

jest.mock('@/lib/database', () => ({
  sql: jest.fn(),
}))

import { sql } from '@/lib/database'

const pedidoMock = {
  id:             'pedido-uuid-123',
  total:          57.00,
  subtotal:       52.00,
  delivery_fee:   5.00,
  customer_name:  'Cliente Teste',
  customer_phone: '83999999999',
  customer_cpf:   null,
  street:         'Rua Teste',
  number:         '123',
  complement:     null,
  neighborhood:   'Centro',
  city:           'Itabaiana',
  state:          'PB',
  zip_code:       '58000-000',
  items: [
    { name: 'Temaki Salmão', price: 28.00, quantity: 1, notes: null },
    { name: 'Gyoza',         price: 12.00, quantity: 2, notes: null },
  ],
}

describe('workerFiscal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Garante modo simulação — sem credencial Focus
    delete process.env.FOCUS_NFE_TOKEN
  })

  it('cria registro de invoice com status emitindo', async () => {
    ;(sql as unknown as jest.Mock)
      .mockResolvedValueOnce([{ id: 'invoice-uuid' }]) // INSERT invoice
      .mockResolvedValueOnce([])                        // UPDATE invoice simulação

    await workerFiscal(pedidoMock, 'payment-ext-id')

    expect(sql).toHaveBeenCalledTimes(2)
  })

  it('não lança exceção mesmo sem credencial Focus', async () => {
    ;(sql as unknown as jest.Mock)
      .mockResolvedValueOnce([{ id: 'invoice-uuid' }])
      .mockResolvedValueOnce([])

    await expect(
      workerFiscal(pedidoMock, 'payment-ext-id')
    ).resolves.not.toThrow()
  })

  it('loga a nota simulada no terminal', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    ;(sql as unknown as jest.Mock)
      .mockResolvedValueOnce([{ id: 'invoice-uuid' }])
      .mockResolvedValueOnce([])

    await workerFiscal(pedidoMock, 'payment-ext-id')

    const logsCompletos = consoleSpy.mock.calls.flat().join(' ')
    expect(logsCompletos).toContain('NFC-e SIMULADA')

    consoleSpy.mockRestore()
  })
})