"use client"

import { useState } from "react"
import { MobileFrame } from "@/components/mobile-frame"
import { BottomNav } from "@/components/bottom-nav"
import { HomeScreen } from "@/components/screens/home-screen"
import { MenuScreen } from "@/components/screens/menu-screen"
import { ProductDetail } from "@/components/screens/product-detail"
import { CartScreen } from "@/components/screens/cart-screen"
import { CheckoutScreen } from "@/components/screens/checkout-screen"
import { ProfileScreen } from "@/components/screens/profile-screen"
import { AboutScreen } from "@/components/screens/about-screen"
import { CartProvider } from "@/lib/cart-context"
import { Product } from "@/lib/data"

type Screen = "home" | "menu" | "cart" | "checkout" | "profile" | "about"

function AppContent() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [menuCategory, setMenuCategory] = useState<string | undefined>()

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleBackFromProduct = () => {
    setSelectedProduct(null)
  }

  const handleNavigateToMenu = (category?: string) => {
    setMenuCategory(category)
    setActiveScreen("menu")
  }

  const handleNavigateToCheckout = () => {
    setActiveScreen("checkout")
  }

  const renderScreen = () => {
    // Show product detail if a product is selected
    if (selectedProduct) {
      return (
        <ProductDetail
          product={selectedProduct}
          onBack={handleBackFromProduct}
        />
      )
    }

    switch (activeScreen) {
      case "home":
        return (
          <HomeScreen
            onSelectProduct={handleSelectProduct}
            onNavigateToMenu={handleNavigateToMenu}
          />
        )
      case "menu":
        return (
          <MenuScreen
            onSelectProduct={handleSelectProduct}
            initialCategory={menuCategory}
          />
        )
      case "cart":
        return <CartScreen onCheckout={handleNavigateToCheckout} />
      case "checkout":
        return <CheckoutScreen onBack={() => setActiveScreen("cart")} />
      case "profile":
        return <ProfileScreen />
      case "about":
        return <AboutScreen />
      default:
        return (
          <HomeScreen
            onSelectProduct={handleSelectProduct}
            onNavigateToMenu={handleNavigateToMenu}
          />
        )
    }
  }

  return (
    <MobileFrame showThemeToggleFallback={activeScreen === "about" || !!selectedProduct}>
      <div className="relative h-full">
        {renderScreen()}
        {!selectedProduct && activeScreen !== "checkout" && (
          <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
        )}
      </div>
    </MobileFrame>
  )
}

export function NiranApp() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  )
}
