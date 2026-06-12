const BASE_URL = process.env.CARDAPIO_URL ?? 'cardapio.niransushi.com'

export const mensagensBot = {
  boasVindas: (nome: string) =>
    `Olá, ${nome}! 👋 Seja bem-vindo ao Niran.\n\nAcesse nosso cardápio pelo link abaixo e faça seu pedido:\n\n🍣 ${BASE_URL}\n\nQualquer dúvida, estamos por aqui!`,

  confirmacaoPagamento: (pedidoId: string, total: string) =>
    `✅ *Pagamento confirmado!*\n\nSeu pedido *#${pedidoId}* foi recebido com sucesso.\nValor: *R$ ${total}*\n\nEstamos preparando tudo com carinho! 🍱`,

  pedidoEmPreparo: (pedidoId: string) =>
    `👨‍🍳 *Seu pedido está sendo preparado!*\n\nPedido *#${pedidoId}* entrou na cozinha.\nEm breve sairá para entrega!`,

  pedidoSaindoEntrega: (pedidoId: string) =>
    `🛵 *Pedido a caminho!*\n\nSeu pedido *#${pedidoId}* saiu para entrega.\nPrepare-se para receber! 😄`,

  pedidoEntregue: (pedidoId: string) =>
    `🎉 *Pedido entregue!*\n\nEsperamos que aprecie! Pedido *#${pedidoId}* finalizado.\n\nObrigado pela preferência! ⭐`,

  pedidoCancelado: (pedidoId: string) =>
    `❌ *Pedido cancelado.*\n\nSeu pedido *#${pedidoId}* foi cancelado.\nEntre em contato caso precise de ajuda.`,

  erroBotGenerico:
    `Ops! Ocorreu um erro no nosso sistema. Por favor, tente novamente em instantes. 🙏`,
}