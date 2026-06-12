import { NextResponse } from 'next/server'

export default function middleware(req: Request) {
  // Authentication is handled in API route handlers via NextAuth.
  // Webhooks and public endpoints pass through.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}