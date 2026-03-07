// Comprehensive seeding script for DPRIDE School - New Student Data
// This script creates all the new students with their proper class assignments

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const argon2 = require('argon2');

// Prisma 7 client requires an adapter when using the Node.js driver
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Student data organized by class
const newStudentsData = {
  'DISCOVERY CLASS (Pre-Nursery)': [
    { fullName: 'Fatima Muhammad Baba', gender: 'Female' },
    { fullName: 'Hafsat Usman Imam', gender: 'Female' },
    { fullName: 'Nana Sa\'ad', gender: 'Female' },
    { fullName: 'Noor Aliyu Maina', gender: 'Male' },
    { fullName: 'Umar Faruk Yahaya', gender: 'Male' }
  ],
  'EXPLORERS (Nursery 1)': [
    { fullName: 'Amina Abdulhamid', gender: 'Female' },
    { fullName: 'Mukhtar Salihu', gender: 'Male' },
    { fullName: 'Ramadan Ibrahim', gender: 'Male' },
    { fullName: 'Sani Shehu', gender: 'Male' },
    { fullName: 'Sheriff Aliyu Maina', gender: 'Male' }
  ],
  'PREPARATORY (Nursery 2)': [
    { fullName: 'David Oloruntola', gender: 'Male' },
    { fullName: 'Maryam Faysal Amin', gender: 'Female' }
  ],
  'YEAR 1': [
    { fullName: 'Barata Amrullah', gender: 'Male' },
    { fullName: 'Fatima Ibrahim', gender: 'Female' }
  ],
  'YEAR 2': [
    { fullName: 'Hafsat Abubakar', gender: 'Female' }
  ],
  'YEAR 3': [
    { fullName: 'Aisha Musa', gender: 'Female' },
    { fullName: 'Bilikisu Sani Shehu', gender: 'Female' },
    { fullName: 'Khadija U. Imam', gender: 'Female' },
    { fullName: 'Zainab U. Imam', gender: 'Female' }
  ],
  'YEAR 4': [
    { fullName: 'Abdallah Arif', gender: 'Male' },
    { fullName: 'Abdulhamid Fatima', gender: 'Female' },
    { fullName: 'Abdulhamid Mohammed', gender: 'Male' },
    { fullName: 'Ahmed Abdullahi Garba', gender: 'Male' },
    { fullName: 'Bilal Sani', gender: 'Male' },
    { fullName: 'Hussaini Maryam', gender: 'Female' },
    { fullName: 'Mohammed Halima', gender: 'Female' },
    { fullName: 'Nabage Ruqaiya Nasiru', gender: 'Female' }
  ],
  'YEAR 5': [
    { fullName: 'Saad Fatima', gender: 'Female' },
    { fullName: 'Sanusi Hafsat', gender: 'Female' }
  ],
  'YEAR 7': [
    { fullName: 'Aisha Muhammad', gender: 'Female' },
    { fullName: 'Imam Usman Nafisa', gender: 'Female' }
  ],
  'YEAR 8': [
    { fullName: 'Ali Mohammed B.M', gender: 'Male' },
    { fullName: 'Hanan Auwal', gender: 'Female' },
    { fullName: 'Hanifa Jibrin Usman', gender: 'Female' },
    { fullName: 'Nana Aisha Abubakar', gender: 'Female' },
    { fullName: 'Umm\'suleim Ibrahim', gender: 'Female' }
  ],
  'YEAR 9': [
    { fullName: 'Abdallah Rabiu', gender: 'Male' },
    { fullName: 'Ahmed Abubakar', gender: 'Male' },
    { fullName: 'Sanusi Musab', gender: 'Male' },
    { fullName: 'Zaid Musa', gender: 'Male' }
  ]
};

// Function to generate unique admission numbers
function generateAdmissionNumber(existingNumbers = []) {
  const year = new Date().getFullYear();
  let counter = 1;
  
  while (true) {
    const admissionNo = `DPS${year}${counter.toString().padStart(3, '0')}`;
    if (!existingNumbers.includes(admissionNo)) {
      return admissionNo;
    }
    counter++;
  }
}

