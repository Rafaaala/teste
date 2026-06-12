import express               from 'express'
import { processarPedido }   from './jobs/processar-pedido'

const app  = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json())

// Middleware de autenticação interna
function autenticarInterno(
  req:  express.Request,
  res:  express.Response,
  next: express.NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token || token !== process.env.INTERNAL_API_SECRET) {
    res.status(401).json({ error: 'Não autorizado' })
    return
  }

  next()
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Job principal — chamado pelo webhook do MP após pagamento confirmado
app.post('/jobs/processar-pedido', autenticarInterno, async (req, res) => {
  const { orderId, paymentId } = req.body

  if (!orderId || !paymentId) {
    res.status(400).json({ error: 'orderId e paymentId são obrigatórios' })
    return
  }

  // Responde imediatamente — processamento é assíncrono
  res.json({ received: true, orderId })

  // Processa em background sem bloquear a resposta
  processarPedido(orderId, paymentId).catch(err =>
    console.error('[SERVER] Erro ao processar pedido:', err)
  )
})

app.listen(PORT, () => {
  console.log(`[SERVER] Worker rodando na porta ${PORT}`)
})