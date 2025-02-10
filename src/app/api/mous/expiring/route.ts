import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role;

    // MOUs that expire in <= 30 days but still in the future
    const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let expiring;
    if (isAdminRole(role)) {
      expiring = await prisma.mou_submissions.findMany({
        where: {
          validUntil: {
            lte: soon,
            gt: new Date(),
          },
        },
        orderBy: { validUntil: 'asc' },
      });
    } else {
      expiring = await prisma.mou_submissions.findMany({
        where: {
          userId,
          validUntil: {
            lte: soon,
            gt: new Date(),
          },
        },
        orderBy: { validUntil: 'asc' },
      });
    }

    return NextResponse.json(expiring);
  } catch (error) {
    console.error('Error fetching expiring MOUs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function isAdminRole(role: string) {
  return [
    'LEGAL_ADMIN',
    'FACULTY_ADMIN',
    'SENATE_ADMIN',
    'UGC_ADMIN',
    'SUPER_ADMIN',
  ].includes(role);
}
