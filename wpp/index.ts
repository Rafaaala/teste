import { create, Whatsapp, Message } from '@wppconnect-team/wppconnect'
import { estadoService }              from './services/estado.service'
import { EstadoBot }                  from './types'
import { boasVindasHandler }          from './handlers/boasVindas.handler'
import { notificacaoHandler }         from './handlers/notificacao.handler'
import type { TipoNotificacao }       from './handlers/notificacao.handler'

// Instância global — usada pelo worker para enviar notificações
let clienteGlobal: Whatsapp | null = null

export function getCliente(): Whatsapp | null {
  return clienteGlobal
}

const mensagensHandler = {
  [EstadoBot.INICIO]:     boasVindasHandler,
  [EstadoBot.AGUARDANDO]: boasVindasHandler, // reenvio do link se cliente mandar msg
}

create({
  session:        process.env.WPP_SESSION ?? 'restaurante',
  autoClose:      0,       // não fecha automaticamente
  puppeteerOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
})
  .then((client: Whatsapp) => start(client))
  .catch((error) => {
    console.error('[BOT] Erro ao criar cliente:', error)
    process.exit(1)
  })

async function start(client: Whatsapp): Promise<void> {
  clienteGlobal = client

  console.log('[BOT] Cliente iniciado! Escaneie o QR Code com seu celular.')
  console.log('[BOT] Aguardando mensagens...\n')

  client.onMessage(async (message: Message) => {
    // Ignora grupos e mensagens vazias
    if (message.isGroupMsg || !message.body) return

    const numero          = message.from
    const estadoAtual     = estadoService.get(numero)

    console.log('─'.repeat(40))
    console.log('[BOT] Nova mensagem')
    console.log('De:       ', numero)
    console.log('Nome:     ', message.sender.pushname)
    console.log('Estado:   ', estadoAtual.etapa)
    console.log('Mensagem: ', message.body)
    console.log('─'.repeat(40))

    const handler = mensagensHandler[estadoAtual.etapa]

    if (handler) {
      try {
        await handler(client, message)
      } catch (error) {
        console.error('[BOT] Erro no handler:', error)
        await client.sendText(numero, '[BOT] Erro genérico')
      }
    }
  })
}

// Função exportada para o worker usar ao mudar status do pedido
export async function enviarNotificacao(
  tipo:  TipoNotificacao,
  dados: { phone: string; pedidoId: string; total?: string }
): Promise<void> {
  if (!clienteGlobal) {
    console.warn('[BOT] Cliente não iniciado — notificação não enviada')
    return
  }

  try {
    await notificacaoHandler(clienteGlobal, tipo, dados)
  } catch (error) {
    console.error('[BOT] Erro ao enviar notificação:', error)
  }
}