// Test script for audit system functionality
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAuditSystem() {
  try {
    console.log('🧪 Testing Audit System...');

    // 1. Test teacher creation with ID
    console.log('\n1️⃣ Testing Teacher Creation...');
    const testTeacher = await prisma.user.findFirst({
      where: { teacherId: { not: null } },
      include: { roles: true }
    });

    if (testTeacher) {
      console.log(`✅ Found teacher: ${testTeacher.name} (ID: ${testTeacher.teacherId})`);
      console.log(`   Roles: ${testTeacher.roles.map(r => r.role.name).join(', ')}`);
    } else {
      console.log('❌ No teachers with IDs found. Run create-test-teachers.js first.');
    }

    // 2. Test audit log structure
    console.log('\n2️⃣ Testing Audit Log Structure...');
    const auditLogs = await prisma.resultAuditLog.findMany({
      take: 3,
      include: {
        user: true,
        student: true,
        class: true,
        subject: true
      },
      orderBy: { timestamp: 'desc' }
    });

    console.log(`📊 Found ${auditLogs.length} recent audit logs:`);
    auditLogs.forEach((log, index) => {
      console.log(`\n   Log ${index + 1}:`);
      console.log(`   - Action: ${log.action} ${log.entityType}`);
      console.log(`   - Teacher: ${log.teacherFullName || log.userName} (ID: ${log.teacherId || 'Not set'})`);
      console.log(`   - Student: ${log.student?.name || 'N/A'}`);
      console.log(`   - Class: ${log.class?.name || 'N/A'}`);
      console.log(`   - Timestamp: ${log.timestamp}`);
      console.log(`   - IP: ${log.ipAddress}`);
    });

    // 3. Test teacher activity logs
    console.log('\n3️⃣ Testing Teacher Activity Logs...');
    const activityLogs = await prisma.teacherActivityLog.findMany({
      take: 3,
      include: {
        user: true,
        class: true
      },
      orderBy: { timestamp: 'desc' }
    });

    console.log(`📈 Found ${activityLogs.length} recent activity logs:`);
    activityLogs.forEach((log, index) => {
      console.log(`\n   Activity ${index + 1}:`);
      console.log(`   - Action: ${log.action}`);
      console.log(`   - Teacher: ${log.teacherFullName || log.user?.name} (ID: ${log.teacherId || 'Not set'})`);
      console.log(`   - Duration: ${log.duration || 'N/A'}ms`);
      console.log(`   - Records: ${log.recordsAffected || 'N/A'}`);
      console.log(`   - Timestamp: ${log.timestamp}`);
    });

    // 4. Test API endpoints (manual check needed)
    console.log('\n4️⃣ Manual API Tests Required:');
    console.log('   🌐 Test these URLs in browser:');
    console.log('   - GET /api/admin/audit/logs');
    console.log('   - GET /api/admin/audit/stats');
    console.log('   - GET /api/admin/audit/teachers');
    console.log('   - GET /api/admin/teachers');
    console.log('   - POST /api/academics/grades (with teacher session)');

    // 5. Test database indexes
    console.log('\n5️⃣ Testing Database Performance...');
    const startTime = Date.now();
    
    // Test teacher-based query
    const teacherLogs = await prisma.resultAuditLog.findMany({
      where: { teacherId: 'TCH001' },
      take: 10,
      orderBy: { timestamp: 'desc' }
    });
    
    const queryTime = Date.now() - startTime;
    console.log(`⚡ Teacher query performance: ${queryTime}ms (${teacherLogs.length} results)`);

    console.log('\n🎉 Audit system test completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Create test teachers using: node scripts/create-test-teachers.js');
    console.log('   2. Log in as a teacher and record some grades');
    console.log('   3. Check audit dashboard: /admin/audit');
    console.log('   4. Verify teacher IDs appear in logs');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testAuditSystem();
