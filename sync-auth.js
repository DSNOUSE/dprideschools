const { prisma } = require('./src/lib/prisma');

async function syncAuthData() {
  console.log('🔄 Starting authentication data sync...\n');
  
  try {
    // 1. Check if admin user exists
    console.log('🔍 Checking admin user...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'dsnousee@gmail.com' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user NOT found - creating...');
      // Create admin user with proper password hash
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
        }
      });
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user exists');
    }
    
    // 2. Create sample students if none exist
    console.log('\n🔍 Checking students...');
    const studentCount = await prisma.student.count();
    
    if (studentCount === 0) {
      console.log('❌ No students found - creating sample students...');
      
      // Get or create a class for students
      let sampleClass = await prisma.class.findFirst();
      if (!sampleClass) {
        sampleClass = await prisma.class.create({
          data: {
            name: 'Sample Class',
            level: 'Sample Level',
            sort_order: 1
          }
        });
        console.log('✅ Sample class created');
      }
      
      // Create sample session and term
      let sampleSession = await prisma.session.findFirst();
      if (!sampleSession) {
        sampleSession = await prisma.session.create({
          data: {
            name: '2025-2026 Academic Year',
            active: true
          }
        });
        console.log('✅ Sample session created');
      }
      
      let sampleTerm = await prisma.term.findFirst();
      if (!sampleTerm) {
        sampleTerm = await prisma.term.create({
          data: {
            name: 'First Term',
            sessionId: sampleSession.id,
            active: true
          }
        });
        console.log('✅ Sample term created');
      }
      
      // Create sample students
      const sampleStudents = [
        {
          admissionNo: 'STU001',
          firstName: 'John',
          lastName: 'Doe',
          classId: sampleClass.id,
          sessionId: sampleSession.id
        },
        {
          admissionNo: 'STU002', 
          firstName: 'Jane',
          lastName: 'Smith',
          classId: sampleClass.id,
          sessionId: sampleSession.id
        },
        {
          admissionNo: 'STU003',
          firstName: 'Mike',
          lastName: 'Johnson',
          classId: sampleClass.id,
          sessionId: sampleSession.id
        }
      ];
      
      for (const studentData of sampleStudents) {
        await prisma.student.create({ data: studentData });
        console.log(`✅ Created student: ${studentData.admissionNo} - ${studentData.firstName} ${studentData.lastName}`);
      }
      
      console.log(`✅ Created ${sampleStudents.length} sample students`);
      console.log('\n🎓 STUDENT LOGIN CREDENTIALS:');
      sampleStudents.forEach(student => {
        console.log(`   Admission: ${student.admissionNo} | Password: ${student.admissionNo} | Name: ${student.firstName} ${student.lastName}`);
      });
      
    } else {
      console.log(`✅ Found ${studentCount} students in database`);
      
      // Show first 5 students for login testing
      const students = await prisma.student.findMany({
        take: 5,
        select: {
          admissionNo: true,
          firstName: true,
          lastName: true,
          class: { select: { name: true } }
        }
      });
      
      console.log('\n🎓 AVAILABLE STUDENT LOGIN CREDENTIALS:');
      students.forEach(student => {
        console.log(`   Admission: ${student.admissionNo} | Password: ${student.admissionNo} | Name: ${student.firstName} ${student.lastName} (${student.class?.name || 'No class'})`);
      });
    }
    
    // 3. Create sample parents if none exist
    console.log('\n🔍 Checking parents...');
    const parentCount = await prisma.parent.count();
    
    if (parentCount === 0) {
      console.log('❌ No parents found - creating sample parents...');
      
      const sampleParents = [
        {
          email: 'parent1@example.com',
          name: 'Parent One',
          passwordHash: await require('argon2').hash('parent123')
        },
        {
          email: 'parent2@example.com', 
          name: 'Parent Two',
          passwordHash: await require('argon2').hash('parent123')
        }
      ];
      
      for (const parentData of sampleParents) {
        await prisma.parent.create({ data: parentData });
        console.log(`✅ Created parent: ${parentData.email} - ${parentData.name}`);
      }
      
      console.log('\n👨‍👩‍👧‍👦 PARENT LOGIN CREDENTIALS:');
      sampleParents.forEach(parent => {
        console.log(`   Email: ${parent.email} | Password: parent123 | Name: ${parent.name}`);
      });
      
    } else {
      console.log(`✅ Found ${parentCount} parents in database`);
    }
    
    console.log('\n🎉 AUTHENTICATION DATA SYNC COMPLETED!');
    console.log('\n📋 LOGIN OPTIONS:');
    console.log('   1. ADMIN: dsnousee@gmail.com / cC42wmGE6Veak923WKZG');
    console.log('   2. STUDENT: Use any admission number above / same as password');
    console.log('   3. PARENT: Use parent@example.com / parent123');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncAuthData();
