const { prisma } = globalThis.prisma || require('./src/lib/prisma');

async function addTestStudents() {
  console.log('🔄 Adding test students for local development...\n');
  
  try {
    if (process.env.ALLOW_TEST_DATA !== 'true') {
      console.log('Set ALLOW_TEST_DATA=true to run this script.');
      return;
    }

    // Get or create a class
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
    
    // Get or create session and term
    let testSession = await prisma.session.findFirst();
    if (!testSession) {
      testSession = await prisma.session.create({
        data: {
          name: '2025-2026 Test Year',
          active: true
        }
      });
      console.log('✅ Test session created');
    }
    
    let testTerm = await prisma.term.findFirst();
    if (!testTerm) {
      testTerm = await prisma.term.create({
        data: {
          name: 'Test Term',
          sessionId: testSession.id,
          active: true
        }
      });
      console.log('✅ Test term created');
    }
    
    // Create test students
    const testStudents = [
      {
        admissionNo: 'TEST001',
        firstName: 'Test',
        lastName: 'Student',
        classId: testClass.id,
        sessionId: testSession.id
      },
      {
        admissionNo: 'TEST002', 
        firstName: 'Sample',
        lastName: 'Student',
        classId: testClass.id,
        sessionId: testSession.id
      }
    ];
    
    for (const studentData of testStudents) {
      await prisma.student.create({ data: studentData });
      console.log(`✅ Created student: ${studentData.admissionNo} - ${studentData.firstName} ${studentData.lastName}`);
    }
    
    console.log('\n🎓 TEST STUDENT LOGIN CREDENTIALS:');
    testStudents.forEach(student => {
      console.log(`   Admission: ${student.admissionNo} | Password: ${student.admissionNo} | Name: ${student.firstName} ${student.lastName}`);
    });
    
    console.log('\n🎉 TEST STUDENTS ADDED SUCCESSFULLY!');
    console.log('\n📋 NOW TRY THESE CREDENTIALS:');
    console.log('   1. ADMIN: dsnousee@gmail.com / cC42wmGE6Veak923WKZG');
    console.log('   2. STUDENT: TEST001 / TEST001 or TEST002 / TEST002');
    console.log('   3. STUDENT: TEST002 / TEST001 or TEST002 / TEST002');
    
  } catch (error) {
    console.error('❌ Failed to add test students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestStudents();
