import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const mou = await prisma.mou_submissions.findUnique({
      where: { id },
    });
    if (!mou) {
      return NextResponse.json({ error: 'MOU not found' }, { status: 404 });
    }
    return NextResponse.json(mou);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
