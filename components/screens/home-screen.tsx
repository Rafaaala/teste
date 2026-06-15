"use client"

import Image from "next/image"
import { Search, Star, Clock, MapPin } from "lucide-react"
import { categories, products, Product } from "@/lib/data"
import { ProductCard } from "@/components/product-card"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

interface HomeScreenProps {
  onSelectProduct: (product: Product) => void
  onNavigateToMenu: (category?: string) => void
}

export function HomeScreen({ onSelectProduct, onNavigateToMenu }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const promoProducts = products.filter((p) => p.isPromo)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="relative flex-shrink-0 bg-gradient-to-b from-primary/20 to-background px-4 pb-4 pt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary">
              <Image
                src="/images/logo.png"
                alt="Niran Sushi Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Niran Sushi</h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>Itabaiana - PB</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-foreground">4.8</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Delivery Info */}
        <div className="mt-4 flex items-center gap-4 rounded-xl bg-card/60 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Entrega</p>
              <p className="text-sm font-semibold text-foreground">30-45 min</p>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Taxa de entrega</p>
            <p className="text-sm font-semibold text-primary">Grátis</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar pratos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-input py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 no-scrollbar overflow-y-auto pb-24">
        {/* Promo Banner */}
        {!searchQuery && !selectedCategory && (
          <div className="px-4 py-4">
            <div className="relative h-32 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/70">
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <div className="max-w-[55%]">
                  <span className="rounded-full bg-foreground/20 px-2 py-0.5 text-xs font-bold text-foreground">
                    COMBO ESPECIAL
                  </span>
                  <h2 className="mt-2 text-lg font-bold leading-tight text-foreground">
                    30 peças por apenas R$ 79,90
                  </h2>
                  <button 
                    onClick={() => onSelectProduct(promoProducts[0])}
                    className="mt-2 rounded-full bg-foreground px-4 py-1.5 text-xs font-bold text-primary"
                  >
                    Pedir agora
                  </button>
                </div>
                <div className="relative h-24 w-24">
                  <Image
                    src={promoProducts[0]?.image || "/images/logo.png"}
                    alt="Promo"
                    fill
                    className="rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Categorias</h2>
            <button
              onClick={() => onNavigateToMenu()}
              className="text-xs font-medium text-primary"
            >
              Ver todas
            </button>
          </div>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )
                }
                className={`flex flex-shrink-0 flex-col items-center gap-1.5 rounded-xl px-4 py-3 transition-all ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-card/80"
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="text-xs font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="mt-6 px-4">
          <h2 className="mb-3 text-base font-bold text-foreground">
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name
              : searchQuery
              ? "Resultados"
              : "Mais Pedidos"}
          </h2>
          <div className="space-y-3">
            {filteredProducts.slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl">🍣</span>
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhum produto encontrado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
