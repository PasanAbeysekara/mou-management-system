import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { DashboardAnalytics } from '@/types'

export async function GET() {
  try {
    // Pass in the same authOptions you exported from [...nextauth]
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Optional: check user role
    // if (session.user.role === 'USER') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    const [
      totalSubmissions,
      activeSubmissions,
      pendingSubmissions,
      expiringMOUs,
    ] = await Promise.all([
      prisma.mou_submissions.count(),
      prisma.mou_submissions.count({
        where: {
          AND: [
            {
              status: {
                path: '$.ugc.approved',
                equals: true,
              },
            },
            {
              validUntil: {
                gt: new Date(),
              },
            },
          ],
        },
      }),
      prisma.mou_submissions.count({
        where: {
          OR: [
            {
              status: {
                path: '$.legal.approved',
                equals: false,
              },
            },
            {
              status: {
                path: '$.faculty.approved',
                equals: false,
              },
            },
            {
              status: {
                path: '$.senate.approved',
                equals: false,
              },
            },
            {
              status: {
                path: '$.ugc.approved',
                equals: false,
              },
            },
          ],
        },
      }),
      prisma.mou_submissions.count({
        where: {
          validUntil: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gt: new Date(),
          },
        },
      }),
    ])

    const approvalRate = await calculateApprovalRate()

    const analytics: DashboardAnalytics = {
      totalSubmissions,
      activeSubmissions,
      pendingSubmissions,
      expiringMOUs,
      approvalRate,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

async function calculateApprovalRate() {
  const totalCompleted = await prisma.mou_submissions.count({
    where: {
      status: {
        path: '$.ugc.approved',
        equals: true,
      },
    },
  })
  const total = await prisma.mou_submissions.count()
  return total > 0 ? (totalCompleted / total) * 100 : 0
}
