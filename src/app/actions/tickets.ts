'use server'

import prisma from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTicket(formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error("Not authenticated")
  if (user.role === 'Department Head') throw new Error("Department Heads are not allowed to create incidents")

  const title = formData.get('title') as string
  let description = formData.get('description') as string
  const categoryId = formData.get('categoryId') as string
  const severity = formData.get('severity') as string || 'MEDIUM'
  const criticalReason = formData.get('criticalReason') as string

  if (severity === 'CRITICAL' && criticalReason) {
    description = `[CRITICAL JUSTIFICATION]: ${criticalReason}\n\n${description}`
  }

  // 1. Get Category to find the Department
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  })

  if (!category) throw new Error("Invalid category")

  // 2. Automated Routing Logic: Find the Department Head
  const deptHead = await prisma.user.findFirst({
    where: {
      departmentId: category.departmentId,
      role: 'Department Head'
    }
  })

  // 3. Create the ticket (unassigned) and audit log
  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      categoryId,
      departmentId: category.departmentId,
      creatorId: user.id,
      responderId: null, // Leaves it unassigned for the Dept Head to delegate
      status: 'OPEN',
      severity,
      auditLogs: {
        create: {
          action: 'CREATED',
          actorId: user.id,
          details: JSON.stringify({ notes: 'Awaiting Department Head assignment' })
        }
      }
    }
  })

  // 4. Mock Email Notification to Department Head
  if (deptHead) {
    console.log(`[EMAIL SENT] To: ${deptHead.email} - Subject: Action Required: New Ticket in your department needs assignment: ${ticket.title} (ID: ${ticket.id})`)
  } else {
    console.log(`[EMAIL SENT] To: Global Admin - Subject: Missing Dept Head for Ticket: ${ticket.title} (ID: ${ticket.id})`)
  }

  revalidatePath('/tickets')
  redirect('/tickets')
}

export async function reopenTicket(ticketId: string) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify the caller is the ticket creator
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { creatorId: true, status: true },
  })

  if (!ticket) throw new Error('Ticket not found')
  if (ticket.creatorId !== user.id) throw new Error('Access denied: only the creator may reopen this ticket')
  if (ticket.status !== 'RESOLVED') throw new Error('Only RESOLVED tickets can be reopened')

  // Update status and append audit log atomically
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: 'REOPENED',
      auditLogs: {
        create: {
          action:  'REOPENED',
          actorId: user.id,
          details: JSON.stringify({ previousStatus: 'RESOLVED' }),
        },
      },
    },
  })

  revalidatePath('/tickets')
  revalidatePath(`/tickets/${ticketId}`)
  redirect('/tickets')
}
