// app/api/mous/by-organization/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    if (!orgId) {
      return NextResponse.json({ error: "Missing organization ID" }, { status: 400 });
    }
    const mous = await prisma.mou_submissions.findMany({
      where: { organizationId: orgId },
      orderBy: { dateSubmitted: "desc" },
    });
    return NextResponse.json(mous);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
