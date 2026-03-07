const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createComprehensiveTestData() {
  try {
    console.log('🚀 Creating comprehensive test data for DPRIDE Results System...');

    // 1. Get existing data
    const classes = await prisma.class.findMany();
    const sessions = await prisma.session.findMany();
    const terms = await prisma.term.findMany();
    const subjects = await prisma.subject.findMany();

    console.log(`Found ${classes.length} classes, ${sessions.length} sessions, ${terms.length} terms, ${subjects.length} subjects`);

    // 2. Create test students for multiple classes
    const testStudents = [];
    const studentNames = [
      { firstName: 'Ahmed', lastName: 'Muhammad', middleName: 'Ibrahim' },
      { firstName: 'Fatima', lastName: 'Abubakar', middleName: 'Aisha' },
      { firstName: 'Muhammad', lastName: 'Bello', middleName: 'Yusuf' },
      { firstName: 'Aisha', lastName: 'Ibrahim', middleName: 'Mariam' },
      { firstName: 'Abdullah', lastName: 'Sani', middleName: 'Umar' },
      { firstName: 'Mariam', lastName: 'Yusuf', middleName: 'Khadija' },
      { firstName: 'Umar', lastName: 'Bello', middleName: 'Abdul' },
      { firstName: 'Khadija', lastName: 'Sani', middleName: 'Zainab' },
      { firstName: 'Abdul', lastName: 'Ibrahim', middleName: 'Musa' },
      { firstName: 'Zainab', lastName: 'Musa', middleName: 'Amina' }
    ];

    // Create students for DISCOVERY CLASS (Class ID: 2, Session ID: 1)
    for (let i = 0; i < studentNames.length; i++) {
      const student = studentNames[i];
      const admissionNo = `DPS2024${String(i + 1).padStart(3, '0')}`;
      
      const createdStudent = await prisma.student.create({
        data: {
          admissionNo,
          firstName: student.firstName,
          lastName: student.lastName,
          middleName: student.middleName,
          sex: i % 2 === 0 ? 'M' : 'F',
          classId: 2, // DISCOVERY CLASS
          sessionId: 1, // 2024/2025
        }
      });
      
      testStudents.push(createdStudent);
      console.log(`✅ Created student: ${admissionNo} - ${student.firstName} ${student.lastName}`);
    }

    // 3. Create comprehensive grades for all students
    console.log('\n📝 Creating grades for all students...');
    
    const selectedClassId = 2; // DISCOVERY CLASS
    const selectedSessionId = 1; // 2024/2025
    const selectedTermId = 1; // Term 1
    
    // Get subjects for this class
    const classSubjects = subjects.filter(subject => 
      subject.classId === null || subject.classId === selectedClassId
    );

    for (const student of testStudents) {
      for (const subject of classSubjects.slice(0, 4)) { // Limit to 4 subjects for testing
        // Generate realistic scores
        const firstScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const secondScore = Math.floor(Math.random() * 30) + 65; // 65-95
        const fourthScore = Math.floor(Math.random() * 30) + 75; // 75-100
        const average = ((firstScore + secondScore + fourthScore) / 3).toFixed(2);

        await prisma.grade.create({
          data: {
            studentId: student.id,
            subjectId: subject.id,
            classId: selectedClassId,
            termId: selectedTermId,
            sessionId: selectedSessionId,
            firstScore,
            secondScore,
            fourthScore,
            average: parseFloat(average)
          }
        });

        console.log(`📊 Created grade for ${student.admissionNo} - ${subject.name}: ${average}`);
      }
    }

    // 4. Calculate and create result summaries
    console.log('\n📈 Calculating result summaries...');
    
    for (const student of testStudents) {
      // Get all grades for this student in this term
      const studentGrades = await prisma.grade.findMany({
        where: {
          studentId: student.id,
          classId: selectedClassId,
          termId: selectedTermId,
          sessionId: selectedSessionId
        },
        include: { subject: true }
      });

      if (studentGrades.length > 0) {
        const totalScore = studentGrades.reduce((sum, grade) => sum + grade.average, 0);
        const average = (totalScore / studentGrades.length).toFixed(2);
        const maxScore = studentGrades.length * 100; // Assuming max 100 per subject
        
        // Calculate position (simplified - just based on average)
        const allStudentAverages = await prisma.grade.groupBy({
          by: ['studentId'],
          where: {
            classId: selectedClassId,
            termId: selectedTermId,
            sessionId: selectedSessionId
          },
          _avg: {
            average: true
          },
          orderBy: {
            _avg: {
              average: 'desc'
            }
          }
        });

        const position = allStudentAverages.findIndex(avg => avg.studentId === student.id) + 1;

        await prisma.result.create({
          data: {
            studentId: student.id,
            classId: selectedClassId,
            termId: selectedTermId,
            sessionId: selectedSessionId,
            position,
            average: parseFloat(average),
            totalScore: parseFloat(totalScore),
            maxScore
          }
        });

        console.log(`📋 Result for ${student.admissionNo}: Average ${average}, Position ${position}`);
      }
    }

    console.log('\n✅ Comprehensive test data created successfully!');
    console.log(`📊 Summary: ${testStudents.length} students with grades and results`);
    console.log(`🎯 Navigate to /admin/academics/grades to test the interface`);
    console.log(`🔍 Navigate to /results to test result viewing`);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createComprehensiveTestData();
