'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Copy, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PaymentData {
  id: string
  order_id: string
  method: string
  amount: number
  status: string
  pix_qr_code: string | null
  pix_qr_code_text: string | null
  pix_expires_at: string | null
  created_at: string
}

interface OrderData {
  id: string
  customer_id: string
  subtotal: number
  delivery_fee: number
  total: number
  status: string
}

export default function PagamentoPixContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const paymentId = searchParams.get('payment_id')
  const { toast } = useToast()

  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  const loadPaymentData = async () => {
    try {
      setIsLoading(true)

      if (!orderId || !paymentId) {
        throw new Error('Parâmetros inválidos')
      }

      // Buscar dados do pagamento
      const paymentRes = await fetch(`/api/pagamentos/${paymentId}`)
      if (!paymentRes.ok) throw new Error('Erro ao carregar pagamento')
      const paymentData = await paymentRes.json()
      setPayment(paymentData)

      // Buscar dados do pedido
      const orderRes = await fetch(`/api/pedidos/${orderId}`)
      if (!orderRes.ok) throw new Error('Erro ao carregar pedido')
      const orderData = await orderRes.json()
      setOrder(orderData)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do pagamento',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPaymentData()
  }, [orderId, paymentId])

  // Verificar se o tempo expirou
  useEffect(() => {
    if (!payment?.pix_expires_at) return

    const interval = setInterval(() => {
      const expiresAt = new Date(payment.pix_expires_at!).getTime()
      const now = new Date().getTime()
      const diff = expiresAt - now

      if (diff <= 0) {
        setTimeLeft(0)
        clearInterval(interval)
      } else {
        setTimeLeft(Math.floor(diff / 1000))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [payment?.pix_expires_at])

  const handleCopyCode = () => {
    if (payment?.pix_qr_code_text) {
      navigator.clipboard.writeText(payment.pix_qr_code_text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast({
        title: 'Copiado',
        description: 'Código Pix copiado para a área de transferência',
      })
    }
  }

  const handleCheckPayment = async () => {
    setIsCheckingPayment(true)
    try {
      const response = await fetch(`/api/pagamentos/${paymentId}/verify`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Erro ao verificar pagamento')

      const data = await response.json()
      setPayment(data)

      if (data.status === 'confirmado') {
        toast({
          title: 'Sucesso!',
          description: 'Pagamento confirmado!',
        })
        // Redirecionar para página de sucesso após 2 segundos
        setTimeout(() => {
          router.push(`/order-success?order_id=${orderId}`)
        }, 2000)
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar o pagamento',
        variant: 'destructive',
      })
    } finally {
      setIsCheckingPayment(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!payment || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erro ao carregar</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Não foi possível carregar os dados do pagamento
          </p>
          <Button onClick={() => router.push('/')}>Voltar para home</Button>
        </Card>
      </div>
    )
  }

  const isExpired = timeLeft === 0
  const minutes = Math.floor((timeLeft || 0) / 60)
  const seconds = (timeLeft || 0) % 60

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Pagamento Pix</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Escanear o código QR ou copiar o código
          </p>
        </div>

        {/* Status */}
        {payment.status === 'confirmado' && (
          <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              Pagamento confirmado! Redirecionando...
            </AlertDescription>
          </Alert>
        )}

        {isExpired && payment.status === 'pendente' && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              O código QR expirou. Por favor, solicite uma nova cobrança.
            </AlertDescription>
          </Alert>
        )}

        {/* Card Principal */}
        <Card className="p-8 mb-6 text-center">
          {/* QR Code */}
          {payment.pix_qr_code && payment.status === 'pendente' && !isExpired && (
            <div className="mb-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg inline-block">
              <img
                src={`data:image/png;base64,${payment.pix_qr_code}`}
                alt="QR Code Pix"
                className="w-64 h-64"
              />
            </div>
          )}

          {/* Valor */}
          <div className="mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Valor a pagar
            </p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
              R$ {order.total.toFixed(2)}
            </p>
          </div>

          {/* Tempo restante */}
          {payment.status === 'pendente' && (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-300">
                {isExpired
                  ? 'Código expirado'
                  : `Válido por ${minutes}:${seconds.toString().padStart(2, '0')}`}
              </span>
            </div>
          )}

          {/* Código Pix */}
          {payment.pix_qr_code_text && payment.status === 'pendente' && !isExpired && (
            <div className="mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Ou copie e cole este código
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={payment.pix_qr_code_text}
                  readOnly
                  className="w-full p-3 pr-12 bg-slate-100 dark:bg-slate-800 border rounded-lg text-sm font-mono"
                />
                <Button
                  onClick={handleCopyCode}
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {isCopied && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Copiado!
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Pedido Info */}
        <Card className="p-6 mb-6 bg-slate-100 dark:bg-slate-800">
          <h3 className="font-semibold mb-3">Detalhes do pedido</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">ID do pedido</span>
              <span className="font-mono">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
              <span>R$ {order.subtotal.toFixed(2)}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  Taxa de entrega
                </span>
                <span>R$ {order.delivery_fee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Ações */}
        <div className="space-y-3">
          {payment.status === 'pendente' && !isExpired && (
            <Button
              onClick={handleCheckPayment}
              disabled={isCheckingPayment}
              size="lg"
              className="w-full"
              variant="default"
            >
              {isCheckingPayment && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verificar pagamento
            </Button>
          )}

          <Button
            onClick={() => router.push('/')}
            size="lg"
            variant="outline"
            className="w-full"
          >
            Voltar para home
          </Button>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-slate-700 dark:text-slate-300">
          <p className="font-semibold mb-2">Como pagar:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Abra seu app de banco</li>
            <li>Escanei o QR Code ou copie o código</li>
            <li>Confirme o pagamento</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
