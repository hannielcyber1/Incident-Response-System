'use server'

import prisma from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const admin = await getUser()
  if (!admin || admin.role !== 'Admin') throw new Error('Forbidden')
  return admin
}

export async function createUser(formData: FormData) {
  await assertAdmin()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string
  const departmentId = formData.get('departmentId') as string

  if (!name || !email || !password || !role) throw new Error('Missing required fields')

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('User with this email already exists')

  await prisma.user.create({
    data: { name, email, password, role, departmentId: departmentId || null }
  })

  console.log(`[EMAIL SENT] To: ${email} - Subject: Welcome to Incident Response System! Your login name: "${name}" | Password: ${password}`)
  revalidatePath('/admin/users')
}

export async function updateUser(formData: FormData) {
  await assertAdmin()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const departmentId = formData.get('departmentId') as string
  const password = formData.get('password') as string

  const data: Record<string, unknown> = { name, email, role, departmentId: departmentId || null }
  if (password && password.trim() !== '') data.password = password

  await prisma.user.update({ where: { id }, data })
  revalidatePath('/admin/users')
}

export async function toggleUserActive(id: string, isActive: boolean) {
  await assertAdmin()
  await prisma.user.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/users')
}

export async function deleteUser(id: string) {
  await assertAdmin()

  // Cannot delete self
  const admin = await getUser()
  if (admin?.id === id) throw new Error('You cannot delete your own account')

  // Delete related records first due to FK constraints
  await prisma.auditLog.deleteMany({ where: { actorId: id } })
  await prisma.ticket.updateMany({ where: { responderId: id }, data: { responderId: null } })
  await prisma.user.delete({ where: { id } })
  revalidatePath('/admin/users')
}
