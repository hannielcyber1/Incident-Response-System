'use server'
import prisma from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function markNotificationAsRead(notificationId: string) {
  const user = await getUser()
  if (!user) return

  await prisma.notification.update({
    where: { id: notificationId, userId: user.id },
    data: { isRead: true }
  })
  revalidatePath('/', 'layout')
}

export async function markAllNotificationsAsRead() {
  const user = await getUser()
  if (!user) return

  await prisma.notification.updateMany({
    where: { userId: user.id },
    data: { isRead: true }
  })
  revalidatePath('/', 'layout')
}
