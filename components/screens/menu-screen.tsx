"use client"

import { useState } from "react"
import { Filter, Flame, Tag, ArrowUpDown } from "lucide-react"
import { categories, products, Product } from "@/lib/data"
import { ProductCard } from "@/components/product-card"

interface MenuScreenProps {
  onSelectProduct: (product: Product) => void
  initialCategory?: string
}

type FilterType = "all" | "promo" | "price-low" | "price-high"

export function MenuScreen({ onSelectProduct, initialCategory }: MenuScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  )
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "promo" && product.isPromo)
      return matchesCategory && matchesFilter
    })
    .sort((a, b) => {
      if (activeFilter === "price-low") {
        return (a.promoPrice || a.price) - (b.promoPrice || b.price)
      }
      if (activeFilter === "price-high") {
        return (b.promoPrice || b.price) - (a.promoPrice || a.price)
      }
      return 0
    })

  const filterOptions = [
    { id: "all" as FilterType, label: "Todos", icon: Filter },
    { id: "promo" as FilterType, label: "Promoções", icon: Tag },
    { id: "price-low" as FilterType, label: "Menor Preço", icon: ArrowUpDown },
    { id: "price-high" as FilterType, label: "Maior Preço", icon: Flame },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-card px-4 pb-4 pt-10">
        <h1 className="text-xl font-bold text-foreground">Cardápio</h1>
        <p className="text-sm text-muted-foreground">
          Escolha seus pratos favoritos
        </p>

        {/* Category Tabs */}
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-all ${
                activeFilter === filter.id
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <filter.icon className="h-3 w-3" />
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Products List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        <p className="mb-3 text-xs text-muted-foreground">
          {filteredProducts.length} produto(s) encontrado(s)
        </p>
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl">🍱</span>
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum produto nesta categoria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
