import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, department, password } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        department,
        password: hashedPassword,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Return success (you can auto-login or just return user data)
    const { password: _, ...userData } = newUser
    return NextResponse.json({
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
