import { Whatsapp }      from '@wppconnect-team/wppconnect'
import { mensagensBot }  from '../config/messages'

export type TipoNotificacao =
  | 'confirmacao_pagamento'
  | 'pedido_em_preparo'
  | 'pedido_saindo_entrega'
  | 'entregue'
  | 'cancelado'

interface DadosNotificacao {
  phone:    string
  pedidoId: string
  total?:   string
}

export async function notificacaoHandler(
  client: Whatsapp,
  tipo:   TipoNotificacao,
  dados:  DadosNotificacao
): Promise<void> {
  const phone    = dados.phone.replace(/\D/g, '')
  const numero   = phone.startsWith('55') ? `${phone}@c.us` : `55${phone}@c.us`
  const pedidoId = dados.pedidoId.slice(0, 8).toUpperCase()

  const mensagens: Record<TipoNotificacao, string> = {
    confirmacao_pagamento:  mensagensBot.confirmacaoPagamento(pedidoId, dados.total ?? '0,00'),
    pedido_em_preparo:      mensagensBot.pedidoEmPreparo(pedidoId),
    pedido_saindo_entrega:  mensagensBot.pedidoSaindoEntrega(pedidoId),
    entregue:               mensagensBot.pedidoEntregue(pedidoId),
    cancelado:              mensagensBot.pedidoCancelado(pedidoId),
  }

  await client.sendText(numero, mensagens[tipo])

  console.log(`[BOT] Notificação '${tipo}' enviada para ${numero}`)
}