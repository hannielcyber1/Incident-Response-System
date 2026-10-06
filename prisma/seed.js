const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } }
})

async function main() {
  console.log('Seeding database...')

  const itDept = await prisma.department.create({ data: { name: 'IT Support' } })
  const hrDept = await prisma.department.create({ data: { name: 'Human Resources' } })
  const facilitiesDept = await prisma.department.create({ data: { name: 'Facilities' } })

  await prisma.category.createMany({
    data: [
      { name: 'Hardware Issue', departmentId: itDept.id },
      { name: 'Software Issue', departmentId: itDept.id },
      { name: 'Payroll Query', departmentId: hrDept.id },
      { name: 'Employee Benefits', departmentId: hrDept.id },
      { name: 'Maintenance', departmentId: facilitiesDept.id },
    ]
  })

  await prisma.user.create({
    data: { name: 'Admin Alice', email: 'alice@company.com', role: 'ADMIN' }
  })
  await prisma.user.create({
    data: { name: 'IT Head Bob', email: 'bob@company.com', role: 'DEPARTMENT_HEAD', departmentId: itDept.id }
  })
  await prisma.user.create({
    data: { name: 'IT Responder Charlie', email: 'charlie@company.com', role: 'RESPONDER', departmentId: itDept.id }
  })
  await prisma.user.create({
    data: { name: 'HR Responder Diana', email: 'diana@company.com', role: 'RESPONDER', departmentId: hrDept.id }
  })
  await prisma.user.create({
    data: { name: 'Employee Eve', email: 'eve@company.com', role: 'EMPLOYEE', departmentId: facilitiesDept.id }
  })

  console.log('Database seeded!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
