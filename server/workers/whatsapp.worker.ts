// server/workers/whatsapp.worker.ts
import { sql }             from '../../lib/database'
import { enviarNotificacao } from '../../wpp/index'
import type { TipoNotificacao } from '../../wpp/handlers/notificacao.handler'

export interface PedidoNotificacao {
  id:             string
  customer_name:  string
  customer_phone: string
  total:          number
}

export { TipoNotificacao }

export async function workerWhatsApp(
  pedido: PedidoNotificacao,
  tipo:   TipoNotificacao
): Promise<void> {
  console.log(`[WHATSAPP] Enviando '${tipo}' — Pedido: ${pedido.id}`)

  const notifRows = await sql`
    INSERT INTO notifications (
      order_id, type, status, phone
    ) VALUES (
      ${pedido.id}, ${tipo}, 'pendente', ${pedido.customer_phone}
    )
    RETURNING id
  `

  const notifId = notifRows[0]?.id

  try {
    await enviarNotificacao(tipo, {
      phone:    pedido.customer_phone,
      pedidoId: pedido.id,
      total:    Number(pedido.total).toFixed(2),
    })

    await sql`
      UPDATE notifications
      SET status = 'enviado', sent_at = NOW(), updated_at = NOW()
      WHERE id = ${notifId}
    `
  } catch (error) {
    await sql`
      UPDATE notifications
      SET status = 'falhou', last_error = ${String(error)}, updated_at = NOW()
      WHERE id = ${notifId}
    `
    console.error('[WHATSAPP] Falha ao enviar:', error)
  }
}