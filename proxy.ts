// proxy.ts
import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get('host') ?? ''

  // Rotas do admin exigem autenticação Clerk
  if (host.startsWith('admin.')) {
    const { userId } = await auth()

    if (!userId) {
      // Redireciona para login do Clerk
      const signInUrl = new URL('/login', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Cardápio é público — passa direto
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
