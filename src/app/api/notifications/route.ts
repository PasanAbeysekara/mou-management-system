import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch notifications for the current user
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Parse the JSON body; we expect { mouId: string }
    const { mouId } = await request.json();

    // Retrieve the MOU submission to get details and identify the submitter
    const mou = await prisma.mou_submissions.findUnique({
      where: { id: mouId },
    });

    if (!mou) {
      return NextResponse.json({ error: 'MOU not found' }, { status: 404 });
    }

    // Create a notification for the user who submitted this MOU.
    // Customize the title and message as needed.
    const notification = await prisma.notification.create({
      data: {
        userId: mou.userId,
        mouId: mou.id,
        title: "MOU Expiring Soon",
        message: `Your MOU titled "${mou.title}" is expiring on ${new Date(mou.validUntil).toLocaleDateString()}. Please consider renewing it.`,
      },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Notification POST error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
