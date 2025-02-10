import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Example: fetch the 5 most recently created MOUs
    const recentMOUs = await prisma.mou_submissions.findMany({
      orderBy: {
        dateSubmitted: 'desc',
      },
      take: 5,
    })

    return NextResponse.json(recentMOUs)
  } catch (error) {
    console.error('Error fetching recent MOUs:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
