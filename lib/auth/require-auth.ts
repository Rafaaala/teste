// lib/auth/require-auth.ts
import { auth }              from '@clerk/nextjs/server'
import { NextResponse }      from 'next/server'
import { getUserByClerkId }  from '@/lib/database/queries/users'
import type { User }         from '@/lib/database/queries/users'

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
  allowedRoles?: UserRole[]
): Promise<AuthResult | AuthError> {
  const { userId } = await auth()

  if (!userId) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
  }

  const user = await getUserByClerkId(userId)

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Usuário não encontrado no sistema' },
        { status: 403 }
      )
    }
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Sem permissão para esta ação' },
        { status: 403 }
      )
    }
  }

  return { user, response: null }
}