// app/api/mou-submissions/route.ts

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
    // Use user's email or name as the submittedBy value
    const submittedBy = session.user.email || session.user.name || 'Unknown';

    // Parse the request body
    const {
      title,
      partnerOrganization,
      purpose,
      description,
      datesSigned,  // optional
      validUntil,
      renewalOf,    // optional – if provided, indicates a renewal submission
      status,       // JSON object (if provided)
      documents,    // JSON (if provided)
      history       // JSON array (if provided)
    } = await request.json();

    // Validate required text fields and validUntil
    if (!title || !partnerOrganization || !purpose || !description || !validUntil) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use default values for JSON fields if not provided
    const finalStatus = status || {
      legal: { approved: false, date: null },
      faculty: { approved: false, date: null },
      senate: { approved: false, date: null },
      ugc: { approved: false, date: null },
    };

    const finalDocuments = documents || {};
    const finalHistory = history || [
      {
        action: 'Created',
        date: new Date().toISOString(),
      },
    ];

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

    // If renewalOf is provided, check that the parent MOU exists.
    if (renewalOf) {
      const parentMOU = await prisma.mou_submissions.findUnique({
        where: { id: renewalOf },
      });
      if (!parentMOU) {
        return NextResponse.json({ error: 'Parent MOU not found' }, { status: 404 });
      }
      
      // Optionally, update parent's history.
      // Here, we assume parent's history is stored as JSON (an array).
      const parentHistory = Array.isArray(parentMOU.history) ? parentMOU.history : [];
      parentHistory.push({
        action: "Renewed",
        date: new Date().toISOString(),
        renewedBy: submittedBy,
      });
      await prisma.mou_submissions.update({
        where: { id: renewalOf },
        data: { history: parentHistory },
      });
    }

    // Insert the new MOU submission record
    const newMOU = await prisma.mou_submissions.create({
      data: {
        // Let Prisma generate the id if you use a default; here we use crypto.randomUUID()
        id: crypto.randomUUID(),
        title,
        partnerOrganization,
        purpose,
        description,
        validUntil: validUntilDate,
        submittedBy,
        status: finalStatus,       // JSON
        documents: finalDocuments, // JSON
        history: finalHistory,     // JSON array

        // Optional fields
        datesSigned: datesSignedDate,
        renewalOf: renewalOf || null,

        // Relation
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

    // If user is admin, they might see all submissions; otherwise, only their own
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
