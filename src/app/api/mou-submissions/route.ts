import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * POST /api/mou-submissions
 * Creates a new MOU submission with all mandatory fields.
 *
 * GET /api/mou-submissions
 * Returns MOU submissions (user-specific or admin scope).
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;
    // You might store user name or email in "submittedBy"
    const submittedBy = session.user.email || session.user.name || 'Unknown';

    // Parse the request body
    const {
      title,
      partnerOrganization,
      purpose,
      description,
      datesSigned,  // optional
      validUntil,
      renewalOf,    // optional
      status,       // JSON
      documents,    // JSON
      history       // JSON
    } = await request.json();

    // Validate required fields
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

    // Convert date fields
    const validUntilDate = new Date(validUntil);
    if (isNaN(validUntilDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid "validUntil" date format' },
        { status: 400 }
      );
    }

    // datesSigned is optional
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

    // Insert into DB
    const newMOU = await prisma.mou_submissions.create({
      data: {
        // Mandatory fields
        id: crypto.randomUUID(), // or let DB handle if you declared @default(uuid())
        title,
        partnerOrganization,
        purpose,
        description,
        validUntil: validUntilDate,
        submittedBy,
        status,         // JSON
        documents,      // JSON
        history,        // JSON

        // Optional fields
        datesSigned: datesSignedDate,
        renewalOf: renewalOf || null,

        // Relations
        userId
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

    // If user is admin, they might see all submissions or only relevant ones
    // Otherwise, only their own
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
 * Adjust roles as needed for your domain logic.
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
