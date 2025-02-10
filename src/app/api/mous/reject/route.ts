// app/api/mous/reject/route.ts
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
    // ...
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

    const { id } = await request.json();

    const mou = await prisma.mou_submissions.findUnique({
      where: { id },
    });
    if (!mou) {
      return NextResponse.json({ error: 'MOU not found' }, { status: 404 });
    }

    // If you have a "reject" concept, maybe set status[domain] = false but also "rejected: true"?
    // For simplicity, let's just set status[domain] = false to remain pending, or store a new field
    // In real code, you might handle rejections differently. We'll just show a placeholder:
    const updated = await prisma.mou_submissions.update({
      where: { id },
      data: { status: { ...(mou.status as object), [domain]: false } },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
