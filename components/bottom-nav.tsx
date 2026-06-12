"use client"

import { Home, UtensilsCrossed, ShoppingCart, User, Info } from "lucide-react"
import { useCart } from "@/lib/cart-context"

type Screen = "home" | "menu" | "cart" | "profile" | "about"

interface BottomNavProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
}

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const { totalItems } = useCart()

  const navItems = [
    { id: "home" as Screen, icon: Home, label: "Início" },
    { id: "menu" as Screen, icon: UtensilsCrossed, label: "Cardápio" },
    { id: "cart" as Screen, icon: ShoppingCart, label: "Carrinho", badge: totalItems },
    { id: "profile" as Screen, icon: User, label: "Perfil" },
    { id: "about" as Screen, icon: Info, label: "Sobre" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg h-16">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center gap-1 px-3"
            >
              <div className="relative">
                <item.icon
                  className={`h-6 w-6 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
