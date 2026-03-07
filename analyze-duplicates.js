// Analyze the duplicate subjects issue
console.log('🔍 ANALYZING DUPLICATE SUBJECTS ISSUE\n');

async function analyzeDuplicates() {
  try {
    const response = await fetch('http://localhost:3000/api/academics/subjects?classId=4');
    const subjects = await response.json();
    
    console.log('📊 TOTAL SUBJECTS:', subjects.length);
    console.log('');
    
    // Group by subject name
    const subjectGroups = {};
    subjects.forEach(subject => {
      const name = subject.name;
      if (!subjectGroups[name]) {
        subjectGroups[name] = [];
      }
      subjectGroups[name].push(subject);
    });
    
    // Find duplicates
    console.log('🔄 DUPLICATE SUBJECTS ANALYSIS:');
    console.log('');
    
    let duplicateCount = 0;
    let uniqueCount = 0;
    
    Object.entries(subjectGroups).forEach(([name, entries]) => {
      if (entries.length > 1) {
        duplicateCount++;
        console.log(`📋 ${name} (${entries.length} entries):`);
        entries.forEach(entry => {
          console.log(`   - ID: ${entry.id}, Department: ${entry.departmentId}, Max Score: ${entry.maxScore}`);
        });
        console.log('');
      } else {
        uniqueCount++;
      }
    });
    
    console.log('📈 SUMMARY:');
    console.log(`✅ Unique Subjects: ${uniqueCount}`);
    console.log(`🔄 Duplicate Subjects: ${duplicateCount}`);
    console.log(`📊 Total Entries: ${subjects.length}`);
    console.log('');
    
    // Show department information
    console.log('🏢 DEPARTMENT BREAKDOWN:');
    const deptGroups = {};
    subjects.forEach(subject => {
      const deptId = subject.departmentId;
      if (!deptGroups[deptId]) {
        deptGroups[deptId] = [];
      }
      deptGroups[deptId].push(subject);
    });
    
    Object.entries(deptGroups).forEach(([deptId, subjects]) => {
      console.log(`Department ${deptId}: ${subjects.length} subjects`);
      subjects.slice(0, 3).forEach(s => console.log(`   - ${s.name}`));
      if (subjects.length > 3) console.log(`   ... and ${subjects.length - 3} more`);
      console.log('');
    });
    
    // Show the problem and solution
    console.log('🎯 THE PROBLEM:');
    console.log('❌ Same subject exists in multiple departments');
    console.log('❌ Teachers see confusing duplicate options');
    console.log('❌ Could lead to grading wrong department subject');
    console.log('');
    
    console.log('💡 SOLUTIONS:');
    console.log('1. 🏷️  Add department names to subject display');
    console.log('2. 🗑️  Remove actual duplicates (same subject, same department)');
    console.log('3. 📊 Filter subjects by teacher department');
    console.log('4. 🎯 Show only relevant subjects for class level');
    console.log('');
    
    console.log('🔧 QUICK FIX - Add Department Names:');
    console.log('Instead of: "Mathematics"');
    console.log('Show: "Mathematics (Dept 2)" and "Mathematics (Dept 6)"');
    console.log('');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Also check departments to understand the structure
async function checkDepartments() {
  console.log('🏢 DEPARTMENT INFORMATION:');
  
  try {
    const response = await fetch('http://localhost:3000/api/academics/departments');
    const departments = await response.json();
    
    console.log(`Found ${departments.length} departments:`);
    departments.forEach(dept => {
      console.log(`   Dept ${dept.id}: ${dept.name}`);
    });
    console.log('');
  } catch (error) {
    console.log('❌ Error fetching departments:', error.message);
  }
}

// Run the analysis
async function runAnalysis() {
  console.log('🚀 STARTING DUPLICATE SUBJECTS ANALYSIS\n');
  console.log('=' .repeat(50));
  
  await analyzeDuplicates();
  await checkDepartments();
  
  console.log('🎯 RECOMMENDATION:');
  console.log('The duplicates exist because subjects are assigned to different departments.');
  console.log('This might be intentional (different curricula) but confusing for teachers.');
  console.log('');
  console.log('🔧 BEST SOLUTION:');
  console.log('1. Add department names to subject dropdown options');
  console.log('2. Or filter subjects by teacher department assignment');
  console.log('3. Or create subject-class mappings to show only relevant subjects');
}

runAnalysis().catch(console.error);
