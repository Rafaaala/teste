"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Hash,
  MapPin,
  Package,
  Receipt,
  Truck,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface CheckoutScreenProps {
  onBack: () => void
}

type DeliveryMethod = "delivery" | "pickup"

type PaymentMethod = "pix" | "credit" | "debit" | "cash"

const deliveryOptions: Array<{
  id: DeliveryMethod
  title: string
  description: string
  icon: typeof Truck | typeof Package
}> = [
  {
    id: "delivery",
    title: "Entrega",
    description: "Receba no endereço escolhido",
    icon: Truck,
  },
  {
    id: "pickup",
    title: "Retirada no local",
    description: "Buscar no restaurante",
    icon: Package,
  },
]

const paymentMethods: Array<{
  id: PaymentMethod
  title: string
  description: string
  icon: typeof CreditCard | typeof DollarSign | typeof Hash | typeof CheckCircle2
}> = [
  {
    id: "pix",
    title: "PIX",
    description: "Pagamento rápido pelo app",
    icon: Hash,
  },
  {
    id: "credit",
    title: "Cartão de Crédito",
    description: "Parcelar em até 3x",
    icon: CreditCard,
  },
  {
    id: "debit",
    title: "Cartão de Débito",
    description: "Pagamento instantâneo",
    icon: CreditCard,
  },
  {
    id: "cash",
    title: "Dinheiro",
    description: "Troco na entrega",
    icon: DollarSign,
  },
]

export function CheckoutScreen({ onBack }: CheckoutScreenProps) {
  const { items, totalItems, totalPrice } = useCart()
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix")
  const [notes, setNotes] = useState("")
  const [coupon, setCoupon] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponMessage, setCouponMessage] = useState("")

  const discount = useMemo(() => {
    if (appliedCoupon === "NIRAN10") {
      return 8.5
    }
    return 0
  }, [appliedCoupon])

  const deliveryFee = deliveryMethod === "delivery" ? 8.5 : 0
  const subtotal = totalPrice
  const total = subtotal + deliveryFee - discount

  const formatMoney = (value: number) =>
    `R$ ${value.toFixed(2).replace(".", ",")}`

  const handleApplyCoupon = () => {
    if (!coupon.trim()) {
      setCouponMessage("Digite um código válido")
      return
    }

    if (coupon.trim().toUpperCase() === "NIRAN10") {
      setAppliedCoupon("NIRAN10")
      setCouponMessage("Cupom aplicado com sucesso")
      return
    }

    setAppliedCoupon(null)
    setCouponMessage("Cupom inválido")
  }

  const handleConfirm = () => {
    if (items.length === 0) {
      return
    }
    window.alert("Pedido confirmado! Obrigado pela compra.")
  }

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-card px-4 pb-4 pt-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <h1 className="mt-4 text-xl font-bold text-foreground">
            Finalizar Pedido
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione itens ao carrinho antes de concluir seu pedido.
          </p>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-card shadow-sm">
            <MapPin className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Nenhum item no checkout
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Volte ao carrinho para selecionar os pratos e confirmar seu pedido.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex-shrink-0 bg-card px-4 pb-4 pt-10">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/70 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="text-right">
            <h1 className="text-xl font-semibold text-foreground">Finalizar Pedido</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-40 pt-4">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">Endereço de Entrega</p>
              <p className="mt-3 text-base font-bold text-foreground">
                Rua das Flores, 478
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                João Silva · Itabaiana, Centro
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => alert("Alterar endereço")}>Alterar</Button>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Método de Entrega</p>
                <p className="text-sm text-muted-foreground">
                  Escolha como deseja receber seu pedido
                </p>
              </div>
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {deliveryOptions.map((option) => {
                const Icon = option.icon
                const selected = deliveryMethod === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDeliveryMethod(option.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-3xl border px-4 py-4 text-left transition",
                      selected
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-card hover:border-primary/70 hover:shadow-sm",
                    )}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {option.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Forma de Pagamento</p>
                <p className="text-sm text-muted-foreground">
                  Selecione a opção que mais combina com você
                </p>
              </div>
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                const selected = paymentMethod === method.id
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-3xl border px-4 py-4 text-left transition",
                      selected
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-card hover:border-primary/70 hover:shadow-sm",
                    )}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {method.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Observações do Pedido</p>
                <p className="text-sm text-muted-foreground">
                  Adicione instruções para a cozinha ou entrega
                </p>
              </div>
            </div>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Exemplo: Sem cebola, enviar hashi e retirar molho"
              className="min-h-[6rem]"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="rounded-full border border-border px-3 py-1">Sem cebola</span>
              <span className="rounded-full border border-border px-3 py-1">Enviar hashi</span>
              <span className="rounded-full border border-border px-3 py-1">Retirar molho</span>
            </div>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Cupom de Desconto</p>
                <p className="text-sm text-muted-foreground">
                  Use um cupom e garanta um desconto especial
                </p>
              </div>
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                value={coupon}
                onChange={(event) => setCoupon(event.target.value)}
                placeholder="Código do cupom"
                className="rounded-2xl"
              />
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-2xl"
                onClick={handleApplyCoupon}
              >
                Aplicar
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{couponMessage || "Ex: NIRAN10"}</p>
          </div>

          <Card className="rounded-[2rem] border-border p-4 shadow-sm">
            <CardHeader className="px-0 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Resumo do Pedido</CardTitle>
                  <CardDescription>
                    Revise os valores antes de confirmar.
                  </CardDescription>
                </div>
                <div className="rounded-2xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {deliveryMethod === "delivery" ? "Entrega" : "Retirada"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Itens</span>
                  <span>{totalItems} produto(s)</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Taxa de entrega</span>
                  <span>{deliveryFee > 0 ? formatMoney(deliveryFee) : "Grátis"}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Descontos</span>
                  <span className={appliedCoupon ? "text-emerald-400" : "text-muted-foreground"}>
                    {appliedCoupon ? `- ${formatMoney(discount)}` : "Nenhum cupom"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-0 pt-4">
              <div className="flex w-full items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total estimado</p>
                  <p className="text-2xl font-bold text-foreground">{formatMoney(total)}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {paymentMethod.toUpperCase()}
                </span>
              </div>
            </CardFooter>
          </Card>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/95 px-4 py-4 backdrop-blur-xl">
        <div className="app-container">
          <div className="app-bottom-nav-inner flex max-w-full flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold text-foreground">{formatMoney(total)}</p>
            </div>
            <Button
              type="button"
              className="min-w-[46%] rounded-3xl py-5 text-base font-semibold"
              onClick={handleConfirm}
            >
              Confirmar Pedido
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Ao confirmar, seu pedido será enviado para preparo imediato.
          </p>
          </div>
        </div>
      </div>
    </div>
  )
}
