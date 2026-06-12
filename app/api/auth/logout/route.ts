import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
    const res = NextResponse.json({ success: true, message: 'Logout efetuado' })
    res.headers.set('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`) 
    return res
  } catch (error) {
    console.error('[POST /api/auth/logout]', error)
    return NextResponse.json({ error: 'Erro ao fazer logout' }, { status: 500 })
  }
}