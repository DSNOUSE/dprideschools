// Test the readable subject display fix
console.log('🎨 TESTING READABLE SUBJECT DISPLAY\n');

async function testReadableSubjects() {
  try {
    // Fetch data
    const [subjectsRes, departmentsRes] = await Promise.all([
      fetch('http://localhost:3000/api/academics/subjects?classId=4'),
      fetch('http://localhost:3000/api/academics/departments')
    ]);
    
    const subjects = await subjectsRes.json();
    const departments = await departmentsRes.json();
    
    // Create department lookup
    const departmentMap = {};
    departments.forEach(dept => {
      departmentMap[dept.id] = dept.name;
    });
    
    console.log('📊 DEPARTMENT ABBREVIATIONS:');
    Object.entries(departmentMap).forEach(([id, name]) => {
      const abbrev = name.substring(0, 3);
      console.log(`   Dept ${id}: ${name} → "${abbrev}"`);
    });
    console.log('');
    
    // Test the new display format
    console.log('🎯 NEW DISPLAY FORMAT (More Readable):');
    const enhancedSubjects = subjects.map(subject => ({
      ...subject,
      displayName: `${subject.name} (${departmentMap[subject.departmentId]?.substring(0, 3) || `D${subject.departmentId}`})`
    }));
    
    // Group by name to show the improvement
    const subjectGroups = {};
    enhancedSubjects.forEach(subject => {
      const name = subject.name;
      if (!subjectGroups[name]) {
        subjectGroups[name] = [];
      }
      subjectGroups[name].push(subject);
    });
    
    Object.entries(subjectGroups).forEach(([name, entries]) => {
      if (entries.length > 1) {
        console.log(`📋 ${name}:`);
        entries.forEach(entry => {
          console.log(`   - ${entry.displayName} (ID: ${entry.id})`);
        });
        console.log('');
      }
    });
    
    console.log('✅ COMPARISON:');
    console.log('');
    console.log('BEFORE (too long):');
    console.log('   - Mathematics (Secondary) (Max: 100)');
    console.log('   - Mathematics (Primary) (Max: 100)');
    console.log('   - Cultural and Creative Art (CCA) (Secondary) (Max: 100)');
    console.log('');
    console.log('AFTER (concise):');
    console.log('   - Mathematics (Sec) (Max: 100)');
    console.log('   - Mathematics (Pri) (Max: 100)');
    console.log('   - Cultural and Creative Art (CCA) (Sec) (Max: 100)');
    console.log('');
    
    console.log('🎉 BENEFITS:');
    console.log('✅ Shorter department names');
    console.log('✅ Easier to scan dropdown');
    console.log('✅ Still clear distinction');
    console.log('✅ More professional appearance');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testReadableSubjects().catch(console.error);
