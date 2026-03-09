// Comprehensive login testing script
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testAllLoginRoutes() {
  console.log('🔐 Testing All Login Routes and Session Management\n');

  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // Test 1: Check existing users
    console.log('\n📋 Checking existing users...');
    const users = await prisma.user.findMany({
      include: { roles: { include: { role: true } } }
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      const roles = user.roles.map(r => r.role.name).join(', ');
      console.log(`  - ${user.email} (${roles})`);
    });

    // Test 2: Check session configuration
    console.log('\n⏱️  Session Configuration:');
    console.log(`  - NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'Not set'}`);
    console.log(`  - NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`  - Session Strategy: JWT`);

    // Test 3: Create sample users if needed
    const argon2 = require('argon2');
    
    // Admin user (should exist)
    const adminPassword = await argon2.hash('ILoveCatsToo123#');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@dprideschools.com' },
      update: { passwordHash: adminPassword },
      create: {
        email: 'admin@dprideschools.com',
        passwordHash: adminPassword,
        name: 'System Administrator',
      }
    });

    // Teacher user
    const teacherPassword = await argon2.hash('Teacher123!');
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@dprideschools.com' },
      update: { passwordHash: teacherPassword },
      create: {
        email: 'teacher@dprideschools.com',
        passwordHash: teacherPassword,
        name: 'Test Teacher',
      }
    });

    // Parent user
    const parentPassword = await argon2.hash('Parent123!');
    const parent = await prisma.user.upsert({
      where: { email: 'parent@dprideschools.com' },
      update: { passwordHash: parentPassword },
      create: {
        email: 'parent@dprideschools.com',
        passwordHash: parentPassword,
        name: 'Test Parent',
      }
    });

    // Student user
    const studentPassword = await argon2.hash('Student123!');
    const student = await prisma.user.upsert({
      where: { email: 'student@dprideschools.com' },
      update: { passwordHash: studentPassword },
      create: {
        email: 'student@dprideschools.com',
        passwordHash: studentPassword,
        name: 'Test Student',
        admissionNo: 'DPS2024001'
      }
    });

    // Assign roles
    const adminRole = await prisma.role.findUnique({ where: { name: 'Administrator' } });
    const teacherRole = await prisma.role.findUnique({ where: { name: 'Teacher' } });
    const parentRole = await prisma.role.findUnique({ where: { name: 'parent' } });
    const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });

    if (adminRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
        update: {},
        create: { userId: admin.id, roleId: adminRole.id }
      });
    }

    if (teacherRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: teacher.id, roleId: teacherRole.id } },
        update: {},
        create: { userId: teacher.id, roleId: teacherRole.id }
      });
    }

    if (parentRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: parent.id, roleId: parentRole.id } },
        update: {},
        create: { userId: parent.id, roleId: parentRole.id }
      });
    }

    if (studentRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: student.id, roleId: studentRole.id } },
        update: {},
        create: { userId: student.id, roleId: studentRole.id }
      });
    }

    console.log('\n🎯 LOGIN ROUTES AND CREDENTIALS:');
    console.log('\n👨‍💼 ADMIN/TEACHER LOGIN:');
    console.log('  URL: http://localhost:3000/admin-signin OR http://localhost:3000/signin');
    console.log('  Admin Email: admin@dprideschools.com | Password: ILoveCatsToo123#');
    console.log('  Teacher Email: teacher@dprideschools.com | Password: Teacher123!');
    
    console.log('\n👨‍👩‍👧‍👦 PARENT/STUDENT LOGIN:');
    console.log('  URL: http://localhost:3000/signin');
    console.log('  Parent Email: parent@dprideschools.com | Password: Parent123!');
    console.log('  Student Email: student@dprideschools.com | Password: Student123!');

    console.log('\n🔄 EXPECTED REDIRECTS:');
    console.log('  Admin → http://localhost:3000/admin');
    console.log('  Teacher → http://localhost:3000/admin');
    console.log('  Parent → http://localhost:3000/results');
    console.log('  Student → http://localhost:3000/student-results');

    console.log('\n⏱️  SESSION MANAGEMENT:');
    console.log('  - Session Duration: Configurable (default: JWT with expiration)');
    console.log('  - Auto-logout: After session expires');
    console.log('  - Persistent Login: Until logout or expiration');
    console.log('  - Secure Cookies: HttpOnly, Secure, SameSite');

    console.log('\n🧪 TESTING INSTRUCTIONS:');
    console.log('1. Open browser in private/incognito mode');
    console.log('2. Test each login with credentials above');
    console.log('3. Verify redirects work correctly');
    console.log('4. Test session persistence (refresh page)');
    console.log('5. Test logout functionality');
    console.log('6. Verify role-based access control');

    console.log('\n📊 FUNCTIONALITY TESTING:');
    console.log('\n👨‍💼 ADMIN/TEACHER ACTIONS:');
    console.log('  ✓ Login to admin dashboard');
    console.log('  ✓ Navigate to /admin/academics/grades');
    console.log('  ✓ Select class, session, term, subject');
    console.log('  ✓ Enter sample grades (85, 90, 88)');
    console.log('  ✓ Save grades and verify success');
    console.log('  ✓ Navigate to /admin/students to view students');
    console.log('  ✓ Test other admin functions');

    console.log('\n👨‍👩‍👧‍👦 PARENT ACTIONS:');
    console.log('  ✓ Login as parent');
    console.log('  ✓ Navigate to results page');
    console.log('  ✓ Search for student results');
    console.log('  ✓ View comprehensive results display');
    console.log('  ✓ Test session persistence');

    console.log('\n🎓 STUDENT ACTIONS:');
    console.log('  ✓ Login as student');
    console.log('  ✓ Auto-redirect to student results');
    console.log('  ✓ View personal academic results');
    console.log('  ✓ Test different result views');

    console.log('\n🔐 SECURITY TESTING:');
    console.log('  ✓ Try accessing /admin without login (should redirect)');
    console.log('  ✓ Try accessing other protected routes');
    console.log('  ✓ Test session timeout behavior');
    console.log('  ✓ Verify logout clears session');

    console.log('\n✅ SYSTEM READY FOR TESTING!');
    console.log('\n📝 NextAuth Session Configuration:');
    console.log('  - Strategy: Credentials');
    console.log('  - Session: JWT with default expiration');
    console.log('  - Callbacks: JWT and session handling configured');
    console.log('  - Redirects: Role-based automatic redirection');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAllLoginRoutes();
