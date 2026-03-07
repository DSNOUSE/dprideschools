// Test SAMPLE001 results API call
console.log('🧪 TESTING SAMPLE001 RESULTS API\n');

async function testSample001Results() {
  try {
    console.log('📊 Testing SAMPLE001 results for Class 1, Session 1, Term 1\n');
    
    const response = await fetch('http://localhost:3000/api/results/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: "1",
        sessionId: "1", 
        termId: "1",
        studentId: "SAMPLE001"
      })
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS! Results found:');
      console.log(`👤 Student: ${result.result?.student?.name || 'Unknown'}`);
      console.log(`📈 Average: ${result.result?.average || 'N/A'}%`);
      console.log(`🏆 Position: ${result.result?.position || 'N/A'}`);
      console.log(`📚 Subjects: ${result.grades?.length || 0} grades`);
      
      if (result.grades && result.grades.length > 0) {
        console.log('\n📖 Subject Grades:');
        result.grades.forEach(grade => {
          console.log(`   - ${grade.subject?.name}: ${grade.average?.toFixed(1)}%`);
        });
      }
    } else {
      const error = await response.json();
      console.log('❌ ERROR:');
      console.log(`Status: ${response.status}`);
      console.log(`Message: ${error.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

testSample001Results().catch(console.error);
