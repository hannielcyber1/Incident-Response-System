'use server'

import prisma from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendEmail, ADMIN_EMAILS } from '@/lib/email'

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

  // 4. Send Email & Notifications
  const { createNotification } = await import('@/lib/notifications')

  // Always notify the creator that their ticket was received
  await createNotification(
    user.id,
    'Ticket Submitted Successfully',
    `Your ticket "${ticket.title}" has been received and is awaiting assignment.`,
    'INFO',
    ticket.id
  )

  if (deptHead) {
    await sendEmail({
      to: deptHead.email,
      subject: `Action Required: New Ticket in your department`,
      html: `<p>A new ticket requires assignment: <strong>${ticket.title}</strong> (ID: ${ticket.id})</p><p>Submitted by: ${user.name}</p>`
    })
    await createNotification(
      deptHead.id,
      'New Ticket Requires Assignment',
      `"${ticket.title}" submitted by ${user.name} needs to be assigned to a handler.`,
      'ACTION',
      ticket.id
    )
  } else {
    await sendEmail({
      to: ADMIN_EMAILS,
      subject: `Missing Dept Head for Ticket`,
      html: `<p>Ticket <strong>${ticket.title}</strong> was created but no Department Head exists for its department.</p>`
    })
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
