const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding presentation users and departments...')

  const usersData = [
    { name: 'Joy Adu', role: 'Incident Handler', deptName: 'IT', pass: 'V7!qN4#zLp82' },
    { name: 'Owusu Ansah', role: 'Department Head', deptName: 'IT', pass: 'K9@tR6!mXq41' },
    { name: 'Nana Addai', role: 'Department Head', deptName: 'Facilities', pass: 'P3#vL8@wNz57' },
    { name: 'Maise Wilson', role: 'Incident Handler', deptName: 'Facilities', pass: 'Y6!bQ2$xHd94' },
    { name: 'Emily Warona', role: 'Department Head', deptName: 'Finance', pass: 'R8@kM5#pTs31' },
    { name: 'Emily Rapo', role: 'Incident Handler', deptName: 'Finance', pass: 'F4!nX9@cJv76' },
    { name: 'Hanniel Nyemitei', role: 'Admin', deptName: 'Administration', pass: 'Z2#sW7!qLm85' },
    { name: 'Uzziel Nyemitei', role: 'Department Head', deptName: 'HR', pass: 'H5@dK8#rPx63' },
    { name: 'Jahaziel Nyemitei', role: 'Incident Handler', deptName: 'HR', pass: 'M7!gT3@vQn29' },
    { name: 'David Mensah', role: 'Department Head', deptName: 'Accounting', pass: 'C9#xL4!bRw72' },
    { name: 'Akua Mensah', role: 'Incident Handler', deptName: 'Accounting', pass: 'N6@pV2#yKs48' }
  ]

  for (const u of usersData) {
    let dept = null;
    
    // Create or find the department
    if (u.deptName) {
      dept = await prisma.department.findUnique({ where: { name: u.deptName } })
      if (!dept) {
        dept = await prisma.department.create({ data: { name: u.deptName } })
        
        // Add a dummy category so they can test tickets
        await prisma.category.create({
          data: {
            name: `General ${u.deptName} Request`,
            departmentId: dept.id
          }
        })
      }
    }

    // Create the user
    const email = `${u.name.replace(/\s+/g, '.').toLowerCase()}@company.com`
    
    const existing = await prisma.user.findFirst({ where: { name: u.name } })
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: u.pass,
          role: u.role,
          departmentId: dept ? dept.id : null
        }
      })
    } else {
      await prisma.user.create({
        data: {
          name: u.name,
          email,
          password: u.pass,
          role: u.role,
          departmentId: dept ? dept.id : null
        }
      })
    }
  }

  console.log('Successfully seeded all presentation users and their departments!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())
