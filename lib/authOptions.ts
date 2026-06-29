import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import bcrypt from 'bcrypt'
import { getCustomerByPhone, getCustomerByEmail } from '@/lib/database/queries/customer'
import { getUserByEmail } from '@/lib/database/queries/users'
import { requireEnv } from '@/lib/env'

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Clientes (delivery) ──────────────────────────────────────────────
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        email: { label: 'Email',  type: 'text' },
      },
      async authorize(credentials) {
        const phone = credentials?.phone?.trim() || null
        const email = credentials?.email?.trim()?.toLowerCase() || null

        if (!phone && !email) return null

        let customer = null
        if (phone)            customer = await getCustomerByPhone(phone.replace(/\D/g, ''))
        if (!customer && email) customer = await getCustomerByEmail(email)
        if (!customer) return null

        return {
          id:    customer.id,
          name:  customer.name,
          email: customer.email || undefined,
        }
      },
    }),

    // ── Staff / Admin (painel interno) ───────────────────────────────────
    // Autentica funcionários pelo e-mail + senha armazenada em `users.password_hash`.
    // Pré-requisito de banco: ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
    CredentialsProvider({
      id: 'staff',
      name: 'Staff',
      credentials: {
        email:    { label: 'Email', type: 'email'    },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const email    = credentials?.email?.trim()?.toLowerCase()
        const password = credentials?.password

        if (!email || !password) return null

        const user = await getUserByEmail(email)
        if (!user || !user.password_hash) return null

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return null

        return {
          id:    user.id,
          name:  user.name,
          email: user.email ?? undefined,
          // @ts-ignore – campos extras propagados para o JWT
          role:    user.role,
          isStaff: true,
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id
        if ((user as any).isStaff) {
          token.isStaff = true
          token.role    = (user as any).role
        }
      }
      return token
    },

    async session({ session, token }) {
      // @ts-ignore
      session.user      = session.user || {}
      // @ts-ignore
      session.user.id   = (token as any).userId
      if ((token as any).isStaff) {
        // @ts-ignore
        session.user.isStaff = true
        // @ts-ignore
        session.user.role    = (token as any).role
      }
      return session
    },
  },

  secret: requireEnv('NEXTAUTH_SECRET'),
}

export default authOptions
