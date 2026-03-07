// Simple database test
require('dotenv/config');

async function quickTest() {
  console.log('🔍 Quick Database Test');
  
  try {
    // Use the same Prisma client approach that works in seeds
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected! Found ${userCount} users`);
    
    // Check admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'dsnousee@gmail.com' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user exists:', adminUser.email);
      console.log('🎓 Authentication should work!');
    } else {
      console.log('❌ Admin user NOT found - creating...');
      
      const argon2 = require('argon2');
      const passwordHash = await argon2.hash('cC42wmGE6Veak923WKZG');
      
      await prisma.user.create({
        data: {
          email: 'dsnousee@gmail.com',
          name: 'Admin User',
          passwordHash: passwordHash,
          roles: {
            create: {
              role: {
                connect: { name: 'admin' }
              }
            }
          }
        }
      });
      console.log('✅ Admin user created successfully');
    }
    
    // Check students
    const studentCount = await prisma.student.count();
    console.log(`✅ Found ${studentCount} students`);
    
    if (studentCount === 0) {
      console.log('🔄 Creating test students...');
      
      const testStudents = [
        {
          admissionNo: 'TEST001',
          firstName: 'Test',
          lastName: 'Student'
        },
        {
          admissionNo: 'TEST002',
          firstName: 'Sample', 
          lastName: 'Student'
        }
      ];
      
      for (const studentData of testStudents) {
        await prisma.student.create({ data: studentData });
        console.log(`✅ Created student: ${studentData.admissionNo}`);
      }
      
      console.log('\n🎓 LOGIN CREDENTIALS:');
      testStudents.forEach(student => {
        console.log(`   ${student.admissionNo} / ${student.admissionNo}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();
