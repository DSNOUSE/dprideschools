const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({ include: { roles: { include: { role: true } } } });
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.roles.map(r => r.role.name).join(', ')})`);
    });
    
    const parents = await prisma.parent.findMany();
    console.log('Parents found:', parents.length);
    
    const students = await prisma.student.findMany();
    console.log('Students found:', students.length);
  } catch(e) { 
    console.error(e); 
  } finally { 
    prisma.$disconnect(); 
  }
}

checkUsers();
