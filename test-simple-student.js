// Test simple student authentication
console.log('👨‍🎓 TESTING SIMPLE STUDENT LOGIN\n');

async function testSimpleStudent() {
  try {
    // Test 1: Check SAMPLE001 student
    console.log('🔍 TEST 1: SAMPLE001 Student');
    
    const response = await fetch('http://localhost:3000/api/academics/students?classId=1&sessionId=1');
    const students = await response.json();
    
    console.log('Students in Primary 1:');
    students.forEach(student => {
      console.log(`   Admission No: "${student.admissionNo}"`);
      console.log(`   Name: ${student.firstName} ${student.lastName}`);
      console.log('');
    });
    
    if (students.length > 0) {
      const sampleStudent = students[0];
      console.log('✅ Found test student:');
      console.log(`   Try these credentials:`);
      console.log(`   Username: ${sampleStudent.admissionNo}`);
      console.log(`   Password: ${sampleStudent.admissionNo}`);
      console.log('');
      
      console.log('🎯 LOGIN INSTRUCTIONS:');
      console.log('1. Open incognito window');
      console.log('2. Go to: http://localhost:3000/signin');
      console.log(`3. Username: ${sampleStudent.admissionNo}`);
      console.log(`4. Password: ${sampleStudent.admissionNo}`);
      console.log('5. Click "Sign In"');
      console.log('');
      
      console.log('🔍 If still fails, try:');
      console.log('- Check for extra spaces in username/password');
      console.log('- Make sure caps lock is off');
      console.log('- Try copy-pasting the admission number');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testSimpleStudent().catch(console.error);
