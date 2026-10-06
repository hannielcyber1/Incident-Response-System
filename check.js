const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL }
  }
})

async function run() {
  // Check departments
  const depts = await prisma.department.findMany()
  console.log('DEPARTMENTS:', depts.map(d => d.name))
  
  // Check categories
  const cats = await prisma.category.findMany({ include: { department: true } })
  console.log('CATEGORIES:', cats.map(c => `${c.name} (${c.department.name})`))
  
  // Check users with their emails
  const users = await prisma.user.findMany({ select: { name: true, email: true, role: true, departmentId: true } })
  console.log('\nUSERS:')
  users.forEach(u => console.log(`  ${u.name} | ${u.role} | email: ${u.email}`))
}
run().finally(() => prisma.$disconnect())
