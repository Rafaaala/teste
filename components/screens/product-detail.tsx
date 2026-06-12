"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react"
import { Product } from "@/lib/data"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"

interface ProductDetailProps {
  product: Product
  onBack: () => void
}

export function ProductDetail({ product, onBack }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
    onBack()
  }

  const price = product.promoPrice || product.price
  const totalPrice = price * quantity

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Image Header */}
      <div className="relative h-64 flex-shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute left-4 top-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        {/* Promo Badge */}
        {product.isPromo && (
          <span className="absolute right-4 top-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            PROMOÇÃO
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-32">
        <div className="py-4">
          <h1 className="text-xl font-bold text-foreground">{product.name}</h1>
          
          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              R$ {price.toFixed(2).replace(".", ",")}
            </span>
            {product.promoPrice && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {product.price.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-foreground">Descrição</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-6 rounded-xl bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Informações adicionais
            </h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tempo de preparo</span>
                <span className="font-medium text-foreground">15-20 min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Serve</span>
                <span className="font-medium text-foreground">1-2 pessoas</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ingredientes</span>
                <span className="font-medium text-primary">Ver lista</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/95 px-4 pb-8 pt-4 backdrop-blur-lg">
        <div className="flex items-center gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/80"
            >
              <Minus className="h-4 w-4 text-foreground" />
            </button>
            <span className="w-8 text-center text-lg font-bold text-foreground">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="flex-1 gap-2 rounded-xl py-6 text-base font-bold"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
