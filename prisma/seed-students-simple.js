// Simple student seeding script for DPRIDE School
// Uses the existing Prisma client configuration

require('dotenv/config');

async function main() {
  console.log('🚀 Starting student data seeding...');
  
  try {
    // Import Prisma client after dotenv config
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Student data from the provided lists
    const studentsData = [
  // DISCOVERY CLASS (Pre-Nursery)
  { fullName: 'RUQAIYYA USMAN IMAM', gender: 'Female', class: 'DISCOVERY CLASS (Pre-Nursery)' },
  { fullName: 'ABDULMUMINI FAAIZ MUHAMMAD', gender: 'Male', class: 'DISCOVERY CLASS (Pre-Nursery)' },

  // EXPLORERS (Nursery 1)
  { fullName: 'FATIMA MUKHTAR ALKALI', gender: 'Female', class: 'EXPLORERS (Nursery 1)' },
  { fullName: 'FATIMA MUHAMMED BABA', gender: 'Female', class: 'EXPLORERS (Nursery 1)' },
  { fullName: 'HAFSAT USMAN IMAM', gender: 'Female', class: 'EXPLORERS (Nursery 1)' },
  { fullName: 'NANA AISHA SAAD', gender: 'Female', class: 'EXPLORERS (Nursery 1)' },

  // YEAR 2
  { fullName: 'BARATA AMRULLAH', gender: 'Female', class: 'YEAR 2' },

  // YEAR 5
  { fullName: 'AISHA MUSA', gender: 'Female', class: 'YEAR 5' },
  { fullName: 'MUHAMMAD ARIF ABDALLAH', gender: 'Male', class: 'YEAR 5' },
  { fullName: 'KHADIJA USMAN IMAM', gender: 'Female', class: 'YEAR 5' },
  { fullName: 'RUQAIYA NASIRU NABAGE', gender: 'Female', class: 'YEAR 5' },
  { fullName: 'ZAINAB USMAN IMAM', gender: 'Female', class: 'YEAR 5' },

  // YEAR 9
  { fullName: 'Ali Mohammed Baba Mala', gender: 'Male', class: 'YEAR 9' },
  { fullName: "Umm'suleim Ibrahim", gender: 'Female', class: 'YEAR 9' },
  { fullName: "Umm'salma Auwal Usman", gender: 'Female', class: 'YEAR 9' },
  { fullName: 'Nafisa Usman Imam', gender: 'Female', class: 'YEAR 9' }
];

    
    console.log(`📋 Processing ${studentsData.length} students`);
    
    // Get current active session
    let currentSession = await prisma.session.findFirst({
      where: { isActive: true }
    });
    
    if (!currentSession) {
      currentSession = await prisma.session.create({
        data: {
          name: '2025/2026',
          isActive: true
        }
      });
      console.log(`📅 Created new session: ${currentSession.name}`);
    } else {
      console.log(`📅 Using existing session: ${currentSession.name}`);
    }
    
    // Get or create departments
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
    
    // Create classes
    const classMappings = [
      { name: 'DISCOVERY CLASS (Pre-Nursery)', departmentId: earlyYearsDept.id },
      { name: 'EXPLORERS (Nursery 1)', departmentId: earlyYearsDept.id },
      { name: 'PREPARATORY (Nursery 2)', departmentId: earlyYearsDept.id },
      { name: 'YEAR 1', departmentId: primaryDept.id },
      { name: 'YEAR 2', departmentId: primaryDept.id },
      { name: 'YEAR 3', departmentId: primaryDept.id },
      { name: 'YEAR 4', departmentId: primaryDept.id },
      { name: 'YEAR 5', departmentId: primaryDept.id },
      { name: 'YEAR 6', departmentId: primaryDept.id },
      { name: 'YEAR 7', departmentId: secondaryDept.id },
      { name: 'YEAR 8', departmentId: secondaryDept.id },
      { name: 'YEAR 9', departmentId: secondaryDept.id }
    ];
    
    const createdClasses = [];
    
    for (const classMapping of classMappings) {
      const newClass = await prisma.class.upsert({
        where: { 
          name_departmentId: { 
            name: classMapping.name, 
            departmentId: classMapping.departmentId 
          } 
        },
        update: {},
        create: classMapping
      });
      createdClasses.push(newClass);
    }
    
    console.log(`✅ Created/updated ${createdClasses.length} classes`);
    
    // Create students
    let totalStudentsCreated = 0;
    const year = new Date().getFullYear();
    
    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];
      const parts = studentData.fullName.trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts[parts.length - 1] || '';
      const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : null;
      
      const admissionNo = `DPS${year}${(i + 1).toString().padStart(3, '0')}`;
      
      const classRecord = createdClasses.find(c => c.name === studentData.class);
      
      if (!classRecord) {
        console.warn(`⚠️  Class not found: ${studentData.class}`);
        continue;
      }
      
      try {
        await prisma.student.upsert({
          where: { admissionNo },
          update: {
            firstName,
            lastName,
            middleName,
            sex: studentData.gender === 'Male' ? 'M' : 'F',
            classId: classRecord.id,
            sessionId: currentSession.id
          },
          create: {
            admissionNo,
            firstName,
            lastName,
            middleName,
            sex: studentData.gender === 'Male' ? 'M' : 'F',
            classId: classRecord.id,
            sessionId: currentSession.id
          }
        });
        
        totalStudentsCreated++;
        console.log(`  ✓ ${studentData.fullName} -> ${admissionNo} (${studentData.class})`);
        
      } catch (error) {
        console.error(`  ❌ Failed to create student: ${studentData.fullName}`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully created ${totalStudentsCreated} students!`);
    
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
