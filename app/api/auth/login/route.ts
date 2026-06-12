import { NextResponse } from 'next/server'
import { encode } from 'next-auth/jwt'
import { getCustomerByPhone, getCustomerByEmail } from '@/lib/database/queries/customer'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const phone = body.phone?.trim()
    const email = body.email?.trim()?.toLowerCase()

    if (!phone && !email) {
      return NextResponse.json({ error: 'Telefone ou email são necessários' }, { status: 400 })
    }

    let customer = null
    if (phone) customer = await getCustomerByPhone(phone.replace(/\D/g, ''))
    if (!customer && email) customer = await getCustomerByEmail(email)

    if (!customer) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Create next-auth JWT and set cookie so NextAuth recognizes session
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) throw new Error('NEXTAUTH_SECRET não configurado')
    const token = await encode({ token: { sub: customer.id, userId: customer.id }, secret })

    const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
    const secure = process.env.NODE_ENV === 'production'
    const maxAge = 30 * 24 * 60 * 60
    const cookie = `${cookieName}=${token}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=Lax${secure ? '; Secure' : ''}`

    const res = NextResponse.json({ userId: customer.id })
    res.headers.set('Set-Cookie', cookie)
    return res
  } catch (error) {
    console.error('[POST /api/auth/login]', error)
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 })
  }
}