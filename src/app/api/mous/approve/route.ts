// app/api/mous/approve/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { sendApprovalEmail } from '@/lib/email';

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

    const { id } = await request.json(); // Expect payload: { id: 'mouId' }
    if (!id) {
      return NextResponse.json({ error: 'Missing MOU id' }, { status: 400 });
    }

    // Retrieve the existing MOU
    const mou = await prisma.mou_submissions.findUnique({
      where: { id },
    });
    if (!mou) {
      return NextResponse.json({ error: 'MOU not found' }, { status: 404 });
    }

    let newStatus: any;
    const currentTime = new Date().toISOString();
    if (session.user.role.toUpperCase() === 'SUPER_ADMIN') {
      // SUPER_ADMIN can approve all domains
      newStatus = {
        legal: { approved: true, date: currentTime },
        faculty: { approved: true, date: currentTime },
        senate: { approved: true, date: currentTime },
        ugc: { approved: true, date: currentTime },
      };
    } else {
      const domain = getDomainFromRole(session.user.role);
      if (domain === 'unknown') {
        return NextResponse.json({ error: 'Forbidden: Your role cannot approve MOUs' }, { status: 403 });
      }
      newStatus = { ...(mou.status as object), [domain]: { approved: true, date: currentTime } };
    }

    // Update the MOU submission's status
    const updated = await prisma.mou_submissions.update({
      where: { id },
      data: { status: newStatus },
    });

    // Send email notification to the submitter
    const emailTo = mou.submittedBy;
    const subject = "Your MOU Has Been Approved";
    const html = `
      <p>Dear (${mou.submittedBy}),</p>
      <p>Your MOU titled "<strong>${mou.title}</strong>" has been approved by our ${session.user.role}.</p>
      <p>Please log in to your dashboard for more details.</p>
      <p>Thank you!</p>
    `;
    await sendApprovalEmail(emailTo, subject, html);

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
