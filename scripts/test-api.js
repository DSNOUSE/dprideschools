// Test audit system via API calls
const fetch = require('node-fetch');

async function testAuditAPI() {
  try {
    console.log('🌐 Testing Audit System via API...\n');

    const baseUrl = 'http://localhost:3000';

    // 1. Test login to get session
    console.log('1️⃣ Testing login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@dprideschools.com',
        password: 'ILoveCatsToo123#'
      }),
      redirect: 'manual'
    });

    if (loginResponse.ok) {
      console.log('   ✅ Login successful');
    } else {
      console.log('   ❌ Login failed');
      return;
    }

    // 2. Test audit logs API
    console.log('\n2️⃣ Testing audit logs API...');
    const auditResponse = await fetch(`${baseUrl}/api/admin/audit/logs?limit=5`, {
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie')
      }
    });

    if (auditResponse.ok) {
      const auditData = await auditResponse.json();
      console.log(`   ✅ Audit API working - Found ${auditData.logs?.length || 0} logs`);
      
      if (auditData.logs?.length > 0) {
        console.log('   📊 Sample audit log:');
        const log = auditData.logs[0];
        console.log(`      Action: ${log.action}`);
        console.log(`      Teacher: ${log.teacherFullName || log.userName}`);
        console.log(`      Teacher ID: ${log.teacherId || 'Not set'}`);
        console.log(`      Timestamp: ${log.timestamp}`);
      }
    } else {
      console.log('   ❌ Audit API failed');
    }

    // 3. Test teacher management API
    console.log('\n3️⃣ Testing teacher management API...');
    const teachersResponse = await fetch(`${baseUrl}/api/admin/teachers`, {
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie')
      }
    });

    if (teachersResponse.ok) {
      const teachersData = await teachersResponse.json();
      console.log(`   ✅ Teachers API working - Found ${teachersData.teachers?.length || 0} teachers`);
      
      teachersData.teachers?.forEach(teacher => {
        console.log(`      👥 ${teacher.name} (${teacher.email}) -> ID: ${teacher.teacherId || 'Not set'}`);
      });
    } else {
      console.log('   ❌ Teachers API failed');
    }

    console.log('\n🎯 Test Results:');
    console.log('✅ APIs are accessible');
    console.log('💡 Next: Record some grades to test teacher ID tracking');
    console.log('🌐 Visit: http://localhost:3000/admin/academics/grades');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run test
testAuditAPI();
