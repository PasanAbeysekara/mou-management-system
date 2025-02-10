import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * Creates the first SUPER_ADMIN user with an empty password.
 * If a SUPER_ADMIN already exists, it returns an error.
 */
export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    // Check if there's already a SUPER_ADMIN
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });
    if (existingSuperAdmin) {
      return NextResponse.json({ error: 'A Super Admin already exists.' }, { status: 400 });
    }

    // Create SUPER_ADMIN with empty password (e.g. hashed empty string)
    const hashedEmptyPassword = await bcrypt.hash('', 10);

    const newSuperAdmin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedEmptyPassword, // empty password for now
        role: 'SUPER_ADMIN',
      },
    });

    return NextResponse.json({ user: { id: newSuperAdmin.id, email: newSuperAdmin.email } });
  } catch (error) {
    console.error('Register super admin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
