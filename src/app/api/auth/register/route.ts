import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const { name, departmentId, password } = await request.json()
  
  if (!name || !departmentId || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const existing = await prisma.user.findFirst({
    where: { name }
  })

  if (existing) {
    return NextResponse.json({ error: 'An account with this name already exists' }, { status: 400 })
  }

  const email = `${name.replace(/\s+/g, '.').toLowerCase()}@company.com`

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
      departmentId,
      role: 'Employee'
    }
  })

  const cookieStore = await cookies()
  cookieStore.set('userId', user.id, { path: '/' })
  
  return NextResponse.json({ success: true })
}
