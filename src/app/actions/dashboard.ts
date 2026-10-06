'use server'

import prisma from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { sendEmail, ADMIN_EMAILS } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

async function requireUser() {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')
  return user
}

function revalidateDashboard(ticketId: string) {
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/tickets/${ticketId}`)
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const user = await requireUser()

  const allowed = ['Incident Handler', 'Department Head', 'Admin']
  if (!allowed.includes(user.role)) {
    throw new Error('Forbidden: insufficient role')
  }

  const ticket = await prisma.ticket.findUnique({ 
    where: { id: ticketId },
    include: { creator: true, responder: true }
  })
  if (!ticket) throw new Error('Ticket not found')

  if (user.role !== 'Admin' && ticket.departmentId !== user.departmentId) {
    throw new Error('Forbidden: ticket not in your department')
  }

  const previous = ticket.status

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  })

  await prisma.auditLog.create({
    data: {
      ticketId,
      action: 'STATUS_CHANGED',
      actorId: user.id,
      details: JSON.stringify({ from: previous, to: status }),
    },
  })

  // Notify creator
  await createNotification(
    ticket.creatorId,
    'Ticket Status Updated',
    `Your ticket "${ticket.title}" is now ${status.replace('_', ' ')}.`,
    status === 'RESOLVED' ? 'SUCCESS' : 'INFO',
    ticket.id
  )

  await sendEmail({
    to: ticket.creator.email,
    subject: `Ticket Update: ${ticket.title}`,
    html: `<p>Your ticket <strong>${ticket.title}</strong> is now <strong>${status.replace('_', ' ')}</strong>.</p>`
  })

  revalidateDashboard(ticketId)
}

export async function updateTicketSeverity(ticketId: string, severity: string) {
  const user = await requireUser()

  const allowed = ['Department Head', 'Admin']
  if (!allowed.includes(user.role)) {
    throw new Error('Forbidden: only Department Head or Admin may change severity')
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
  if (!ticket) throw new Error('Ticket not found')

  if (user.role !== 'Admin' && ticket.departmentId !== user.departmentId) {
    throw new Error('Forbidden: ticket not in your department')
  }

  const previous = ticket.severity

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { severity },
  })

  await prisma.auditLog.create({
    data: {
      ticketId,
      action: 'SEVERITY_CHANGED',
      actorId: user.id,
      details: JSON.stringify({ from: previous, to: severity }),
    },
  })

  revalidateDashboard(ticketId)
}

export async function reassignTicket(ticketId: string, newResponderId: string) {
  const user = await requireUser()

  const allowed = ['Department Head', 'Admin']
  if (!allowed.includes(user.role)) {
    throw new Error('Forbidden: only Department Head or Admin may reassign tickets')
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { responder: true },
  })
  if (!ticket) throw new Error('Ticket not found')

  if (user.role !== 'Admin' && ticket.departmentId !== user.departmentId) {
    throw new Error('Forbidden: ticket not in your department')
  }

  const newResponder = await prisma.user.findUnique({ where: { id: newResponderId } })
  if (!newResponder) throw new Error('New responder not found')

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { responderId: newResponderId },
  })

  await prisma.auditLog.create({
    data: {
      ticketId,
      action: 'REASSIGNED',
      actorId: user.id,
      details: JSON.stringify({
        from: ticket.responder ? ticket.responder.name : 'Unassigned',
        to: newResponder.name,
      }),
    },
  })

  await createNotification(
    newResponder.id,
    'New Ticket Assigned',
    `You have been assigned to: "${ticket.title}"`,
    'ACTION',
    ticket.id
  )

  await sendEmail({
    to: newResponder.email,
    subject: `Ticket Assigned to You: ${ticket.title}`,
    html: `<p>You have been assigned to handle: <strong>${ticket.title}</strong> (ID: ${ticket.id}).</p>`
  })

  revalidateDashboard(ticketId)
}

export async function escalateTicket(ticketId: string, reason: string) {
  const user = await requireUser()

  const allowed = ['Incident Handler', 'Department Head']
  if (!allowed.includes(user.role)) {
    throw new Error('Only Incident Handlers and Department Heads can escalate tickets')
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { department: true }
  })
  if (!ticket) throw new Error('Ticket not found')

  if (ticket.departmentId !== user.departmentId) {
    throw new Error('Forbidden: ticket not in your department')
  }

  if (user.role === 'Incident Handler') {
    const deptHead = await prisma.user.findFirst({
      where: { departmentId: user.departmentId, role: 'Department Head' }
    })

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { responderId: null, status: 'OPEN' },
    })

    await prisma.auditLog.create({
      data: {
        ticketId,
        action: 'ESCALATED',
        actorId: user.id,
        details: JSON.stringify({ reason, escalatedBy: user.name, escalatedTo: 'Department Head' }),
      },
    })

    if (deptHead) {
      await createNotification(
        deptHead.id,
        'Ticket Escalated',
        `"${ticket.title}" was escalated by ${user.name}. Reason: ${reason}`,
        'WARNING',
        ticketId
      )

      await sendEmail({
        to: deptHead.email,
        subject: `Ticket Escalated: ${ticket.title}`,
        html: `<p>Ticket <strong>${ticket.title}</strong> was escalated by ${user.name}.</p><p>Reason: ${reason}</p>`
      })
    }
  } else if (user.role === 'Department Head') {
    await prisma.auditLog.create({
      data: {
        ticketId,
        action: 'ESCALATED',
        actorId: user.id,
        details: JSON.stringify({ reason, escalatedBy: user.name, escalatedTo: 'Admin' }),
      },
    })

    const admins = await prisma.user.findMany({ where: { role: 'Admin' } })
    for (const admin of admins) {
      await createNotification(
        admin.id,
        'Ticket Escalated to Admin',
        `"${ticket.title}" requires Admin intervention. Escalated by Dept Head ${user.name}. Reason: ${reason}.`,
        'ACTION',
        ticketId
      )
    }

    await sendEmail({
      to: ADMIN_EMAILS,
      subject: `Ticket Escalated to Admin: ${ticket.title}`,
      html: `<p>Ticket <strong>${ticket.title}</strong> was escalated to ADMIN by ${user.name}.</p><p>Reason: ${reason}</p>`
    })
  }

  revalidateDashboard(ticketId)
}
