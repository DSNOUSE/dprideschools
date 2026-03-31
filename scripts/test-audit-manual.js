// Simple test script to check audit system status
const { PrismaClient } = require('@prisma/client');

// Use the same import pattern as the app
const prisma = new PrismaClient();

async function testAuditSystem() {
  try {
    console.log('🧪 Testing Audit System Status...\n');

    // 1. Check if audit tables exist and have data
    console.log('1️⃣ Checking audit tables...');
    
    const auditLogCount = await prisma.resultAuditLog.count();
    console.log(`   📊 ResultAuditLog records: ${auditLogCount}`);
    
    const activityLogCount = await prisma.teacherActivityLog.count();
    console.log(`   📈 TeacherActivityLog records: ${activityLogCount}`);

    // 2. Check users with teacher IDs
    console.log('\n2️⃣ Checking users with teacher IDs...');
    const usersWithTeacherId = await prisma.user.findMany({
      where: {
        teacherId: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        teacherId: true,
        roles: {
          select: {
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    console.log(`   👥 Users with teacher IDs: ${usersWithTeacherId.length}`);
    usersWithTeacherId.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) -> ID: ${user.teacherId || 'Not set'}`);
      console.log(`     Roles: ${user.roles.map(r => r.role.name).join(', ')}`);
    });

    // 3. Check recent audit logs with teacher info
    console.log('\n3️⃣ Checking recent audit logs...');
    const recentLogs = await prisma.resultAuditLog.findMany({
      take: 3,
      include: {
        user: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    console.log(`   📝 Recent audit logs (${recentLogs.length}):`);
    recentLogs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.action} ${log.entityType} by ${log.userName || log.user?.name}`);
      console.log(`      Teacher ID: ${log.teacherId || 'Not set'}`);
      console.log(`      Timestamp: ${log.timestamp}`);
      console.log(`      IP: ${log.ipAddress}`);
    });

    // 4. Test results
    console.log('\n4️⃣ Test Results:');
    if (auditLogCount > 0) {
      console.log('   ✅ Audit system is working');
      console.log(`   📊 Found ${auditLogCount} audit log entries`);
    } else {
      console.log('   ⚠️ No audit logs found - system may need testing');
    }

    if (usersWithTeacherId.length > 0) {
      console.log('   ✅ Teacher IDs are configured');
      console.log(`   👥 ${usersWithTeacherId.length} users have teacher IDs`);
    } else {
      console.log('   ⚠️ No users with teacher IDs found');
      console.log('   💡 Update admin user with teacher ID to test');
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. If no teacher IDs: Update admin user via /admin/teachers');
    console.log('2. Log in as teacher and record grades');
    console.log('3. Check /admin/audit for teacher ID tracking');
    console.log('4. Verify teacher IDs appear in audit logs');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testAuditSystem();
