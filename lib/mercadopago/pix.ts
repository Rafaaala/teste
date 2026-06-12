// lib/mercadopago/pix.ts
import { Payment }  from 'mercadopago'
import { mpClient } from '@/lib/mercadopago/client'

export interface CreatePixPaymentInput {
  orderId:       string
  amount:        number
  customerName:  string
  customerEmail: string  // MP exige email (usar placeholder se não tiver)
  customerCpf?:  string
}

export interface PixPaymentResult {
  paymentId:    string
  qrCode:       string   // string para renderizar como imagem
  qrCodeText:   string   // copia e cola
  expiresAt:    Date
}

export async function createPixPayment(
  input: CreatePixPaymentInput
): Promise<PixPaymentResult> {
  const payment = new Payment(mpClient)

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 30) // expira em 5 minutos

  const response = await payment.create({
    body: {
      transaction_amount: input.amount,
      description:        `Pedido #${input.orderId}`,
      payment_method_id:  'pix',
      date_of_expiration: expiresAt.toISOString(),
      payer: {
        email:        input.customerEmail,
        first_name:   input.customerName,
        identification: input.customerCpf
          ? { type: 'CPF', number: input.customerCpf }
          : undefined,
      },
      metadata: {
        order_id: input.orderId, // recuperado no webhook
      },
    },
  })

  const txInfo = response.point_of_interaction?.transaction_data

  if (!txInfo?.qr_code || !txInfo?.qr_code_base64) {
    throw new Error('Resposta do Mercado Pago não contém dados do Pix')
  }

  return {
    paymentId:  String(response.id),
    qrCode:     txInfo.qr_code_base64, // base64 para renderizar como <img>
    qrCodeText: txInfo.qr_code,        // texto para copia e cola
    expiresAt,
  }
}