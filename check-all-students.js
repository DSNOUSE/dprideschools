// Check what students actually exist in the database
console.log('🔍 CHECKING ALL STUDENTS IN DATABASE\n');

async function checkAllStudents() {
  try {
    console.log('📊 Fetching all students from database...');
    
    // Try to get all students without class/session filter
    const response = await fetch('http://localhost:3000/api/academics/students');
    
    if (response.ok) {
      const allStudents = await response.json();
      console.log(`✅ Found ${allStudents.length} total students in database:`);
      
      allStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
        console.log(`   🆔 Admission No: ${student.admissionNo}`);
        console.log(`   🏫 Class ID: ${student.classId}`);
        console.log(`   📅 Session ID: ${student.sessionId}`);
        console.log('');
      });
      
      // Test specific students
      const testStudents = ['SAMPLE001', 'DPS2026012', 'DPS2026011'];
      console.log('🧪 Testing specific students:');
      
      testStudents.forEach(admissionNo => {
        const exists = allStudents.some(s => s.admissionNo === admissionNo);
        console.log(`${exists ? '✅' : '❌'} ${admissionNo}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
      });
      
    } else {
      console.log('❌ Failed to fetch students:', response.status);
      const error = await response.json();
      console.log('Error:', error);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkAllStudents().catch(console.error);
