'use server'

import prisma from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function requireUser() {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')
  return user
}

function revalidateDashboard(ticketId: string) {
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/tickets/${ticketId}`)
}

// ── Actions ───────────────────────────────────────────────────────────────────

/**
 * Update a ticket's status.
 * Allowed roles: Incident Handler, Department Head, Admin
 */
export async function updateTicketStatus(ticketId: string, status: string) {
  const user = await requireUser()

  const allowed = ['Incident Handler', 'Department Head', 'Admin']
  if (!allowed.includes(user.role)) {
    throw new Error('Forbidden: insufficient role')
  }

  // Fetch ticket to enforce department scoping
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
  if (!ticket) throw new Error('Ticket not found')

  if (
    user.role !== 'Admin' &&
    ticket.departmentId !== user.departmentId
  ) {
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

  revalidateDashboard(ticketId)
}

/**
 * Update a ticket's severity.
 * Allowed roles: Department Head, Admin
 */
export async function updateTicketSeverity(ticketId: string, severity: string) {
  const user = await requireUser()

  const allowed = ['Department Head', 'Admin']
  if (!allowed.includes(user.role)) {
    throw new Error('Forbidden: only Department Head or Admin may change severity')
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
  if (!ticket) throw new Error('Ticket not found')

  if (
    user.role !== 'Admin' &&
    ticket.departmentId !== user.departmentId
  ) {
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

/**
 * Reassign a ticket to a different Incident Handler.
 * Allowed roles: Department Head, Admin
 */
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

  if (
    user.role !== 'Admin' &&
    ticket.departmentId !== user.departmentId
  ) {
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

  console.log(`[EMAIL SENT] To: ${newResponder.email} - Subject: Ticket Reassigned to You: ${ticket.title} (ID: ${ticket.id})`)

  revalidateDashboard(ticketId)
}
