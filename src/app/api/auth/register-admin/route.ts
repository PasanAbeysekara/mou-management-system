import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Must be SUPER_ADMIN to create other admins
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, role, name, department } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // For new domain admins, store an empty password or random placeholder
    const hashedEmptyPassword = await bcrypt.hash('', 10);

    const newAdmin = await prisma.user.create({
      data: {
        email,
        role,
        name,
        department,
        password: hashedEmptyPassword,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user: newAdmin });
  } catch (error) {
    console.error('Register admin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
