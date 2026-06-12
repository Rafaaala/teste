// lib/mercadopago/webhook.ts
import crypto from 'crypto'

/**
 * Valida a autenticidade do webhook usando o secret configurado
 * no painel do Mercado Pago.
 * Evita que qualquer pessoa chame o endpoint se passando pelo MP.
 */
export function validateWebhookSignature(
  xSignature:  string | null,
  xRequestId:  string | null,
  dataId:      string,
  rawBody:     string
): boolean {
  if (!xSignature || !xRequestId) return false
  if (!process.env.MP_WEBHOOK_SECRET)  return false

  // Monta o manifesto conforme documentação do MP
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${Date.now()};`

  const expected = crypto
    .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex')

  // Extrai o hash do header x-signature
  const parts  = xSignature.split(',')
  const tsPart = parts.find(p => p.startsWith('ts='))
  const v1Part = parts.find(p => p.startsWith('v1='))

  if (!tsPart || !v1Part) return false

  const received = v1Part.replace('v1=', '')

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(received)
  )
}

export type WebhookEventType =
  | 'payment'
  | 'merchant_order'
  | 'chargebacks'

export interface WebhookPayload {
  id:     number
  type:   WebhookEventType
  data: {
    id: string
  }
}