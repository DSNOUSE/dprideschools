const { prisma } = require('./src/lib/prisma');

async function checkUsers() {
  
  try {
    console.log('🔍 Checking users in database...\n');
    
    // Check admin users
    const adminUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    console.log('👤 ADMIN USERS:');
    if (adminUsers.length === 0) {
      console.log('   No admin users found');
    } else {
      adminUsers.forEach(user => {
        const roles = user.roles.map(r => r.role?.name).join(', ') || 'No roles';
        console.log(`   ✅ ${user.email} (${user.name}) - Roles: ${roles}`);
      });
    }
    
    // Check students
    const students = await prisma.student.findMany({
      take: 10,
      select: {
        id: true,
        admissionNo: true,
        firstName: true,
        lastName: true,
        class: {
          select: { name: true }
        }
      }
    });
    
    console.log('\n🎓 STUDENTS (first 10):');
    if (students.length === 0) {
      console.log('   No students found');
    } else {
      students.forEach(student => {
        const className = student.class?.name || 'No class';
        console.log(`   ✅ ${student.admissionNo} - ${student.firstName} ${student.lastName} (${className})`);
        console.log(`      Password: ${student.admissionNo}`);
      });
    }
    
    // Check parents
    const parents = await prisma.parent.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: { students: true }
        }
      }
    });
    
    console.log('\n👨‍👩‍👧‍👦 PARENTS (first 5):');
    if (parents.length === 0) {
      console.log('   No parents found');
    } else {
      parents.forEach(parent => {
        console.log(`   ✅ ${parent.email} - ${parent.name} (${parent._count.students} students)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
