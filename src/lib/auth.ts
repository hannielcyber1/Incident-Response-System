import { cookies } from 'next/headers'
import prisma from './prisma'

export async function getUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  
  if (!userId) return null
  
  return prisma.user.findUnique({
    where: { id: userId },
    include: { department: true }
  })
}
