// proxy.ts
import { getToken }    from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? ''

  // Rotas do admin exigem sessão de staff via NextAuth
  if (host.startsWith('admin.')) {
    const token   = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const isStaff = (token as any)?.isStaff === true

    if (!isStaff) {
      const signInUrl = new URL('/sign-in', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Cardápio e demais rotas são públicos — passa direto
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
