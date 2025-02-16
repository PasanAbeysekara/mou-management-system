import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const now = new Date();
    // Calculate 90 days from now:
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Find all MOUs that expire in 90 days or less.
    // You might further filter by active MOUs if needed.
    const expiringMOUs = await prisma.mou_submissions.findMany({
      where: {
        validUntil: {
          lte: ninetyDaysFromNow,
        },
      },
    });

    let notificationsCreated = 0;

    for (const mou of expiringMOUs) {
      // Check if a notification has already been created for this MOU with the title "MOU Expiring Soon"
      const existingNotif = await prisma.notification.findFirst({
        where: {
          mouId: mou.id,
          title: {
            equals: "MOU Expiring Soon",
            mode: "insensitive"
          },
        },
      });

      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            userId: mou.userId,
            mouId: mou.id,
            title: "MOU Expiring Soon",
            message: `Your MOU titled "${mou.title}" is expiring on ${new Date(mou.validUntil).toLocaleDateString()}. Please consider renewing it.`,
          },
        });
        notificationsCreated++;
      }
    }

    return NextResponse.json({ success: true, notificationsCreated });
  } catch (error) {
    console.error("Error in auto-notify:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
