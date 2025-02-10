import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Verify super admin authorization
    const token = (await cookies()).get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
    };

    const superAdmin = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create admin user
    const { name, email, password, role, department } = await request.json();

    // Validate admin role
    const validAdminRoles = ['LEGAL_ADMIN', 'FACULTY_ADMIN', 'SENATE_ADMIN', 'UGC_ADMIN'];
    if (!validAdminRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid admin role' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const adminUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        department,
        addedBy: superAdmin.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
    });

    return NextResponse.json({ user: adminUser });
  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}