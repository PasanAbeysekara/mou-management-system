import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Helper to map an admin role to its corresponding domain key.
 */
function getDomainFromRole(role: string): 'legal' | 'faculty' | 'senate' | 'ugc' | null {
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
      return null;
  }
}

/**
 * GET /api/mous/pending
 * 
 * - For domain admins: returns MOUs pending approval for their specific domain.
 * - For SUPER_ADMIN: returns all MOUs that are pending in any domain.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userRole = session.user.role;
    let pendingMOUs = [];

    if (userRole.toUpperCase() === 'SUPER_ADMIN') {
      // For SUPER_ADMIN, return MOUs where at least one domain is pending (i.e. approved is false)
      const allMous = await prisma.mou_submissions.findMany({
        orderBy: { dateSubmitted: 'desc' },
      });
      pendingMOUs = allMous.filter((mou) => {
        if (!mou.status || typeof mou.status !== 'object') return false;
        const status = mou.status as {
          legal?: { approved: boolean };
          faculty?: { approved: boolean };
          senate?: { approved: boolean };
          ugc?: { approved: boolean };
        };
        // Consider a MOU pending if ANY domain is not approved.
        return (
          (status.legal && !status.legal.approved) ||
          (status.faculty && !status.faculty.approved) ||
          (status.senate && !status.senate.approved) ||
          (status.ugc && !status.ugc.approved)
        );
      });
    } else {
      // For a domain admin, filter based on their specific domain.
      const domain = getDomainFromRole(userRole);
      if (!domain) {
        // If the role doesn't map to a domain (or user is not admin), return an empty list.
        return NextResponse.json([]);
      }
      const allMous = await prisma.mou_submissions.findMany({
        orderBy: { dateSubmitted: 'desc' },
      });
      pendingMOUs = allMous.filter((mou) => {
        if (!mou.status || typeof mou.status !== 'object') return false;
        const status = mou.status as {
          legal?: { approved: boolean };
          faculty?: { approved: boolean };
          senate?: { approved: boolean };
          ugc?: { approved: boolean };
        };
        return status[domain] !== undefined && status[domain].approved === false;
      });
    }

    return NextResponse.json(pendingMOUs);
  } catch (error) {
    console.error('Error fetching pending MOUs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
