// lib/mercadopago/card.ts
import { Payment }  from 'mercadopago'
import { mpClient } from '@/lib/mercadopago/client'

export interface CreateCardPaymentInput {
  orderId:        string
  amount:         number
  token:          string  // token gerado pelo SDK frontend do MP
  installments:   number
  paymentMethod:  string  // ex: 'visa', 'mastercard' 
  customerEmail:  string
  customerCpf?:   string
  customerName:   string
}

export interface CardPaymentResult {
  paymentId:  string
  status:     'approved' | 'rejected' | 'in_process'
  detail:     string
}

export async function createCardPayment(
  input: CreateCardPaymentInput
): Promise<CardPaymentResult> {
  const payment = new Payment(mpClient)

  const response = await payment.create({
    body: {
      transaction_amount: input.amount,
      description:        `Pedido #${input.orderId}`,
      token:              input.token,
      installments:       input.installments,
      payment_method_id:  input.paymentMethod,
      payer: {
        email:        input.customerEmail,
        first_name:   input.customerName,
        identification: input.customerCpf
          ? { type: 'CPF', number: input.customerCpf }
          : undefined,
      },
      metadata: {
        order_id: input.orderId,
      },
    },
  })

  return {
    paymentId: String(response.id),
    status:    response.status as CardPaymentResult['status'],
    detail:    response.status_detail ?? '',
  }
}