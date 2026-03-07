// Test student authentication directly
console.log('🔐 TESTING STUDENT AUTHENTICATION\n');

async function testStudentAuth() {
  try {
    const testStudents = [
      { admissionNo: 'SAMPLE001', password: 'SAMPLE001' },
      { admissionNo: 'DPS2026012', password: 'DPS2026012' },
      { admissionNo: 'DPS2026011', password: 'DPS2026011' }
    ];
    
    for (const student of testStudents) {
      console.log(`\n🧪 Testing ${student.admissionNo}...`);
      
      // Test direct authentication
      const formData = new URLSearchParams();
      formData.append('email', student.admissionNo);
      formData.append('password', student.password);
      formData.append('csrfToken', 'test');
      formData.append('redirect', 'false');
      formData.append('callbackUrl', 'http://localhost:3000');
      
      const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ SUCCESS: Authentication worked`);
        console.log(`   📦 Response:`, result);
      } else {
        const error = await response.text();
        console.log(`   ❌ FAILED: ${response.status}`);
        console.log(`   📄 Error:`, error);
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testStudentAuth().catch(console.error);
