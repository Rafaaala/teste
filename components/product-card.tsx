"use client"

import Image from "next/image"
import { Plus } from "lucide-react"
import { Product } from "@/lib/data"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(product)
  }

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex cursor-pointer gap-3 rounded-xl bg-card p-3 transition-all hover:bg-card/80"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        {product.isPromo && (
          <span className="absolute left-0 top-0 rounded-br-lg bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            PROMO
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {product.description}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {product.promoPrice ? (
              <>
                <span className="text-sm font-bold text-primary">
                  R$ {product.promoPrice.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-foreground">
                R$ {product.price.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
          <Button
            size="icon"
            variant="default"
            className="h-7 w-7 rounded-full"
            onClick={handleAddToCart}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Adicionar ao carrinho</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
