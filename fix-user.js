const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL }
  }
})

async function run() {
  const oldUser = await prisma.user.findUnique({ where: { id: '474ebd51-e2f1-4d93-9891-07fd2ebc71f0' } })
  const newUser = await prisma.user.findUnique({ where: { id: '982f099f-809f-4947-9f70-a472b8ab85bc' } })
  
  if (oldUser) {
    // We will just update the old user's password to the plaintext one so they can login
    await prisma.user.update({
      where: { id: oldUser.id },
      data: { password: 'Z2#sW7!qLm85' }
    })
    console.log("Updated old user's password.")
    
    // delete the duplicate new user so findFirst finds the old one consistently (which has their email)
    if (newUser) {
      await prisma.user.delete({ where: { id: newUser.id } })
      console.log("Deleted duplicate user.")
    }
  }
}
run().finally(() => prisma.$disconnect())
