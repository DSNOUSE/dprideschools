// Find all real students in the database
console.log('🔍 FINDING ALL REAL STUDENTS\n');

async function findRealStudents() {
  try {
    // First get all classes and sessions
    console.log('📊 Getting classes and sessions...');
    
    const [classesRes, sessionsRes] = await Promise.all([
      fetch('http://localhost:3000/api/academics/classes'),
      fetch('http://localhost:3000/api/academics/sessions')
    ]);
    
    if (!classesRes.ok || !sessionsRes.ok) {
      console.log('❌ Failed to get classes/sessions');
      return;
    }
    
    const classes = await classesRes.json();
    const sessions = await sessionsRes.json();
    
    console.log(`Found ${classes.length} classes and ${sessions.length} sessions`);
    
    // Check students in each class/session combination
    const allStudents = [];
    
    for (const classItem of classes) {
      for (const sessionItem of sessions) {
        console.log(`\n🔍 Checking Class ${classItem.name} (ID: ${classItem.id}), Session ${sessionItem.name} (ID: ${sessionItem.id})`);
        
        const studentsRes = await fetch(`http://localhost:3000/api/academics/students?classId=${classItem.id}&sessionId=${sessionItem.id}`);
        
        if (studentsRes.ok) {
          const students = await studentsRes.json();
          console.log(`   Found ${students.length} students`);
          
          students.forEach(student => {
            allStudents.push(student);
            console.log(`   👤 ${student.firstName} ${student.lastName} (${student.admissionNo})`);
          });
        } else {
          console.log(`   ❌ Failed to get students: ${studentsRes.status}`);
        }
      }
    }
    
    console.log(`\n📋 SUMMARY: Found ${allStudents.length} total students:`);
    
    // Test our specific students
    const testStudents = ['SAMPLE001', 'DPS2026012', 'DPS2026011'];
    console.log('\n🧪 Testing specific students:');
    
    testStudents.forEach(admissionNo => {
      const exists = allStudents.some(s => s.admissionNo === admissionNo);
      console.log(`${exists ? '✅' : '❌'} ${admissionNo}: ${exists ? 'EXISTS in database' : 'NOT FOUND in database'}`);
    });
    
    console.log('\n🎯 Available students for testing:');
    allStudents.forEach(student => {
      console.log(`   • ${student.admissionNo} / ${student.admissionNo} (${student.firstName} ${student.lastName})`);
    });
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

findRealStudents().catch(console.error);
