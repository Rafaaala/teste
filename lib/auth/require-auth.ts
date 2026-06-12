// lib/auth/require-auth.ts
import { getToken }   from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { getUserById }  from '@/lib/database/queries/users'
import type { User }    from '@/lib/database/queries/users'

type UserRole = 'admin' | 'gerente' | 'garcom' | 'motoboy'

interface AuthResult {
  user:     User
  response: null
}

interface AuthError {
  user:     null
  response: Response
}

export async function requireAuth(
  req: Request,
  allowedRoles?: UserRole[]
): Promise<AuthResult | AuthError> {
  const token   = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
  const isStaff = (token as any)?.isStaff === true
  const userId  = (token as any)?.userId  as string | undefined

  if (!token || !isStaff || !userId) {
    return {
      user:     null,
      response: NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      ),
    }
  }

  const user = await getUserById(userId)

  if (!user) {
    return {
      user:     null,
      response: NextResponse.json(
        { error: 'Usuário não encontrado no sistema' },
        { status: 403 }
      ),
    }
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return {
      user:     null,
      response: NextResponse.json(
        { error: 'Sem permissão para esta ação' },
        { status: 403 }
      ),
    }
  }

  return { user, response: null }
}
