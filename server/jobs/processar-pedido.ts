// server/jobs/processar-pedido.ts
import { workerFiscal }   from '../workers/fiscal.worker'
import { workerWhatsApp } from '../workers/whatsapp.worker'
import { sql }            from '../../lib/database'
import type { PedidoFiscal }       from '../workers/fiscal.worker'
import type { PedidoNotificacao }  from '../workers/whatsapp.worker'

export async function processarPedido(
  orderId:   string,
  paymentId: string
): Promise<void> {
  console.log(`[JOB] Iniciando processamento — Pedido: ${orderId}`)

  const rows = await sql`
    SELECT
      o.id,
      o.total::float        AS total,
      o.subtotal::float     AS subtotal,
      o.delivery_fee::float AS delivery_fee,
      o.notes,
      c.name                AS customer_name,
      c.phone               AS customer_phone,
      c.cpf                 AS customer_cpf,
      a.street,
      a.number,
      a.complement,
      a.neighborhood,
      a.city,
      a.state,
      a.zip_code,
      json_agg(
        json_build_object(
          'name',     oi.product_name,
          'price',    oi.product_price::float,
          'quantity', oi.quantity,
          'notes',    oi.notes
        )
      ) AS items
    FROM orders o
    JOIN customers   c  ON c.id       = o.customer_id
    JOIN addresses   a  ON a.id       = o.address_id
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.id      = ${orderId}
      AND oi.status != 'cancelado'
    GROUP BY
      o.id, o.total, o.subtotal, o.delivery_fee, o.notes,
      c.name, c.phone, c.cpf,
      a.street, a.number, a.complement,
      a.neighborhood, a.city, a.state, a.zip_code
    LIMIT 1
  `

  if (!rows[0]) {
    console.error(`[JOB] Pedido não encontrado: ${orderId}`)
    return
  }

  // Cast explícito resolve o erro de tipo
  const pedido = rows[0] as unknown as PedidoFiscal

  const pedidoNotif: PedidoNotificacao = {
    id:             pedido.id,
    customer_name:  pedido.customer_name,
    customer_phone: pedido.customer_phone,
    total:          pedido.total,
  }

  const [fiscalResult] = await Promise.allSettled([
    workerFiscal(pedido, paymentId),
    workerWhatsApp(pedidoNotif, 'confirmacao_pagamento'),
  ])

  if (fiscalResult.status === 'rejected') {
    console.error('[JOB] Worker fiscal falhou:', fiscalResult.reason)
  }

  console.log(`[JOB] Processamento concluído — Pedido: ${orderId}`)
}