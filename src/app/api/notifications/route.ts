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
      return NextResponse.json({ error: "MOU not found" }, { status: 404 });
    }

    // Check if a notification already exists for this MOU
    const existingNotification = await prisma.notification.findFirst({
      where: {
        mouId: mou.id,
        userId: mou.userId,
      },
    });

    if (existingNotification) {
      // If notification exists, update the "read" property to true
      await prisma.notification.update({
        where: { id: existingNotification.id },
        data: { read: true, createdAt: new Date() }, // Reset timestamp if needed
      });

      return NextResponse.json({
        success: true,
        message: "Notification updated as read.",
      });
    }

    // If no existing notification, create a new one
    const newNotification = await prisma.notification.create({
      data: {
        userId: mou.userId,
        mouId: mou.id,
        title: "MOU Expiring Soon",
        message: `Your MOU titled "${mou.title}" is expiring on ${new Date(
          mou.validUntil
        ).toLocaleDateString()}. Please consider renewing it.`,
      },
    });

    return NextResponse.json({
      success: true,
      notification: newNotification,
    });
  } catch (error) {
    console.error("Notification POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

