// Debug student authentication issue
console.log('🔍 DEBUGGING STUDENT AUTHENTICATION\n');

async function debugStudentAuth() {
  try {
    // Step 1: Check if student exists in database
    console.log('📊 STEP 1: Check Student Database');
    const response = await fetch('http://localhost:3000/api/academics/students?classId=4&sessionId=1');
    const students = await response.json();
    
    console.log('Students in PREPARATORY (Nursery 2):');
    students.forEach(student => {
      console.log(`   ID: ${student.id}`);
      console.log(`   Admission No: "${student.admissionNo}"`);
      console.log(`   Name: ${student.firstName} ${student.lastName}`);
      console.log(`   Class: ${student.classId}, Session: ${student.sessionId}`);
      console.log('');
    });
    
    // Step 2: Test the exact admission number
    const testAdmissionNo = 'DPS2026012';
    const studentExists = students.some(s => s.admissionNo === testAdmissionNo);
    console.log(`🔍 STEP 2: Test Admission Number "${testAdmissionNo}"`);
    console.log(`   Exists in database: ${studentExists ? 'YES' : 'NO'}`);
    
    if (studentExists) {
      const student = students.find(s => s.admissionNo === testAdmissionNo);
      console.log(`   Student details: ${student.firstName} ${student.lastName}`);
      console.log(`   Exact admission number: "${student.admissionNo}"`);
      console.log(`   Length: ${student.admissionNo.length} characters`);
    }
    
    // Step 3: Test authentication API directly
    console.log('\n🔐 STEP 3: Test Authentication API');
    
    // Try to authenticate with exact credentials
    const authResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdmissionNo,
        password: testAdmissionNo
      })
    });
    
    console.log(`Auth API Status: ${authResponse.status}`);
    
    if (authResponse.ok) {
      const authResult = await authResponse.json();
      console.log('✅ Authentication successful!');
      console.log('User info:', authResult.user);
    } else {
      const error = await authResponse.json();
      console.log('❌ Authentication failed:', error);
    }
    
    // Step 4: Check if there are other test students
    console.log('\n🔍 STEP 4: Check All Classes for Test Students');
    
    const classes = [
      { id: 1, name: 'Primary 1' },
      { id: 2, name: 'DISCOVERY CLASS' },
      { id: 3, name: 'EXPLORERS (Nursery 1)' },
      { id: 4, name: 'PREPARATORY (Nursery 2)' },
      { id: 5, name: 'YEAR 1' }
    ];
    
    for (const cls of classes) {
      try {
        const classResponse = await fetch(`http://localhost:3000/api/academics/students?classId=${cls.id}&sessionId=1`);
        const classStudents = await classResponse.json();
        
        if (classStudents.length > 0) {
          console.log(`\n📚 ${cls.name} (${classStudents.length} students):`);
          classStudents.slice(0, 2).forEach(student => {
            console.log(`   - ${student.admissionNo}: ${student.firstName} ${student.lastName}`);
          });
        }
      } catch (error) {
        console.log(`❌ Error checking ${cls.name}:`, error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

debugStudentAuth().catch(console.error);
