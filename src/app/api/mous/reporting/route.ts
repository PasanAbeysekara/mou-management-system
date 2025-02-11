import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Maps an admin role to its corresponding domain key.
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
    case 'SUPER_ADMIN':
      // SUPER_ADMIN can see all domains; for reporting, we can choose to show all MOUs.
      return null;
    default:
      return null;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const role = session.user.role;
    const domain = getDomainFromRole(role);
    
    let mouList;
    if (!domain) {
      // If the user is SUPER_ADMIN, return all MOUs.
      mouList = await prisma.mou_submissions.findMany({
        orderBy: { dateSubmitted: 'desc' },
      });
    } else {
      // Otherwise, filter MOUs to those that contain the key for the admin's domain.
      // We assume that every MOU has a status JSON object.
      const allMous = await prisma.mou_submissions.findMany({
        orderBy: { dateSubmitted: 'desc' },
      });
      mouList = allMous.filter((mou) => {
        if (!mou.status || typeof mou.status !== 'object') return false;
        // Type-cast status to a known shape
        const typedStatus = mou.status as {
          legal?: { approved: boolean; date?: string | null };
          faculty?: { approved: boolean; date?: string | null };
          senate?: { approved: boolean; date?: string | null };
          ugc?: { approved: boolean; date?: string | null };
        };
        // Include MOUs where the domain key exists (approved or pending)
        return typedStatus[domain] !== undefined;
      });
    }
    
    return NextResponse.json(mouList);
  } catch (error) {
    console.error('Error fetching reporting data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
