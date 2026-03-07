// Complete student seeding script for DPRIDE School
// Combines existing academic data with new student information

const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

// Complete student data from the provided lists
const allStudentsData = [
  // DISCOVERY CLASS (Pre-Nursery)
  { fullName: 'Fatima Muhammad Baba', gender: 'Female', class: 'DISCOVERY CLASS (Pre-Nursery)', department: 'Early Years' },
  { fullName: 'Hafsat Usman Imam', gender: 'Female', class: 'DISCOVERY CLASS (Pre-Nursery)', department: 'Early Years' },
  { fullName: 'Nana Sa\'ad', gender: 'Female', class: 'DISCOVERY CLASS (Pre-Nursery)', department: 'Early Years' },
  { fullName: 'Noor Aliyu Maina', gender: 'Male', class: 'DISCOVERY CLASS (Pre-Nursery)', department: 'Early Years' },
  { fullName: 'Umar Faruk Yahaya', gender: 'Male', class: 'DISCOVERY CLASS (Pre-Nursery)', department: 'Early Years' },
  
  // EXPLORERS (Nursery 1)
  { fullName: 'Amina Abdulhamid', gender: 'Female', class: 'EXPLORERS (Nursery 1)', department: 'Early Years' },
  { fullName: 'Mukhtar Salihu', gender: 'Male', class: 'EXPLORERS (Nursery 1)', department: 'Early Years' },
  { fullName: 'Ramadan Ibrahim', gender: 'Male', class: 'EXPLORERS (Nursery 1)', department: 'Early Years' },
  { fullName: 'Sani Shehu', gender: 'Male', class: 'EXPLORERS (Nursery 1)', department: 'Early Years' },
  { fullName: 'Sheriff Aliyu Maina', gender: 'Male', class: 'EXPLORERS (Nursery 1)', department: 'Early Years' },
  
  // PREPARATORY (Nursery 2)
  { fullName: 'David Oloruntola', gender: 'Male', class: 'PREPARATORY (Nursery 2)', department: 'Early Years' },
  { fullName: 'Maryam Faysal Amin', gender: 'Female', class: 'PREPARATORY (Nursery 2)', department: 'Early Years' },
  
  // YEAR 1
  { fullName: 'Barata Amrullah', gender: 'Male', class: 'YEAR 1', department: 'Primary' },
  { fullName: 'Fatima Ibrahim', gender: 'Female', class: 'YEAR 1', department: 'Primary' },
  
  // YEAR 2
  { fullName: 'Hafsat Abubakar', gender: 'Female', class: 'YEAR 2', department: 'Primary' },
  
  // YEAR 3
  { fullName: 'Aisha Musa', gender: 'Female', class: 'YEAR 3', department: 'Primary' },
  { fullName: 'Bilikisu Sani Shehu', gender: 'Female', class: 'YEAR 3', department: 'Primary' },
  { fullName: 'Khadija U. Imam', gender: 'Female', class: 'YEAR 3', department: 'Primary' },
  { fullName: 'Zainab U. Imam', gender: 'Female', class: 'YEAR 3', department: 'Primary' },
  
  // YEAR 4
  { fullName: 'Abdallah Arif', gender: 'Male', class: 'YEAR 4', department: 'Primary' },
  { fullName: 'Abdulhamid Fatima', gender: 'Female', class: 'YEAR 4', department: 'Primary' },
  { fullName: 'Abdulhamid Mohammed', gender: 'Male', class: 'YEAR 4', department: 'Primary' },
  { fullName: 'Ahmed Abdullahi Garba', gender: 'Male', class: 'YEAR 4', department: 'Primary' },
  { fullName: 'Bilal Sani', gender: 'Male', class: 'YEAR 4', department: 'Primary' },
  { fullName: 'Hussaini Maryam', gender: 'Female', class: 'YEAR 4', department: 'Primary' },
  { fullName: 'Mohammed Halima', gender: 'Female', class: 'YEAR 4', department: 'Primary' },
  { fullName: 'Nabage Ruqaiya Nasiru', gender: 'Female', class: 'YEAR 4', department: 'Primary' },
  
  // YEAR 5
  { fullName: 'Saad Fatima', gender: 'Female', class: 'YEAR 5', department: 'Primary' },
  { fullName: 'Sanusi Hafsat', gender: 'Female', class: 'YEAR 5', department: 'Primary' },
  
  // YEAR 7
  { fullName: 'Aisha Muhammad', gender: 'Female', class: 'YEAR 7', department: 'Secondary' },
  { fullName: 'Imam Usman Nafisa', gender: 'Female', class: 'YEAR 7', department: 'Secondary' },
  
  // YEAR 8
  { fullName: 'Ali Mohammed B.M', gender: 'Male', class: 'YEAR 8', department: 'Secondary' },
  { fullName: 'Hanan Auwal', gender: 'Female', class: 'YEAR 8', department: 'Secondary' },
  { fullName: 'Hanifa Jibrin Usman', gender: 'Female', class: 'YEAR 8', department: 'Secondary' },
  { fullName: 'Nana Aisha Abubakar', gender: 'Female', class: 'YEAR 8', department: 'Secondary' },
  { fullName: 'Umm\'suleim Ibrahim', gender: 'Female', class: 'YEAR 8', department: 'Secondary' },
  
  // YEAR 9
  { fullName: 'Abdallah Rabiu', gender: 'Male', class: 'YEAR 9', department: 'Secondary' },
  { fullName: 'Ahmed Abubakar', gender: 'Male', class: 'YEAR 9', department: 'Secondary' },
  { fullName: 'Sanusi Musab', gender: 'Male', class: 'YEAR 9', department: 'Secondary' },
  { fullName: 'Zaid Musa', gender: 'Male', class: 'YEAR 9', department: 'Secondary' }
];

