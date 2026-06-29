import { MercadoPagoConfig } from 'mercadopago'
import { requireEnv } from '@/lib/env'

let _mpClient: MercadoPagoConfig | null = null

export function getMpClient(): MercadoPagoConfig {
  if (!_mpClient) {
    _mpClient = new MercadoPagoConfig({
      accessToken: requireEnv('MP_ACCESS_TOKEN'),
      options: { timeout: 10000 },
    })
  }
  return _mpClient
}

/** Proxy lazy — rotas de pagamento falham em runtime se MP_ACCESS_TOKEN estiver ausente. */
export const mpClient: MercadoPagoConfig = new Proxy({} as MercadoPagoConfig, {
  get(_target, prop) {
    const client = getMpClient()
    const value = Reflect.get(client, prop)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
