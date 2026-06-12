import { Message, Whatsapp }   from '@wppconnect-team/wppconnect'
import { estadoService }        from '../services/estado.service'
import { mensagensBot }         from '../config/messages'
import { EstadoBot }            from '../types'

export async function boasVindasHandler(
  client:  Whatsapp,
  message: Message
): Promise<void> {
  const numero = message.from
  const nome   = message.sender.pushname ?? 'cliente'

  await client.sendText(numero, mensagensBot.boasVindas(nome))

  // Avança estado
  estadoService.set(numero, {
    etapa: EstadoBot.AGUARDANDO,
    nome,
  })

  console.log(`[BOT] Boas-vindas enviadas para ${numero} (${nome})`)
}