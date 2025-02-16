import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;
    const submittedBy = session.user.email || session.user.name || 'Unknown';

    // Parse the request body
    const {
      title,
      partnerOrganization,
      purpose,
      description,
      datesSigned,   // optional
      validUntil,
      renewalOf,     // optional – parent MOU id for renewal
      organizationId, // optional: if provided, the selected organization's id
      status,        // JSON object (e.g. { legal: { approved: false, date: null }, ... })
      documents,     // JSON (e.g. { justification: "url" })
      history        // JSON array (e.g. [ { action: "Created", date: "..." } ])
    } = await request.json();

    // Validate required fields (do not include organizationId or renewalOf in required check)
    if (
      !title ||
      !partnerOrganization ||
      !purpose ||
      !description ||
      !validUntil ||
      !status ||
      !documents ||
      !history
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert and validate date fields
    const validUntilDate = new Date(validUntil);
    if (isNaN(validUntilDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid "validUntil" date format' },
        { status: 400 }
      );
    }

    let datesSignedDate: Date | null = null;
    if (datesSigned) {
      const parsed = new Date(datesSigned);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: 'Invalid "datesSigned" date format' },
          { status: 400 }
        );
      }
      datesSignedDate = parsed;
    }

    // If renewalOf is provided, verify that the parent MOU exists and update its history.
    let parentConnect = undefined;
    if (renewalOf) {
      const parentMOU = await prisma.mou_submissions.findUnique({
        where: { id: renewalOf },
      });
      if (!parentMOU) {
        return NextResponse.json({ error: 'Parent MOU not found' }, { status: 404 });
      }
      
      // Update parent's history (optional)
      const parentHistory: any[] = Array.isArray(parentMOU.history) ? parentMOU.history : [];
      parentHistory.push({
        action: "Renewed",
        date: new Date().toISOString(),
        renewedBy: submittedBy,
      });
      await prisma.mou_submissions.update({
        where: { id: renewalOf },
        data: { history: parentHistory },
      });
      parentConnect = { connect: { id: renewalOf } };
    }

    // Create the new MOU submission record using nested relations.
    const newMOU = await prisma.mou_submissions.create({
      data: {
        id: crypto.randomUUID(),
        title,
        partnerOrganization,
        purpose,
        description,
        validUntil: validUntilDate,
        submittedBy,
        status,         // JSON
        documents,      // JSON
        history,        // JSON array provided in request
        datesSigned: datesSignedDate,
        // Do NOT include `renewalOf` as a top-level field here.
        parentMOU: parentConnect,
        // If organizationId is provided, connect it; otherwise, leave it undefined.
        Organization: organizationId ? { connect: { id: organizationId } } : undefined,
        user: { connect: { id: userId } },
      },
    });

    return NextResponse.json(newMOU, { status: 201 });
  } catch (error) {
    console.error('Error creating MOU submission:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    let mouList;
    if (isAdminRole(userRole)) {
      mouList = await prisma.mou_submissions.findMany({
        orderBy: { dateSubmitted: 'desc' },
      });
    } else {
      mouList = await prisma.mou_submissions.findMany({
        where: { userId },
        orderBy: { dateSubmitted: 'desc' },
      });
    }

    return NextResponse.json(mouList);
  } catch (error) {
    console.error('Error fetching MOU submissions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Helper to check if user role is an admin or super admin.
 */
function isAdminRole(role: string) {
  return [
    'LEGAL_ADMIN',
    'FACULTY_ADMIN',
    'SENATE_ADMIN',
    'UGC_ADMIN',
    'SUPER_ADMIN',
  ].includes(role);
}
