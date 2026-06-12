import { createPixPayment } from '@/lib/mercadopago/pix'

// Mock do SDK do Mercado Pago
jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
  Payment: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  })),
}))

import { Payment } from 'mercadopago'

const inputMock = {
  orderId:       'pedido-uuid-123',
  amount:        57.00,
  customerName:  'Cliente Teste',
  customerEmail: '83999999999@pedido.restaurante.com',
  customerCpf:   undefined,
}

describe('createPixPayment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.MP_ACCESS_TOKEN = 'APP_USR-fake-token'
  })

  it('retorna paymentId, qrCode e qrCodeText quando MP responde com sucesso', async () => {
    const mockCreate = jest.fn().mockResolvedValueOnce({
      id: 987654,
      point_of_interaction: {
        transaction_data: {
          qr_code:        'texto-copia-cola',
          qr_code_base64: 'base64-imagem-qr',
        },
      },
    })

    ;(Payment as jest.Mock).mockImplementation(() => ({
      create: mockCreate,
    }))

    const resultado = await createPixPayment(inputMock)

    expect(resultado.paymentId).toBe('987654')
    expect(resultado.qrCode).toBe('base64-imagem-qr')
    expect(resultado.qrCodeText).toBe('texto-copia-cola')
    expect(resultado.expiresAt).toBeInstanceOf(Date)
  })

  it('expiresAt é aproximadamente 30 minutos no futuro', async () => {
    const mockCreate = jest.fn().mockResolvedValueOnce({
      id: 111,
      point_of_interaction: {
        transaction_data: {
          qr_code:        'txt',
          qr_code_base64: 'b64',
        },
      },
    })

    ;(Payment as jest.Mock).mockImplementation(() => ({
      create: mockCreate,
    }))

    const antes    = new Date()
    const resultado = await createPixPayment(inputMock)
    const depois   = new Date()

    const diffMin = (resultado.expiresAt.getTime() - antes.getTime()) / 1000 / 60

    expect(diffMin).toBeGreaterThanOrEqual(29)
    expect(diffMin).toBeLessThanOrEqual(31)
  })

  it('lança erro quando MP não retorna dados do Pix', async () => {
    const mockCreate = jest.fn().mockResolvedValueOnce({
      id: 222,
      point_of_interaction: {
        transaction_data: {
          // qr_code ausente — simula resposta inválida
        },
      },
    })

    ;(Payment as jest.Mock).mockImplementation(() => ({
      create: mockCreate,
    }))

    await expect(createPixPayment(inputMock)).rejects.toThrow(
      'Resposta do Mercado Pago não contém dados do Pix'
    )
  })

  it('passa transaction_amount como número', async () => {
    const mockCreate = jest.fn().mockResolvedValueOnce({
      id: 333,
      point_of_interaction: {
        transaction_data: {
          qr_code:        'txt',
          qr_code_base64: 'b64',
        },
      },
    })

    ;(Payment as jest.Mock).mockImplementation(() => ({
      create: mockCreate,
    }))

    await createPixPayment(inputMock)

    const chamada = mockCreate.mock.calls[0][0]
    expect(typeof chamada.body.transaction_amount).toBe('number')
    expect(chamada.body.transaction_amount).toBe(57)
  })
})