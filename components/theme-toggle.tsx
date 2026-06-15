'use client'

import { MoonStar, SunMedium } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeTheme = resolvedTheme || theme
  const isDark = activeTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
        className,
      )}
    >
      {mounted ? (
        isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />
      ) : (
        <span className="h-4 w-4 rounded-full bg-muted" />
      )}
    </button>
  )
}