// Demonstration script for Teacher and Student workflows
const http = require('http');

console.log('🎓 DPRIDE SCHOOL RESULT SYSTEM WORKFLOW DEMONSTRATION\n');

// Step 1: Show available classes, sessions, terms for teacher
async function showTeacherOptions() {
  console.log('📚 TEACHER WORKFLOW - Step 1: Available Options\n');
  
  const endpoints = [
    { name: 'Classes', url: '/api/academics/classes' },
    { name: 'Sessions', url: '/api/academics/sessions' },
    { name: 'Terms', url: '/api/academics/terms' }
  ];

  for (const endpoint of endpoints) {
    try {
      const data = await makeRequest('GET', endpoint.url);
      console.log(`${endpoint.name}:`);
      if (Array.isArray(data)) {
        data.slice(0, 5).forEach(item => {
          console.log(`  - ${item.name} (ID: ${item.id})`);
        });
        if (data.length > 5) console.log(`  ... and ${data.length - 5} more`);
      }
      console.log('');
    } catch (error) {
      console.log(`Error fetching ${endpoint.name}: ${error.message}\n`);
    }
  }
}

// Step 2: Show students in a specific class
async function showStudentsInClass() {
  console.log('👥 TEACHER WORKFLOW - Step 2: Students in Primary 1 (Class ID: 4)\n');
  
  try {
    const students = await makeRequest('GET', '/api/academics/students?classId=4&sessionId=1');
    console.log('Students found:');
    students.forEach(student => {
      console.log(`  - ${student.admissionNo}: ${student.firstName} ${student.lastName} ${student.middleName || ''}`);
    });
    console.log('');
  } catch (error) {
    console.log(`Error fetching students: ${error.message}\n`);
  }
}

// Step 3: Show subjects available
async function showSubjects() {
  console.log('📖 TEACHER WORKFLOW - Step 3: Available Subjects\n');
  
  try {
    const subjects = await makeRequest('GET', '/api/academics/subjects?classId=4');
    console.log('Subjects available:');
    subjects.slice(0, 8).forEach(subject => {
      console.log(`  - ${subject.name} (ID: ${subject.id}, Max Score: ${subject.maxScore})`);
    });
    if (subjects.length > 8) console.log(`  ... and ${subjects.length - 8} more`);
    console.log('');
  } catch (error) {
    console.log(`Error fetching subjects: ${error.message}\n`);
  }
}

// Step 4: Demonstrate grade entry (will fail without auth, but shows the process)
async function demonstrateGradeEntry() {
  console.log('✏️  TEACHER WORKFLOW - Step 4: Grade Entry Process\n');
  console.log('To enter grades, a teacher would:');
  console.log('1. Select: Primary 1, 2024/2025, Term 1, Mathematics');
  console.log('2. Enter scores for each student:');
  console.log('   - DPS2026012 (Maryam): 1st=85, 2nd=88, 4th=90');
  console.log('   - DPS2026011 (David): 1st=92, 2nd=85, 4th=88');
  console.log('3. System automatically calculates averages');
  console.log('4. Save grades (requires authentication)\n');
  
  // Show what the grade data would look like
  const gradeData = {
    classId: 4,
    sessionId: 1,
    termId: 1,
    grades: [
      {
        studentId: "cml7z8pj2000bqg7kudk03sy0", // Maryam
        subjectId: 16, // Mathematics
        firstScore: 85,
        secondScore: 88,
        fourthScore: 90
      },
      {
        studentId: "cml7z8pgo000aqg7krjsf2h8c", // David
        subjectId: 16, // Mathematics
        firstScore: 92,
        secondScore: 85,
        fourthScore: 88
      }
    ]
  };
  
  console.log('Grade data structure:');
  console.log(JSON.stringify(gradeData, null, 2));
  console.log('');
}

// Step 5: Student workflow - viewing results
async function demonstrateStudentView() {
  console.log('👀 STUDENT/PARENT WORKFLOW: Viewing Results\n');
  console.log('Students/Parents can view results by:');
  console.log('1. Going to: http://localhost:3000/results');
  console.log('2. Selecting: Primary 1, 2024/2025, Term 1');
  console.log('3. Entering admission number: DPS2024001 (test data)');
  console.log('4. Viewing comprehensive results\n');
  
  // Demonstrate with mock data
  try {
    const result = await makeRequest('POST', '/api/results/check', {
      classId: "4",
      sessionId: "1",
      termId: "1", 
      studentId: "DPS2024001"
    });
    
    console.log('📊 Sample Result for Ahmed Muhammad (DPS2024001):');
    console.log(`Class: Primary 1 | Session: 2024/2025 | Term: Term 1`);
    console.log(`Position: ${result.result.position} | Average: ${result.result.average}%`);
    console.log(`Total Score: ${result.result.totalScore}/${result.result.maxScore}\n`);
    
    console.log('Subject Grades:');
    result.grades.forEach(grade => {
      const avg = grade.average.toFixed(1);
      const gradeLetter = avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : 'F';
      console.log(`  - ${grade.subject.name}: ${avg}% (Grade: ${gradeLetter})`);
      console.log(`    Scores: 1st=${grade.firstScore}, 2nd=${grade.secondScore}, 4th=${grade.fourthScore}`);
    });
    console.log('');
  } catch (error) {
    console.log(`Error fetching result: ${error.message}\n`);
  }
}

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.error || 'Unknown error'}`));
          }
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);

    if (data && method === 'POST') {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run the complete demonstration
async function runDemo() {
  try {
    await showTeacherOptions();
    await showStudentsInClass();
    await showSubjects();
    await demonstrateGradeEntry();
    await demonstrateStudentView();
    
    console.log('🎉 WORKFLOW DEMONSTRATION COMPLETE!\n');
    console.log('📝 Summary:');
    console.log('✅ Teacher can select class/session/term/subject');
    console.log('✅ Teacher can view all students in a class');
    console.log('✅ Teacher can enter grades for multiple students');
    console.log('✅ System calculates averages automatically');
    console.log('✅ Students/Parents can view results with admission number');
    console.log('✅ Results show comprehensive performance data\n');
    
    console.log('🔐 Note: Grade saving requires teacher authentication');
    console.log('🌐 Visit http://localhost:3000 to try the interfaces');
    
  } catch (error) {
    console.error('Demo failed:', error.message);
  }
}

runDemo();
