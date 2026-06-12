import { MercadoPagoConfig, Preference } from 'mercadopago';

if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error('MP_ACCESS_TOKEN não está definida no .env!')
  }

export const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: {
        timeout: 10000,
    },
})