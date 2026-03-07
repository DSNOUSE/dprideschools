// Debug SAMPLE001 student data in database
console.log('🔍 DEBUGGING SAMPLE001 DATABASE RECORD\n');

async function debugSample001() {
  try {
    // First, check if we can access the students API
    console.log('📊 Testing students API...');
    const studentsRes = await fetch('http://localhost:3000/api/academics/students?classId=1&sessionId=1');
    
    if (studentsRes.ok) {
      const students = await studentsRes.json();
      console.log(`✅ Found ${students.length} students in class 1, session 1`);
      
      // Find SAMPLE001
      const sample001 = students.find(s => s.admissionNo === 'SAMPLE001');
      if (sample001) {
        console.log('✅ SAMPLE001 found:');
        console.log(`👤 Name: ${sample001.firstName} ${sample001.lastName}`);
        console.log(`🆔 Admission No: ${sample001.admissionNo}`);
        console.log(`🏫 Class ID: ${sample001.classId}`);
        console.log(`📅 Session ID: ${sample001.sessionId}`);
        console.log(`📚 Class: ${sample001.class?.name || 'undefined'}`);
        console.log(`📖 Session: ${sample001.session?.name || 'undefined'}`);
      } else {
        console.log('❌ SAMPLE001 not found in students API');
      }
    } else {
      console.log('❌ Students API failed:', studentsRes.status);
    }
    
    // Also test direct database query if possible
    console.log('\n🔍 Testing direct student lookup...');
    const directRes = await fetch('http://localhost:3000/api/academics/students');
    if (directRes.ok) {
      const allStudents = await directRes.json();
      const sample001 = allStudents.find(s => s.admissionNo === 'SAMPLE001');
      if (sample001) {
        console.log('✅ SAMPLE001 found in all students:');
        console.log(`🏫 Class ID: ${sample001.classId}`);
        console.log(`📅 Session ID: ${sample001.sessionId}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugSample001().catch(console.error);
