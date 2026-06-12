"use client"

import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"

export function CartScreen() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-card px-4 pb-4 pt-10">
          <h1 className="text-xl font-bold text-foreground">Carrinho</h1>
          <p className="text-sm text-muted-foreground">
            Seu carrinho está vazio
          </p>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-card">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Nenhum item no carrinho
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Adicione deliciosos pratos do nosso cardápio para começar seu pedido
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-card px-4 pb-4 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Carrinho</h1>
            <p className="text-sm text-muted-foreground">
              {items.length} item(s) no carrinho
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-medium text-primary hover:underline"
          >
            Limpar tudo
          </button>
        </div>
      </header>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-4 pb-48 pt-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-xl bg-card p-3"
            >
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      R$ {(item.promoPrice || item.price).toFixed(2).replace(".", ",")} cada
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-lg bg-secondary px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded bg-muted"
                    >
                      <Minus className="h-3 w-3 text-foreground" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded bg-primary"
                    >
                      <Plus className="h-3 w-3 text-primary-foreground" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    R$ {((item.promoPrice || item.price) * item.quantity).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/95 px-4 pb-24 pt-4 backdrop-blur-lg">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              R$ {totalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de entrega</span>
            <span className="font-medium text-primary">Grátis</span>
          </div>
          <div className="my-2 h-px bg-border" />
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary">
              R$ {totalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
        <Button className="mt-4 w-full rounded-xl py-6 text-base font-bold">
          Finalizar Pedido
        </Button>
      </div>
    </div>
  )
}
