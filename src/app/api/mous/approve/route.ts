// app/api/mous/approve/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

function getDomainFromRole(role: string) {
  switch (role.toUpperCase()) {
    case 'LEGAL_ADMIN':
      return 'legal';
    case 'FACULTY_ADMIN':
      return 'faculty';
    case 'SENATE_ADMIN':
      return 'senate';
    case 'UGC_ADMIN':
      return 'ugc';
    default:
      return 'unknown';
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const domain = getDomainFromRole(session.user.role);
    if (domain === 'unknown') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json(); // { id: 'mouId' }

    // Retrieve existing MOU
    const mou = await prisma.mou_submissions.findUnique({
      where: { id },
    });
    if (!mou) {
      return NextResponse.json({ error: 'MOU not found' }, { status: 404 });
    }

    // Mark the domain step as true => approved
    const newStatus = { ...(mou.status as object), [domain]: {"date": new Date().toISOString(), "approved": true} };

    const updated = await prisma.mou_submissions.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
