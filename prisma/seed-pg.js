require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } }
})

async function main() {
  const count = await prisma.department.count()
  console.log('Current departments:', count)
  if (count > 0) {
    console.log('Database already has data, skipping seed.')
    return
  }

  console.log('Seeding database...')

  const itDept = await prisma.department.create({ data: { name: 'IT' } })
  const itSupportDept = await prisma.department.create({ data: { name: 'IT Support' } })
  const hrDept = await prisma.department.create({ data: { name: 'Human Resources' } })
  const financeDept = await prisma.department.create({ data: { name: 'Finance' } })
  const operationsDept = await prisma.department.create({ data: { name: 'Operations' } })
  const legalDept = await prisma.department.create({ data: { name: 'Legal' } })
  const marketingDept = await prisma.department.create({ data: { name: 'Marketing' } })
  const facilitiesDept = await prisma.department.create({ data: { name: 'Facilities' } })

  console.log('Created 8 departments')

  // Categories
  await prisma.category.createMany({
    data: [
      { name: 'Network Issue', departmentId: itDept.id },
      { name: 'Server Issue', departmentId: itDept.id },
      { name: 'Security Breach', departmentId: itDept.id },
      { name: 'Hardware Issue', departmentId: itSupportDept.id },
      { name: 'Software Issue', departmentId: itSupportDept.id },
      { name: 'Payroll Query', departmentId: hrDept.id },
      { name: 'Employee Benefits', departmentId: hrDept.id },
      { name: 'Budget Issue', departmentId: financeDept.id },
      { name: 'Operational Risk', departmentId: operationsDept.id },
      { name: 'Compliance Issue', departmentId: legalDept.id },
      { name: 'Campaign Issue', departmentId: marketingDept.id },
      { name: 'Maintenance', departmentId: facilitiesDept.id },
    ]
  })
  console.log('Created categories')

  // Users (bcrypt hash for password "password123")
  const bcrypt = require('bcryptjs')
  const hash = await bcrypt.hash('password123', 10)

  // Admin
  await prisma.user.create({
    data: { name: 'Hanniel Nyemitei', email: 'hannielcurry@gmail.com', password: hash, role: 'Admin', isActive: true }
  })

  // Department Heads
  await prisma.user.create({
    data: { name: 'IT Head', email: 'omgddy+ithead@gmail.com', password: hash, role: 'Department Head', departmentId: itDept.id, isActive: true }
  })
  await prisma.user.create({
    data: { name: 'HR Head', email: 'omgddy+hrhead@gmail.com', password: hash, role: 'Department Head', departmentId: hrDept.id, isActive: true }
  })

  // Incident Handlers
  await prisma.user.create({
    data: { name: 'Handler Alpha', email: 'omgddy+alpha@gmail.com', password: hash, role: 'Incident Handler', departmentId: itDept.id, isActive: true }
  })
  await prisma.user.create({
    data: { name: 'Handler Beta', email: 'hannielcurry+beta@gmail.com', password: hash, role: 'Incident Handler', departmentId: itDept.id, isActive: true }
  })

  // Employees
  await prisma.user.create({
    data: { name: 'John Employee', email: 'omgddy+john@gmail.com', password: hash, role: 'Employee', departmentId: facilitiesDept.id, isActive: true }
  })

  console.log('Created users')
  console.log('Database seeded successfully!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
