// Simple test script - using same import pattern as the app
require('dotenv/config');

async function testAccess() {
  try {
    // Import prisma the same way as the app
    const { prisma } = require('../src/lib/prisma');
    
    console.log('🔍 Testing database access...');
    
    // Test database connection
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected! Found ${userCount} users`);
    
    // Test admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'dsnousee@gmail.com' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email);
    } else {
      console.log('❌ Admin user NOT found');
    }
    
    // Test students
    const studentCount = await prisma.student.count();
    console.log(`✅ Found ${studentCount} students`);
    
    if (studentCount === 0) {
      console.log('🔄 Creating test students...');
      
      // Create test class if needed
      let testClass = await prisma.class.findFirst();
      if (!testClass) {
        testClass = await prisma.class.create({
          data: {
            name: 'Test Class',
            level: 'Test Level',
            sort_order: 1
          }
        });
        console.log('✅ Test class created');
      }
      
      // Create test students
      const testStudents = [
        {
          admissionNo: 'TEST001',
          firstName: 'Test',
          lastName: 'Student',
          classId: testClass.id
        },
        {
          admissionNo: 'TEST002',
          firstName: 'Sample',
          lastName: 'Student',
          classId: testClass.id
        }
      ];
      
      for (const studentData of testStudents) {
        await prisma.student.create({ data: studentData });
        console.log(`✅ Created student: ${studentData.admissionNo}`);
      }
      
      console.log('\n🎓 TEST LOGIN CREDENTIALS:');
      testStudents.forEach(student => {
        console.log(`   Admission: ${student.admissionNo} | Password: ${student.admissionNo}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAccess();
