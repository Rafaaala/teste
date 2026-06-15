"use client"

import { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

interface MobileFrameProps {
  children: ReactNode
  showThemeToggleFallback?: boolean
}

export function MobileFrame({ children, showThemeToggleFallback }: MobileFrameProps) {
  return (
    <div className="relative min-h-screen w-full bg-transparent pb-16">
      {children}
      {showThemeToggleFallback && (
        <div className="fixed bottom-24 right-4 z-50 lg:bottom-6">
          <ThemeToggle className="shadow-sm shadow-black/5" />
        </div>
      )}
    </div>
  )
}