// Debug why students aren't showing in grade management
console.log('🔍 DEBUGGING STUDENT LOADING ISSUE\n');

// Test 1: Check if students API works
async function testStudentsAPI() {
  console.log('📊 Test 1: Students API Check');
  
  try {
    const response = await fetch('http://localhost:3000/api/academics/students?classId=4&sessionId=1');
    const students = await response.json();
    
    console.log(`✅ API Response: Found ${students.length} students`);
    students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.admissionNo}: ${student.firstName} ${student.lastName} ${student.middleName || ''}`);
    });
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }
  
  console.log('');
}

// Test 2: Check dropdown data
async function testDropdownData() {
  console.log('📋 Test 2: Dropdown Data Check');
  
  try {
    // Classes
    const classesRes = await fetch('http://localhost:3000/api/academics/classes');
    const classes = await classesRes.json();
    console.log(`✅ Classes: Found ${classes.length} classes`);
    const primary1 = classes.find(c => c.name.includes('Primary 1'));
    console.log(`   Primary 1 ID: ${primary1 ? primary1.id : 'NOT FOUND'}`);
    
    // Sessions
    const sessionsRes = await fetch('http://localhost:3000/api/academics/sessions');
    const sessions = await sessionsRes.json();
    console.log(`✅ Sessions: Found ${sessions.length} sessions`);
    const currentSession = sessions.find(s => s.name.includes('2024/2025'));
    console.log(`   2024/2025 ID: ${currentSession ? currentSession.id : 'NOT FOUND'}`);
    
    // Terms
    const termsRes = await fetch('http://localhost:3000/api/academics/terms');
    const terms = await termsRes.json();
    console.log(`✅ Terms: Found ${terms.length} terms`);
    const term1 = terms.find(t => t.name.includes('Term 1'));
    console.log(`   Term 1 ID: ${term1 ? term1.id : 'NOT FOUND'}`);
    
  } catch (error) {
    console.log('❌ Dropdown Error:', error.message);
  }
  
  console.log('');
}

// Test 3: Simulate the exact workflow
function simulateWorkflow() {
  console.log('🎭 Test 3: Workflow Simulation');
  
  console.log('📝 CURRENT STATE:');
  console.log('   Class dropdown: [NOT SELECTED]');
  console.log('   Session dropdown: [NOT SELECTED]');
  console.log('   Term dropdown: [NOT SELECTED]');
  console.log('   Students: [] (empty)');
  console.log('');
  
  console.log('🔄 STEP 1: Select Class Only');
  console.log('   Class dropdown: [Primary 1 selected]');
  console.log('   Session dropdown: [NOT SELECTED]');
  console.log('   Term dropdown: [NOT SELECTED]');
  console.log('   Students: [] (still empty - need ALL 3!)');
  console.log('');
  
  console.log('🔄 STEP 2: Select Class + Session');
  console.log('   Class dropdown: [Primary 1 selected]');
  console.log('   Session dropdown: [2024/2025 selected]');
  console.log('   Term dropdown: [NOT SELECTED]');
  console.log('   Students: [] (still empty - need ALL 3!)');
  console.log('');
  
  console.log('🔄 STEP 3: Select All Three (REQUIRED!)');
  console.log('   Class dropdown: [Primary 1 selected]');
  console.log('   Session dropdown: [2024/2025 selected]');
  console.log('   Term dropdown: [Term 1 selected]');
  console.log('   🎉 Students: [Maryam, David] (NOW LOADED!)');
  console.log('');
  
  console.log('📋 THE ISSUE:');
  console.log('❌ Students only load when ALL THREE dropdowns are selected');
  console.log('✅ This is by design - ensures complete context before loading');
  console.log('');
}

// Test 4: Show the exact IDs to use
function showExactIDs() {
  console.log('🎯 Test 4: Exact IDs to Use');
  
  console.log('📋 SELECT THESE EXACT OPTIONS:');
  console.log('');
  console.log('🏫 CLASS:');
  console.log('   Select: "Primary 1" (ID: 4)');
  console.log('   Note: There are TWO "Primary 1" entries - use either');
  console.log('');
  console.log('📅 SESSION:');
  console.log('   Select: "2024/2025" (ID: 1)');
  console.log('');
  console.log('📚 TERM:');
  console.log('   Select: "Term 1" (ID: 1)');
  console.log('');
  console.log('📖 SUBJECT:');
  console.log('   Select: "Mathematics" (ID: 16)');
  console.log('');
  
  console.log('🔄 EXPECTED RESULT:');
  console.log('   Students should appear: Maryam Amin & David Oloruntola');
  console.log('');
}

// Test 5: Alternative approach - check if there are students in other classes
async function checkOtherClasses() {
  console.log('🔍 Test 5: Check Other Classes for Students');
  
  try {
    const classesRes = await fetch('http://localhost:3000/api/academics/classes');
    const classes = await classesRes.json();
    
    console.log('📊 Checking student counts in all classes:');
    
    for (const cls of classes.slice(0, 8)) {
      try {
        const studentsRes = await fetch(`http://localhost:3000/api/academics/students?classId=${cls.id}&sessionId=1`);
        const students = await studentsRes.json();
        
        if (students.length > 0) {
          console.log(`   ✅ ${cls.name} (ID: ${cls.id}): ${students.length} students`);
          students.slice(0, 2).forEach(student => {
            console.log(`      - ${student.admissionNo}: ${student.firstName} ${student.lastName}`);
          });
        } else {
          console.log(`   ❌ ${cls.name} (ID: ${cls.id}): 0 students`);
        }
      } catch (error) {
        console.log(`   ❌ ${cls.name}: Error checking students`);
      }
    }
  } catch (error) {
    console.log('❌ Error checking classes:', error.message);
  }
  
  console.log('');
}

// Run all debugging tests
async function runDebugTests() {
  console.log('🚀 STARTING STUDENT LOADING DEBUG\n');
  console.log('=' .repeat(50));
  
  await testStudentsAPI();
  await testDropdownData();
  simulateWorkflow();
  showExactIDs();
  await checkOtherClasses();
  
  console.log('🎯 SOLUTION:');
  console.log('1. Select ALL THREE dropdowns: Class + Session + Term');
  console.log('2. Students will appear automatically');
  console.log('3. Then select Subject to enable grade entry');
  console.log('');
  console.log('🔧 If still not working:');
  console.log('- Check browser console for errors');
  console.log('- Try refreshing the page');
  console.log('- Ensure you are logged in as teacher/admin');
  console.log('');
}

runDebugTests().catch(console.error);
