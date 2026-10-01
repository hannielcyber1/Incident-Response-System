import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const { name, password } = await request.json()
  
  const user = await prisma.user.findFirst({
    where: { name }
  })

  if (!user || user.password !== password) {
    return NextResponse.json({ error: 'Invalid name or password' }, { status: 401 })
  }

  if (!user.isActive) {
    return NextResponse.json({ error: 'Your account has been deactivated. Please contact your administrator.' }, { status: 403 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  })

  const cookieStore = await cookies()
  cookieStore.set('userId', user.id, { path: '/' })
  return NextResponse.json({ success: true })
}
