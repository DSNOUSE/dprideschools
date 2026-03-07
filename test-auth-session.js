// Test what's actually in the auth session
console.log('🔍 TESTING AUTH SESSION DATA\n');

async function testAuthSession() {
  try {
    // Test login as SAMPLE001
    console.log('🔐 Testing login as SAMPLE001...');
    
    const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'SAMPLE001',
        password: 'SAMPLE001',
        csrfToken: 'test', // We'll need to get actual CSRF token
        redirect: 'false',
        callbackUrl: 'http://localhost:3000'
      })
    });
    
    console.log('Login response status:', loginRes.status);
    
    // Instead, let's check the session endpoint directly
    console.log('\n📊 Checking current session...');
    const sessionRes = await fetch('http://localhost:3000/api/auth/session');
    
    if (sessionRes.ok) {
      const session = await sessionRes.json();
      console.log('Current session:', JSON.stringify(session, null, 2));
      
      if (session.user) {
        console.log('\n👤 User data:');
        console.log(`🆔 ID: ${session.user.id}`);
        console.log(`📛 Name: ${session.user.name}`);
        console.log(`🔑 Admission No: ${session.user.admissionNo}`);
        console.log(`🏫 Class ID: ${session.user.classId}`);
        console.log(`📅 Session ID: ${session.user.sessionId}`);
        console.log(`🎭 Role: ${session.user.role}`);
        console.log(`👥 Roles: ${JSON.stringify(session.user.roles)}`);
      } else {
        console.log('❌ No user in session');
      }
    } else {
      console.log('❌ Session check failed:', sessionRes.status);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAuthSession().catch(console.error);
