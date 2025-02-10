import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../[...nextauth]/route";
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 1) Check session via NextAuth
    const session = await getServerSession(authOptions);

    // If no session or missing user email, consider them unauthenticated
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2) Fetch user data from Prisma, if needed
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        avatar: true,
        // add or remove fields as you wish
      },
    });

    // If somehow user not found in DB
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3) Return user data
    return NextResponse.json({ user });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
