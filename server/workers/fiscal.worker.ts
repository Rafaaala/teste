import { sql } from '../../lib/database'

export interface PedidoFiscal {
  id:             string
  total:          number
  subtotal:       number
  delivery_fee:   number
  customer_name:  string
  customer_phone: string
  customer_cpf:   string | null
  street:         string
  number:         string
  complement:     string | null
  neighborhood:   string
  city:           string
  state:          string
  zip_code:       string
  items:          Array<{
    name:     string
    price:    number
    quantity: number
    notes:    string | null
  }>
}

export async function workerFiscal(
  pedido:    PedidoFiscal,
  paymentId: string
): Promise<void> {
  console.log(`[FISCAL] Iniciando emissão — Pedido: ${pedido.id}`)

  // Cria registro de invoice com status 'emitindo'
  const invoiceRows = await sql`
    INSERT INTO invoices (
      payment_id,
      order_id,
      status
    )
    SELECT
      p.id,
      p.order_id,
      'emitindo'
    FROM payments p
    WHERE p.external_id = ${paymentId}
    RETURNING id
  `

  const invoiceId = invoiceRows[0]?.id

  if (!invoiceId) {
    console.error('[FISCAL] Não foi possível criar registro de invoice')
    return
  }

  try {
    // MVP — simula a emissão com log estruturado no terminal
    // Em produção: substituir pelo payload real do Focus NF-e

    if (!process.env.FOCUS_NFE_TOKEN) {
      // Modo simulação — sem credencial configurada
      simularImpressaoFiscal(pedido, invoiceId)
      return
    }

    // Monta payload da NFC-e para o Focus NF-e
    const payload = montarPayloadNFCe(pedido)

    const response = await fetch(
      `https://api.focusnfe.com.br/v2/nfce?ref=${pedido.id}`,
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Basic ${Buffer.from(
            process.env.FOCUS_NFE_TOKEN + ':'
          ).toString('base64')}`,
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Focus NF-e erro: ${JSON.stringify(data)}`)
    }

    // Atualiza invoice com dados retornados
    await sql`
      UPDATE invoices
      SET
        status         = 'autorizada',
        invoice_number = ${data.numero          ?? null},
        access_key     = ${data.chave_nfe       ?? null},
        xml_url        = ${data.caminho_xml_nota ?? null},
        danfe_url      = ${data.caminho_danfe    ?? null},
        issued_at      = NOW(),
        updated_at     = NOW()
      WHERE id = ${invoiceId}
    `

    console.log(`[FISCAL] NFC-e autorizada — Chave: ${data.chave_nfe}`)

  } catch (error) {
    // Falha não bloqueia o pedido — registra o erro e segue
    await sql`
      UPDATE invoices
      SET
        status     = 'erro',
        error_log  = ${String(error)},
        updated_at = NOW()
      WHERE id = ${invoiceId}
    `

    console.error('[FISCAL] Erro na emissão — pedido segue normalmente:', error)
  }
}

// Simula impressão fiscal no terminal (MVP sem credencial)
function simularImpressaoFiscal(pedido: PedidoFiscal, invoiceId: string) {
  const linha = '─'.repeat(42)

  console.log(`
[FISCAL] ════════════════════════════════════════
         NFC-e SIMULADA (MVP)
${linha}
PEDIDO:    #${pedido.id.slice(0, 8).toUpperCase()}
INVOICE:   #${invoiceId.slice(0, 8).toUpperCase()}
CLIENTE:   ${pedido.customer_name}
CPF:       ${pedido.customer_cpf ?? 'Não informado'}
${linha}
ITENS:
${pedido.items.map(i =>
  `  ${i.quantity}x ${i.name.padEnd(20)} R$ ${(i.price * i.quantity).toFixed(2)}`
).join('\n')}
${linha}
SUBTOTAL:  R$ ${Number(pedido.subtotal).toFixed(2)}
ENTREGA:   R$ ${Number(pedido.delivery_fee).toFixed(2)}
TOTAL:     R$ ${Number(pedido.total).toFixed(2)}
${linha}
ENDEREÇO:  ${pedido.street}, ${pedido.number}
           ${pedido.neighborhood} — ${pedido.city}/${pedido.state}
${linha}
[FISCAL] ════════════════════════════════════════
  `)

  // Marca como autorizada no banco mesmo em simulação
  sql`
    UPDATE invoices
    SET
      status    = 'autorizada',
      issued_at = NOW(),
      updated_at = NOW()
    WHERE id = ${invoiceId}
  `.catch(err => console.error('[FISCAL] Erro ao atualizar invoice simulada:', err))
}

// Monta o payload completo da NFC-e para o Focus NF-e
function montarPayloadNFCe(pedido: PedidoFiscal) {
  return {
    natureza_operacao:        'Venda ao consumidor',
    forma_pagamento:          0,
    itens: pedido.items.map((item, index) => ({
      numero_item:             index + 1,
      codigo_produto:          `ITEM${index + 1}`,
      descricao:               item.name,
      cfop:                    '5102',
      unidade_comercial:       'UN',
      quantidade_comercial:    item.quantity,
      valor_unitario_comercial: Number(item.price),
      valor_bruto:             Number(item.price) * item.quantity,
      icms_situacao_tributaria: '400',
      pis_situacao_tributaria:  '07',
      cofins_situacao_tributaria: '07',
    })),
    // Consumidor — CPF opcional
    ...(pedido.customer_cpf && {
      cpf_destinatario: pedido.customer_cpf.replace(/\D/g, ''),
    }),
  }
}