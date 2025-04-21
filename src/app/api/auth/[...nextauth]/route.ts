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
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }
        
        // 1) Look up user in DB
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) throw new Error('User not found');

        // 2) Check password
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error('Invalid credentials');

        // 3) Return data that goes into the JWT
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name, // if you want
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user,trigger, session }) {
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.avatar = session.user.avatar;
      }
      // When user logs in for the first time, transfer user fields to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Transfer token fields to session user object
      if (session.user) {
        session.user.id = token.sub || '';
        session.user.role = token.role;
        session.user.name = token.name || '';
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