// Function to parse student name
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
    // Get existing admission numbers to avoid conflicts
    const existingStudents = await prisma.student.findMany({
      select: { admissionNo: true }
    });
    const existingAdmissionNumbers = existingStudents.map(s => s.admissionNo);
    
    console.log(`📊 Found ${existingAdmissionNumbers.length} existing students`);
    
    // Get current active session
    const currentSession = await prisma.session.findFirst({
      where: { isActive: true }
    });
    
    if (!currentSession) {
      throw new Error('No active session found. Please create an active session first.');
    }
    
    console.log(`📚 Using session: ${currentSession.name}`);
    
    // Get or create departments
    const departments = await Promise.all([
      // Early Years Department
      prisma.department.upsert({
        where: { name: 'Early Years' },
        update: {},
        create: { name: 'Early Years' }
      }),
      // Primary Department  
      prisma.department.upsert({
        where: { name: 'Primary' },
        update: {},
        create: { name: 'Primary' }
      }),
      // Secondary Department
      prisma.department.upsert({
        where: { name: 'Secondary' },
        update: {},
        create: { name: 'Secondary' }
      })
    ]);
    
    const earlyYearsDept = departments.find(d => d.name === 'Early Years');
    const primaryDept = departments.find(d => d.name === 'Primary');
    const secondaryDept = departments.find(d => d.name === 'Secondary');
    
    console.log('✅ Departments ensured');
    
    // Create classes with proper department assignments
    const classMappings = [
      // Early Years Classes
      { name: 'DISCOVERY CLASS (Pre-Nursery)', department: earlyYearsDept, level: 'Early Years', sortOrder: 1 },
      { name: 'EXPLORERS (Nursery 1)', department: earlyYearsDept, level: 'Early Years', sortOrder: 2 },
      { name: 'PREPARATORY (Nursery 2)', department: earlyYearsDept, level: 'Early Years', sortOrder: 3 },
      
      // Primary Classes
      { name: 'YEAR 1', department: primaryDept, level: 'Primary', sortOrder: 1 },
      { name: 'YEAR 2', department: primaryDept, level: 'Primary', sortOrder: 2 },
      { name: 'YEAR 3', department: primaryDept, level: 'Primary', sortOrder: 3 },
      { name: 'YEAR 4', department: primaryDept, level: 'Primary', sortOrder: 4 },
      { name: 'YEAR 5', department: primaryDept, level: 'Primary', sortOrder: 5 },
      { name: 'YEAR 6', department: primaryDept, level: 'Primary', sortOrder: 6 }, // Added for completeness
      
      // Secondary Classes
      { name: 'YEAR 7', department: secondaryDept, level: 'Secondary', sortOrder: 1 },
      { name: 'YEAR 8', department: secondaryDept, level: 'Secondary', sortOrder: 2 },
      { name: 'YEAR 9', department: secondaryDept, level: 'Secondary', sortOrder: 3 }
    ];
    
    const createdClasses = [];
    
    for (const classMapping of classMappings) {
      const newClass = await prisma.class.upsert({
        where: { 
          name_departmentId: { 
            name: classMapping.name, 
            departmentId: classMapping.department.id 
          } 
        },
        update: {
          level: classMapping.level,
          sort_order: classMapping.sortOrder
        },
        create: {
          name: classMapping.name,
          departmentId: classMapping.department.id,
          level: classMapping.level,
          sort_order: classMapping.sortOrder
        }
      });
      createdClasses.push(newClass);
    }
    
    console.log(`✅ Created/updated ${createdClasses.length} classes`);
    
    // Create students
    let totalStudentsCreated = 0;
    const createdStudents = [];
    
    for (const [className, students] of Object.entries(newStudentsData)) {
      const classRecord = createdClasses.find(c => c.name === className);
      
      if (!classRecord) {
        console.warn(`⚠️  Class not found: ${className}`);
        continue;
      }
      
      console.log(`\n📝 Processing ${className} - ${students.length} students`);
      
      for (const studentData of students) {
        const { firstName, lastName, middleName } = parseStudentName(studentData.fullName);
        const admissionNo = generateAdmissionNumber(existingAdmissionNumbers.concat(createdStudents.map(s => s.admissionNo)));
        
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
          
          console.log(`  ✓ ${studentData.fullName} -> ${admissionNo}`);
          
        } catch (error) {
          console.error(`  ❌ Failed to create student: ${studentData.fullName}`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 Successfully created ${totalStudentsCreated} students!`);
    
    // Create sample parent accounts and link students
    console.log('\n👨‍👩‍👧‍👦 Creating parent accounts...');
    
    const parentCount = Math.ceil(createdStudents.length / 3); // Roughly 3 students per parent
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
    console.log('\n📊 SEEDING SUMMARY:');
    console.log(`====================`);
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
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('===============');
    console.log('1. Run: npx prisma generate');
    console.log('2. Run: npx prisma migrate dev');
    console.log('3. Test login with the credentials above');
    console.log('4. Access admin panel to manage grades and results');
    
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
