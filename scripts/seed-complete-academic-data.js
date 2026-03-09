// Complete academic data seeding script - departments, classes, subjects, terms
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

async function main() {
  console.log('🚀 Starting complete academic data seeding...\n');
  
  try {
    // 1. Create/Update Departments
    console.log('📚 Creating departments...');
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
    
    console.log(`✅ Created ${departments.length} departments\n`);
    
    // 2. Create/Update Classes with department links
    console.log('🏫 Creating classes...');
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
    
    const createdClasses = [];
    for (const classMapping of classMappings) {
      const cls = await prisma.class.upsert({
        where: { 
          name_departmentId: { 
            name: classMapping.name, 
            departmentId: classMapping.departmentId 
          } 
        },
        update: { sort_order: classMapping.sort_order },
        create: classMapping
      });
      createdClasses.push(cls);
    }
    
    console.log(`✅ Created ${createdClasses.length} classes\n`);
    
    // 3. Create Session
    console.log('📅 Creating sessions...');
    const currentYear = new Date().getFullYear();
    const sessionName = `${currentYear}/${currentYear + 1}`;
    
    const currentSession = await prisma.session.upsert({
      where: { name: sessionName },
      update: { isActive: true },
      create: { name: sessionName, isActive: true }
    });
    
    console.log(`✅ Session: ${currentSession.name}\n`);
    
    // 4. Create Terms
    console.log('📆 Creating terms...');
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
    
    console.log(`✅ Created ${terms.length} terms\n`);
    
    // 5. Create Subjects for each department
    console.log('📖 Creating subjects...');
    
    // Early Years subjects
    const earlyYearsSubjects = [
      'Language Arts',
      'Mathematics',
      'Science',
      'Social Studies',
      'Arts & Crafts',
      'Physical Education',
      'Quran Studies'
    ];
    
    // Primary subjects
    const primarySubjects = [
      'English Language',
      'Mathematics',
      'Science',
      'Social Studies',
      'Computer Studies',
      'Physical & Health Education',
      'Creative Arts',
      'Islamic Studies',
      'Arabic Language',
      'Quran Studies'
    ];
    
    // Secondary subjects
    const secondarySubjects = [
      'English Language',
      'Mathematics',
      'Biology',
      'Chemistry',
      'Physics',
      'Geography',
      'History',
      'Economics',
      'Computer Science',
      'Islamic Studies',
      'Arabic Language',
      'Physical & Health Education',
      'Civic Education'
    ];
    
    let subjectCount = 0;
    
    // Seed Early Years subjects
    for (const subjectName of earlyYearsSubjects) {
      await prisma.subject.upsert({
        where: { 
          name_departmentId: { 
            name: subjectName, 
            departmentId: earlyYearsDept.id 
          } 
        },
        update: {},
        create: { 
          name: subjectName, 
          departmentId: earlyYearsDept.id 
        }
      });
      subjectCount++;
    }
    
    // Seed Primary subjects
    for (const subjectName of primarySubjects) {
      await prisma.subject.upsert({
        where: { 
          name_departmentId: { 
            name: subjectName, 
            departmentId: primaryDept.id 
          } 
        },
        update: {},
        create: { 
          name: subjectName, 
          departmentId: primaryDept.id 
        }
      });
      subjectCount++;
    }
    
    // Seed Secondary subjects
    for (const subjectName of secondarySubjects) {
      await prisma.subject.upsert({
        where: { 
          name_departmentId: { 
            name: subjectName, 
            departmentId: secondaryDept.id 
          } 
        },
        update: {},
        create: { 
          name: subjectName, 
          departmentId: secondaryDept.id 
        }
      });
      subjectCount++;
    }
    
    console.log(`✅ Created ${subjectCount} subjects\n`);
    
    // 6. Verify admin user
    console.log('👤 Verifying admin user...');
    const adminEmail = 'admin@dprideschools.com';
    const adminPassword = 'ILoveCatsToo123#';
    
    // Ensure Administrator role
    const adminRole = await prisma.role.upsert({
      where: { name: 'Administrator' },
      update: {},
      create: { name: 'Administrator', description: 'Full administrative access' },
    });
    
    const passwordHash = await argon2.hash(adminPassword);
    const adminUser = await prisma.user.upsert({
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
    
    // Attach Administrator role
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    });
    
    console.log(`✅ Admin user ready: ${adminEmail}\n`);
    
    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 ACADEMIC DATA SEEDING COMPLETE');
    console.log('═══════════════════════════════════════');
    console.log(`📚 Departments: ${departments.length}`);
    console.log(`🏫 Classes: ${createdClasses.length}`);
    console.log(`📖 Subjects: ${subjectCount}`);
    console.log(`📆 Terms: ${terms.length}`);
    console.log(`📅 Session: ${currentSession.name}`);
    console.log(`👤 Admin User: ${adminEmail}`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('🔐 ADMIN LOGIN CREDENTIALS:');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}\n`);
    
    await prisma.$disconnect();
    console.log('✅ Database connection closed\n');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
