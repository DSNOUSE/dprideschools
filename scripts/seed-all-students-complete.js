// Complete student seeding script - creates all students with admission numbers DPS2026001+
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const argon2 = require('argon2');

// Load .env if needed
const fs = require('fs');
const path = require('path');
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      const unquoted = value.replace(/^"|"$/g, '');
      if (!process.env[key]) process.env[key] = unquoted;
    });
  }
} catch (err) {
  // ignore
}

// Prisma 7 client requires an adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Student data from your actual class lists
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

async function main() {
  console.log('🚀 Starting complete student seeding...\n');
  
  try {
    // Get current session
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
      console.log(`📅 Created new session: ${currentSession.name}\n`);
    } else {
      console.log(`📅 Using existing session: ${currentSession.name}\n`);
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
    
    console.log('✅ Departments ready\n');
    
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
    
    console.log(`✅ Classes ready (${createdClasses.length} classes)\n`);
    
    // Create students
    let totalStudentsCreated = 0;
    let totalStudentsUpdated = 0;
    const year = new Date().getFullYear();
    
    console.log('👨‍🎓 Creating students...\n');
    
    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];
      const parts = studentData.fullName.trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts[parts.length - 1] || '';
      const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : null;
      
      const admissionNo = `DPS${year}${(i + 1).toString().padStart(3, '0')}`;
      
      const classRecord = createdClasses.find(c => c.name === studentData.class);
      
      if (!classRecord) {
        console.warn(`❌ Class not found: ${studentData.class}`);
        continue;
      }
      
      try {
        const result = await prisma.student.upsert({
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
        
        if (result) {
          totalStudentsCreated++;
          console.log(`  ✅ ${admissionNo}: ${studentData.fullName} (${studentData.class})`);
        }
        
      } catch (error) {
        console.error(`  ❌ Failed to create student: ${studentData.fullName}`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully seeded ${totalStudentsCreated} students!\n`);
    
    // Display login instructions
    console.log('📋 LOGIN INSTRUCTIONS:');
    console.log('=======================');
    console.log('Students can now login with their admission number:');
    console.log('  Username: DPS2026001 (or DPS2026002, DPS2026003, etc.)');
    console.log('  Password: [same as admission number]\n');
    console.log('Example:');
    console.log('  Username: DPS2026001');
    console.log('  Password: DPS2026001\n');
    
    await prisma.$disconnect();
    console.log('✅ Database connection closed\n');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
