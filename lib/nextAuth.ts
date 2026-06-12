import { getToken } from 'next-auth/jwt'

export async function getNextAuthSession(req: Request): Promise<{ userId: string } | null> {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return null
    const userId = (token.userId ?? token.sub) as string
    if (!userId) return null
    return { userId }
  } catch (e) {
    return null
  }
}
