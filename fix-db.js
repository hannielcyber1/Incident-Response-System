const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } }
})

async function main() {
  console.log('=== Fixing database ===')

  // 1. Delete old dummy users (by email)
  const dummyEmails = [
    'omgddy+ithead@gmail.com',
    'omgddy+hrhead@gmail.com',
    'omgddy+alpha@gmail.com',
    'hannielcurry+beta@gmail.com',
    'omgddy+john@gmail.com',
  ]
  for (const email of dummyEmails) {
    const u = await prisma.user.findUnique({ where: { email } })
    if (u) {
      await prisma.auditLog.deleteMany({ where: { actorId: u.id } })
      await prisma.ticket.updateMany({ where: { responderId: u.id }, data: { responderId: null } })
      await prisma.ticket.deleteMany({ where: { creatorId: u.id } })
      await prisma.notification.deleteMany({ where: { userId: u.id } })
      await prisma.user.delete({ where: { id: u.id } })
      console.log(`Deleted dummy user: ${email}`)
    }
  }

  // 2. Add categories for departments that don't have them
  const deptNames = ['HR', 'Accounting', 'Facilities', 'Finance', 'IT']
  const deptMap = {}
  for (const name of deptNames) {
    const d = await prisma.department.findFirst({ where: { name } })
    if (d) deptMap[name] = d.id
  }

  const categoriesToAdd = [
    // HR dept
    { name: 'HR Policy Issue', department: 'HR' },
    { name: 'Employee Complaint', department: 'HR' },
    { name: 'Recruitment Issue', department: 'HR' },
    // Accounting dept  
    { name: 'Expense Report Issue', department: 'Accounting' },
    { name: 'Invoice Problem', department: 'Accounting' },
    { name: 'Budget Query', department: 'Accounting' },
    // Facilities dept (Facilities has Maintenance, add more)
    { name: 'Building Access Issue', department: 'Facilities' },
    { name: 'Safety Hazard', department: 'Facilities' },
    // Finance dept (Finance has Budget Issue, add more)
    { name: 'Financial Compliance', department: 'Finance' },
    { name: 'Vendor Payment Issue', department: 'Finance' },
    // IT dept (already has categories but add more useful ones)
    { name: 'Laptop/Device Issue', department: 'IT' },
    { name: 'Software Installation', department: 'IT' },
  ]

  for (const cat of categoriesToAdd) {
    const deptId = deptMap[cat.department]
    if (!deptId) continue
    const existing = await prisma.category.findFirst({ where: { name: cat.name, departmentId: deptId } })
    if (!existing) {
      await prisma.category.create({ data: { name: cat.name, departmentId: deptId } })
      console.log(`Created category: ${cat.name} (${cat.department})`)
    }
  }

  // 3. Update user emails: first 10 get hannielcurry@gmail.com, next 10 get omgddy@gmail.com
  // Split by name (alphabetical-ish): using the list order
  const userEmailMap = {
    // hannielcurry@gmail.com for first half
    'Hanniel Nyemitei': 'hannielcurry@gmail.com',
    'Owusu Ansah': 'hannielcurry@gmail.com',
    'Joy Adu': 'hannielcurry@gmail.com',
    'Daniel Boateng': 'hannielcurry@gmail.com',
    'Sarah Mensima': 'hannielcurry@gmail.com',
    'Nana Addai': 'hannielcurry@gmail.com',
    'Maise Wilson': 'hannielcurry@gmail.com',
    'Kojo Asare': 'hannielcurry@gmail.com',
    'Lydia Owusu': 'hannielcurry@gmail.com',
    'Emily Warona': 'hannielcurry@gmail.com',
    // omgddy@gmail.com for second half
    'Emily Rapo': 'omgddy@gmail.com',
    'Michael Antwi': 'omgddy@gmail.com',
    'Grace Ofori': 'omgddy@gmail.com',
    'Uzziel Nyemitei': 'omgddy@gmail.com',
    'Jahaziel Nyemitei': 'omgddy@gmail.com',
    'Samuel Agyeman': 'omgddy@gmail.com',
    'Priscilla Boateng': 'omgddy@gmail.com',
    'David Mensah': 'omgddy@gmail.com',
    'Akua Mensah': 'omgddy@gmail.com',
    'Kofi Mensah': 'omgddy@gmail.com',
    'Abigail Asante': 'omgddy@gmail.com',
  }

  for (const [name, email] of Object.entries(userEmailMap)) {
    const user = await prisma.user.findFirst({ where: { name } })
    if (user && user.email !== email) {
      // Check if that email is taken by another user (due to unique constraint)
      // We'll handle duplicates by using email with a tag
      try {
        await prisma.user.update({ where: { id: user.id }, data: { email } })
        console.log(`Updated email for ${name}: ${email}`)
      } catch (e) {
        console.log(`Could not update ${name} to ${email} (email already used), skipping`)
      }
    } else if (user) {
      console.log(`${name} already has correct email: ${email}`)
    }
  }

  console.log('\n=== Done ===')
}

main().catch(console.error).finally(() => prisma.$disconnect())
