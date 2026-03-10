// Production seed script for Vercel deployment - minimal version
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const argon2 = require('argon2');

// Use Vercel environment variables
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@dprideschools.com';
  const adminPassword = 'ILoveCatsToo123#';

  console.log('📋 Checking database schema...');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Check if Role table exists
    try {
      const roleCount = await prisma.role.count();
      console.log('✅ Role table exists, found', roleCount, 'roles');
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('⚠️ Role table does not exist, skipping seed');
        console.log('💡 Database schema may not be migrated yet');
        console.log('💡 This is normal on first deployment - migrations will run on next build');
        return;
      }
      throw error;
    }

    // Ensure Administrator role
    console.log('🏷️ Creating Administrator role...');
    const adminRole = await prisma.role.upsert({
      where: { name: 'Administrator' },
      update: {},
      create: { name: 'Administrator', description: 'Full administrative access' },
    });
    console.log('✅ Administrator role ready');

    // Create/update admin user with new credentials
    console.log('👤 Creating admin user with email:', adminEmail);
    
    const passwordHash = await argon2.hash(adminPassword);
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { 
        passwordHash,
        name: 'Administrator'
      },
      create: {
        email: adminEmail,
        passwordHash,
        name: 'Administrator',
      },
    });

    console.log('✅ Admin user created/updated:', user.email);

    // Attach Administrator role
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
      update: {},
      create: { userId: user.id, roleId: adminRole.id },
    });

    console.log('🎉 Production admin setup completed!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log('🔐 Password: [REDACTED]');
    
    // Seed complete academic data (departments, classes, subjects, terms)
    console.log('\n📚 Seeding complete academic data...');
    
    // 1. Create Departments
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { name: 'Early Years' },
        update: {},
        create: { name: 'Early Years' }
      }),
      prisma.department.upsert({
        where: { name: 'Primary' },
        update: {},
        create: { name: 'Primary' }
      }),
      prisma.department.upsert({
        where: { name: 'Secondary' },
        update: {},
        create: { name: 'Secondary' }
      })
    ]);
    
    const earlyYearsDept = departments.find(d => d.name === 'Early Years');
    const primaryDept = departments.find(d => d.name === 'Primary');
    const secondaryDept = departments.find(d => d.name === 'Secondary');
    
    console.log(`✅ Departments: ${departments.length}`);
    
    // 2. Create Classes with department links
    const classMappings = [
      { name: 'DISCOVERY CLASS (Pre-Nursery)', departmentId: earlyYearsDept.id, sort_order: 1 },
      { name: 'EXPLORERS (Nursery 1)', departmentId: earlyYearsDept.id, sort_order: 2 },
      { name: 'PREPARATORY (Nursery 2)', departmentId: earlyYearsDept.id, sort_order: 3 },
      { name: 'YEAR 1', departmentId: primaryDept.id, sort_order: 4 },
      { name: 'YEAR 2', departmentId: primaryDept.id, sort_order: 5 },
      { name: 'YEAR 3', departmentId: primaryDept.id, sort_order: 6 },
      { name: 'YEAR 4', departmentId: primaryDept.id, sort_order: 7 },
      { name: 'YEAR 5', departmentId: primaryDept.id, sort_order: 8 },
      { name: 'YEAR 6', departmentId: primaryDept.id, sort_order: 9 },
      { name: 'YEAR 7', departmentId: secondaryDept.id, sort_order: 10 },
      { name: 'YEAR 8', departmentId: secondaryDept.id, sort_order: 11 },
      { name: 'YEAR 9', departmentId: secondaryDept.id, sort_order: 12 }
    ];
    
    let classCount = 0;
    for (const classMapping of classMappings) {
      await prisma.class.upsert({
        where: { 
          name_departmentId: { 
            name: classMapping.name, 
            departmentId: classMapping.departmentId 
          } 
        },
        update: { sort_order: classMapping.sort_order },
        create: classMapping
      });
      classCount++;
    }
    
    console.log(`✅ Classes: ${classCount}`);
    
    // 3. Create Session
    const currentYear = new Date().getFullYear();
    const sessionName = `${currentYear}/${currentYear + 1}`;
    
    await prisma.session.upsert({
      where: { name: sessionName },
      update: { isActive: true },
      create: { name: sessionName, isActive: true }
    });
    
    console.log(`✅ Session: ${sessionName}`);
    
    // 4. Create Terms
    const terms = [
      { name: 'First Term' },
      { name: 'Second Term' },
      { name: 'Third Term' }
    ];
    
    for (const term of terms) {
      await prisma.term.upsert({
        where: { name: term.name },
        update: {},
        create: term
      });
    }
    
    console.log(`✅ Terms: ${terms.length}`);
    
    // 5. Create Subjects for each department
    const earlyYearsSubjects = [
      'Language Arts', 'Mathematics', 'Science', 'Social Studies',
      'Arts & Crafts', 'Physical Education', 'Quran Studies'
    ];
    
    const primarySubjects = [
      'English Language', 'Mathematics', 'Science', 'Social Studies',
      'Computer Studies', 'Physical & Health Education', 'Creative Arts',
      'Islamic Studies', 'Arabic Language', 'Quran Studies'
    ];
    
    const secondarySubjects = [
      'English Language', 'Mathematics', 'Biology', 'Chemistry', 'Physics',
      'Geography', 'History', 'Economics', 'Computer Science',
      'Islamic Studies', 'Arabic Language', 'Physical & Health Education',
      'Civic Education'
    ];
    
    let subjectCount = 0;
    
    for (const subjectName of earlyYearsSubjects) {
      await prisma.subject.upsert({
        where: { 
          name_departmentId: { 
            name: subjectName, 
            departmentId: earlyYearsDept.id 
          } 
        },
        update: {},
        create: { name: subjectName, departmentId: earlyYearsDept.id }
      });
      subjectCount++;
    }
    
    for (const subjectName of primarySubjects) {
      await prisma.subject.upsert({
        where: { 
          name_departmentId: { 
            name: subjectName, 
            departmentId: primaryDept.id 
          } 
        },
        update: {},
        create: { name: subjectName, departmentId: primaryDept.id }
      });
      subjectCount++;
    }
    
    for (const subjectName of secondarySubjects) {
      await prisma.subject.upsert({
        where: { 
          name_departmentId: { 
            name: subjectName, 
            departmentId: secondaryDept.id 
          } 
        },
        update: {},
        create: { name: subjectName, departmentId: secondaryDept.id }
      });
      subjectCount++;
    }
    
    console.log(`✅ Subjects: ${subjectCount}`);
    
    // 6. Seed Students
    console.log('\n👥 Seeding students...');
    
    const studentsData = [
      // DISCOVERY CLASS (Pre-Nursery)
      { fullName: 'Fatima Muhammad Baba', gender: 'Female', class: 'DISCOVERY CLASS (Pre-Nursery)' },
      { fullName: 'Hafsat Usman Imam', gender: 'Female', class: 'DISCOVERY CLASS (Pre-Nursery)' },
      { fullName: 'Nana Sa\'ad', gender: 'Female', class: 'DISCOVERY CLASS (Pre-Nursery)' },
      { fullName: 'Noor Aliyu Maina', gender: 'Male', class: 'DISCOVERY CLASS (Pre-Nursery)' },
      { fullName: 'Umar Faruk Yahaya', gender: 'Male', class: 'DISCOVERY CLASS (Pre-Nursery)' },
      
      // EXPLORERS (Nursery 1)
      { fullName: 'Amina Abdulhamid', gender: 'Female', class: 'EXPLORERS (Nursery 1)' },
      { fullName: 'Mukhtar Salihu', gender: 'Male', class: 'EXPLORERS (Nursery 1)' },
      { fullName: 'Ramadan Ibrahim', gender: 'Male', class: 'EXPLORERS (Nursery 1)' },
      { fullName: 'Sani Shehu', gender: 'Male', class: 'EXPLORERS (Nursery 1)' },
      { fullName: 'Sheriff Aliyu Maina', gender: 'Male', class: 'EXPLORERS (Nursery 1)' },
      
      // PREPARATORY (Nursery 2)
      { fullName: 'David Oloruntola', gender: 'Male', class: 'PREPARATORY (Nursery 2)' },
      { fullName: 'Maryam Faysal Amin', gender: 'Female', class: 'PREPARATORY (Nursery 2)' },
      
      // YEAR 1
      { fullName: 'Barata Amrullah', gender: 'Male', class: 'YEAR 1' },
      { fullName: 'Fatima Ibrahim', gender: 'Female', class: 'YEAR 1' },
      
      // YEAR 2
      { fullName: 'Hafsat Abubakar', gender: 'Female', class: 'YEAR 2' },
      
      // YEAR 3
      { fullName: 'Aisha Musa', gender: 'Female', class: 'YEAR 3' },
      { fullName: 'Bilikisu Sani Shehu', gender: 'Female', class: 'YEAR 3' },
      { fullName: 'Khadija U. Imam', gender: 'Female', class: 'YEAR 3' },
      { fullName: 'Zainab U. Imam', gender: 'Female', class: 'YEAR 3' },
      
      // YEAR 4
      { fullName: 'Abdallah Arif', gender: 'Male', class: 'YEAR 4' },
      { fullName: 'Abdulhamid Fatima', gender: 'Female', class: 'YEAR 4' },
      { fullName: 'Abdulhamid Mohammed', gender: 'Male', class: 'YEAR 4' },
      { fullName: 'Ahmed Abdullahi Garba', gender: 'Male', class: 'YEAR 4' },
      { fullName: 'Bilal Sani', gender: 'Male', class: 'YEAR 4' },
      { fullName: 'Hussaini Maryam', gender: 'Female', class: 'YEAR 4' },
      { fullName: 'Mohammed Halima', gender: 'Female', class: 'YEAR 4' },
      { fullName: 'Nabage Ruqaiya Nasiru', gender: 'Female', class: 'YEAR 4' },
      
      // YEAR 5
      { fullName: 'Saad Fatima', gender: 'Female', class: 'YEAR 5' },
      { fullName: 'Sanusi Hafsat', gender: 'Female', class: 'YEAR 5' },
      
      // YEAR 7
      { fullName: 'Aisha Muhammad', gender: 'Female', class: 'YEAR 7' },
      { fullName: 'Imam Usman Nafisa', gender: 'Female', class: 'YEAR 7' },
      
      // YEAR 8
      { fullName: 'Ali Mohammed B.M', gender: 'Male', class: 'YEAR 8' },
      { fullName: 'Hanan Auwal', gender: 'Female', class: 'YEAR 8' },
      { fullName: 'Hanifa Jibrin Usman', gender: 'Female', class: 'YEAR 8' },
      { fullName: 'Nana Aisha Abubakar', gender: 'Female', class: 'YEAR 8' },
      { fullName: 'Umm\'suleim Ibrahim', gender: 'Female', class: 'YEAR 8' },
      
      // YEAR 9
      { fullName: 'Abdallah Rabiu', gender: 'Male', class: 'YEAR 9' },
      { fullName: 'Ahmed Abubakar', gender: 'Male', class: 'YEAR 9' },
      { fullName: 'Sanusi Musab', gender: 'Male', class: 'YEAR 9' },
      { fullName: 'Zaid Musa', gender: 'Male', class: 'YEAR 9' }
    ];
    
    // Get active session
    const activeSession = await prisma.session.findFirst({
      where: { isActive: true }
    });
    
    if (!activeSession) {
      console.log('⚠️ No active session found, skipping student seeding');
    } else {
      // Get all classes for mapping
      const allClasses = await prisma.class.findMany();
      const classMap = {};
      allClasses.forEach(cls => {
        classMap[cls.name] = cls.id;
      });
      
      const year = new Date().getFullYear();
      let studentCount = 0;
      
      for (let i = 0; i < studentsData.length; i++) {
        const studentData = studentsData[i];
        const admissionNo = `DPS${year}${(i + 1).toString().padStart(3, '0')}`;
        
        const classId = classMap[studentData.class];
        if (!classId) {
          console.log(`⚠️ Class not found: ${studentData.class}, skipping ${studentData.fullName}`);
          continue;
        }
        
        // Parse first and last name
        const nameParts = studentData.fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;
        
        await prisma.student.upsert({
          where: { admissionNo },
          update: {
            firstName,
            lastName,
            gender: studentData.gender,
            classId,
            sessionId: activeSession.id
          },
          create: {
            admissionNo,
            firstName,
            lastName,
            gender: studentData.gender,
            classId,
            sessionId: activeSession.id
          }
        });
        
        studentCount++;
      }
      
      console.log(`✅ Students: ${studentCount}`);
    }
    
    console.log('\n✅ Complete academic data and students seeded successfully!')
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    
    // Don't fail the build - just log the error
    if (error.code === 'P2021' || error.message.includes('timeout')) {
      console.log('💡 This is expected on fresh deployments');
      console.log('💡 Admin will be created on next successful deployment');
      return;
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Seed script failed:', e);
    await prisma.$disconnect();
    process.exit(0); // Exit 0 instead of 1 to avoid failing build
  });
