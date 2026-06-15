import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'
import type { ReactNode } from 'react'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Niran Sushi - Delivery | Itabaiana PB',
  description: 'Peça seu sushi favorito no Niran Sushi - Culinária Japonesa e Chinesa em Itabaiana PB',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      }
    ]
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased overflow-x-hidden">
        <Providers>
          <div className="app-viewport min-h-screen">
            <div className="app-container">
              <div className="app-main">
                {children}
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
