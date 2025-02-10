import NextAuth from 'next-auth'
import type { DefaultSession, NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@/types'

declare module 'next-auth' {
    interface User {
      id: string
      name?: string
      email: string
      role: UserRole
      department?: string
      avatar?: string
    }
  
    interface Session extends DefaultSession {
      user: {
        id: string
        email: string
        role: UserRole
        name?: string
        department?: string
        avatar?: string
      } & DefaultSession['user']
    }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    department?: string
  }
}
export const authOptions: NextAuthOptions = {
  // Must set a secret, either from .env or directly here:
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt', // Usually prefer JWT for credentials-based login
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password')
        }

        // Find user in the DB
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) {
          throw new Error('User not found')
        }

        // Check password
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        // Return user object (will be encoded in JWT)
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    // Insert `role` into JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.name = user.name
      }
      return token
    },
    // Make role & name available in the session
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.name = token.name || ''
      }
      return session
    },
  },
}

// 2) Create the NextAuth handler
const handler = NextAuth(authOptions)

// 3) Export for GET & POST
export { handler as GET, handler as POST }