function generateAdmissionNumber(existingNumbers = [], index) {
  const year = new Date().getFullYear();
  const counter = index + 1; // Start from 1
  return `DPS${year}${counter.toString().padStart(3, '0')}`;
}

function parseStudentName(fullName) {
  const parts = fullName.trim().split(' ');
  return {
    firstName: parts[0] || '',
    lastName: parts[parts.length - 1] || '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : null
  };
}

async function main() {
  console.log('🚀 Starting comprehensive student data seeding...');
  
  try {
    // Get existing students to avoid conflicts
    const existingStudents = await prisma.student.findMany({
      select: { admissionNo: true }
    });
    const existingAdmissionNumbers = existingStudents.map(s => s.admissionNo);
    
    console.log(`📊 Found ${existingAdmissionNumbers.length} existing students`);
    
    // Get current active session or create one
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
    
    // Create departments
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
    
    console.log('✅ Departments ensured');
    
    // Create classes
    const classData = [
      // Early Years
      { name: 'DISCOVERY CLASS (Pre-Nursery)', departmentId: departments[0].id, level: 'Early Years', sortOrder: 1 },
      { name: 'EXPLORERS (Nursery 1)', departmentId: departments[0].id, level: 'Early Years', sortOrder: 2 },
      { name: 'PREPARATORY (Nursery 2)', departmentId: departments[0].id, level: 'Early Years', sortOrder: 3 },
      
      // Primary
      { name: 'YEAR 1', departmentId: departments[1].id, level: 'Primary', sortOrder: 1 },
      { name: 'YEAR 2', departmentId: departments[1].id, level: 'Primary', sortOrder: 2 },
      { name: 'YEAR 3', departmentId: departments[1].id, level: 'Primary', sortOrder: 3 },
      { name: 'YEAR 4', departmentId: departments[1].id, level: 'Primary', sortOrder: 4 },
      { name: 'YEAR 5', departmentId: departments[1].id, level: 'Primary', sortOrder: 5 },
      { name: 'YEAR 6', departmentId: departments[1].id, level: 'Primary', sortOrder: 6 },
      
      // Secondary
      { name: 'YEAR 7', departmentId: departments[2].id, level: 'Secondary', sortOrder: 1 },
      { name: 'YEAR 8', departmentId: departments[2].id, level: 'Secondary', sortOrder: 2 },
      { name: 'YEAR 9', departmentId: departments[2].id, level: 'Secondary', sortOrder: 3 }
    ];
    
    const createdClasses = [];
    
    for (const classInfo of classData) {
      const newClass = await prisma.class.upsert({
        where: { 
          name_departmentId: { 
            name: classInfo.name, 
            departmentId: classInfo.departmentId 
          } 
        },
        update: {
          level: classInfo.level,
          sort_order: classInfo.sortOrder
        },
        create: classInfo
      });
      createdClasses.push(newClass);
    }
    
    console.log(`✅ Created/updated ${createdClasses.length} classes`);
    
    // Create students
    let totalStudentsCreated = 0;
    const createdStudents = [];
    
    for (let i = 0; i < allStudentsData.length; i++) {
      const studentData = allStudentsData[i];
      const { firstName, lastName, middleName } = parseStudentName(studentData.fullName);
      const admissionNo = generateAdmissionNumber(existingAdmissionNumbers, i);
      
      const classRecord = createdClasses.find(c => c.name === studentData.class);
      
      if (!classRecord) {
        console.warn(`⚠️  Class not found: ${studentData.class}`);
        continue;
      }
      
      try {
        const student = await prisma.student.upsert({
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
        
        createdStudents.push(student);
        totalStudentsCreated++;
        
        console.log(`  ✓ ${studentData.fullName} -> ${admissionNo} (${studentData.class})`);
        
      } catch (error) {
        console.error(`  ❌ Failed to create student: ${studentData.fullName}`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully created ${totalStudentsCreated} students!`);
    
    // Create parent accounts
    console.log('\n👨‍👩‍👧‍👦 Creating parent accounts...');
    
    const parentCount = Math.ceil(createdStudents.length / 3);
    const createdParents = [];
    
    for (let i = 0; i < parentCount; i++) {
      const parent = await prisma.parent.upsert({
        where: { email: `parent${i + 1}@dprideschools.com` },
        update: {},
        create: {
          email: `parent${i + 1}@dprideschools.com`,
          name: `Parent ${i + 1}`,
          phone: `0801234567${i}`,
          passwordHash: await argon2.hash('Parent123!')
        }
      });
      createdParents.push(parent);
    }
    
    // Link students to parents
    for (let i = 0; i < createdStudents.length; i++) {
      const student = createdStudents[i];
      const parentIndex = i % createdParents.length;
      const parent = createdParents[parentIndex];
      const relation = i % 2 === 0 ? 'father' : 'mother';
      
      await prisma.studentParent.upsert({
        where: {
          studentId_parentId: {
            studentId: student.id,
            parentId: parent.id
          }
        },
        update: { relation },
        create: {
          studentId: student.id,
          parentId: parent.id,
          relation
        }
      });
    }
    
    console.log(`✅ Created ${createdParents.length} parent accounts`);
    
    // Summary
    console.log('\n📊 SEEDING COMPLETE:');
    console.log('====================');
    console.log(`📚 Departments: ${departments.length}`);
    console.log(`🏫 Classes: ${createdClasses.length}`);
    console.log(`👨‍🎓 Students: ${totalStudentsCreated}`);
    console.log(`👨‍👩‍👧‍👦 Parents: ${createdParents.length}`);
    console.log(`📅 Session: ${currentSession.name}`);
    
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('====================');
    console.log('Parent Accounts:');
    createdParents.forEach((parent, index) => {
      console.log(`  ${parent.email} -> Password: Parent123!`);
    });
    console.log('\nStudent Accounts:');
    console.log('  Use admission number as both username and password');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed');
  })
  .catch(async (e) => {
    console.error('❌ Fatal error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
