const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL }
  }
})

async function run() {
  const users = await prisma.user.findMany()
  console.log(users.map(u => ({ name: u.name, pw: u.password })))
}
run().finally(() => prisma.$disconnect())
