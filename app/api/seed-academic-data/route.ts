import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import argon2 from 'argon2';

// This endpoint can be called manually to seed academic data on production
// Usage: POST to /api/seed-academic-data with Authorization header
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Simple security check - require a secret key
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.SEED_SECRET || 'dpride-seed-2026'}`;
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid seed secret' },
        { status: 401 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    console.log('🚀 Starting academic data seeding via API...');

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

    // 2. Create Classes
    const classMappings = [
      { name: 'DISCOVERY CLASS (Pre-Nursery)', departmentId: earlyYearsDept!.id, sort_order: 1 },
      { name: 'EXPLORERS (Nursery 1)', departmentId: earlyYearsDept!.id, sort_order: 2 },
      { name: 'PREPARATORY (Nursery 2)', departmentId: earlyYearsDept!.id, sort_order: 3 },
      { name: 'YEAR 1', departmentId: primaryDept!.id, sort_order: 4 },
      { name: 'YEAR 2', departmentId: primaryDept!.id, sort_order: 5 },
      { name: 'YEAR 3', departmentId: primaryDept!.id, sort_order: 6 },
      { name: 'YEAR 4', departmentId: primaryDept!.id, sort_order: 7 },
      { name: 'YEAR 5', departmentId: primaryDept!.id, sort_order: 8 },
      { name: 'YEAR 6', departmentId: primaryDept!.id, sort_order: 9 },
      { name: 'YEAR 7', departmentId: secondaryDept!.id, sort_order: 10 },
      { name: 'YEAR 8', departmentId: secondaryDept!.id, sort_order: 11 },
      { name: 'YEAR 9', departmentId: secondaryDept!.id, sort_order: 12 }
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

    // 3. Create Session
    const currentYear = new Date().getFullYear();
    const sessionName = `${currentYear}/${currentYear + 1}`;
    
    const session = await prisma.session.upsert({
      where: { name: sessionName },
      update: { isActive: true },
      create: { name: sessionName, isActive: true }
    });

    // 4. Create Terms
    const terms = ['First Term', 'Second Term', 'Third Term'];
    for (const termName of terms) {
      await prisma.term.upsert({
        where: { name: termName },
        update: {},
        create: { name: termName }
      });
    }

    // 5. Create Subjects
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
            departmentId: earlyYearsDept!.id 
          } 
        },
        update: {},
        create: { name: subjectName, departmentId: earlyYearsDept!.id }
      });
      subjectCount++;
    }
    
    for (const subjectName of primarySubjects) {
      await prisma.subject.upsert({
        where: { 
          name_departmentId: { 
            name: subjectName, 
            departmentId: primaryDept!.id 
          } 
        },
        update: {},
        create: { name: subjectName, departmentId: primaryDept!.id }
      });
      subjectCount++;
    }
    
    for (const subjectName of secondarySubjects) {
      await prisma.subject.upsert({
        where: { 
          name_departmentId: { 
            name: subjectName, 
            departmentId: secondaryDept!.id 
          } 
        },
        update: {},
        create: { name: subjectName, departmentId: secondaryDept!.id }
      });
      subjectCount++;
    }

    // 6. Verify admin user
    const adminEmail = 'admin@dprideschools.com';
    const adminPassword = 'ILoveCatsToo123#';
    
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
    
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Academic data seeded successfully',
      data: {
        departments: departments.length,
        classes: classCount,
        subjects: subjectCount,
        terms: terms.length,
        session: sessionName,
        adminEmail
      }
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed academic data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
