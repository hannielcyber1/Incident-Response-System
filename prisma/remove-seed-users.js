const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const seedNames = ['Admin Alice', 'IT Head Bob', 'IT Responder Charlie', 'HR Responder Diana', 'Employee Eve']
  
  const users = await prisma.user.findMany({
    where: { name: { in: seedNames } }
  })
  
  const userIds = users.map(u => u.id)

  if (userIds.length > 0) {
    // Delete AuditLogs
    await prisma.auditLog.deleteMany({
      where: { actorId: { in: userIds } }
    })

    // Delete Tickets where they are creator or responder
    await prisma.ticket.deleteMany({
      where: {
        OR: [
          { creatorId: { in: userIds } },
          { responderId: { in: userIds } }
        ]
      }
    })

    // Now delete the users
    const deleted = await prisma.user.deleteMany({
      where: { id: { in: userIds } }
    })
    
    console.log(`Removed ${deleted.count} seeded mock users and their associated tickets/logs.`)
  } else {
    console.log('No seeded users found to remove.')
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())
