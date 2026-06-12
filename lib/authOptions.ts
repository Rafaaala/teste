import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import { getCustomerByPhone, getCustomerByEmail } from '@/lib/database/queries/customer'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        email: { label: 'Email', type: 'text' },
      },
      async authorize(credentials) {
        const phone = credentials?.phone?.trim() || null
        const email = credentials?.email?.trim()?.toLowerCase() || null

        if (!phone && !email) return null

        let customer = null
        if (phone) customer = await getCustomerByPhone(phone.replace(/\D/g, ''))
        if (!customer && email) customer = await getCustomerByEmail(email)
        if (!customer) return null

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email || undefined,
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.userId = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      // @ts-ignore
      session.user = session.user || {}
      // @ts-ignore
      session.user.id = (token as any).userId
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions
