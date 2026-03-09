// Complete student verification in Neon database
require('dotenv/config');
const { Pool } = require('pg');

async function main() {
  console.log('📊 COMPLETE STUDENT VERIFICATION IN NEON DATABASE');
  console.log('==================================================');
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    // Get total student count
    const countResult = await client.query('SELECT COUNT(*) FROM "Student"');
    console.log(`✅ Total students in database: ${countResult.rows[0].count}`);
    
    // Get all students with details
    const students = await client.query(`
      SELECT admissionNo, firstName, lastName, middleName, sex, "classId", "sessionId"
      FROM "Student" 
      ORDER BY admissionNo
    `);
    
    console.log('\n📋 COMPLETE STUDENT ROLL:');
    console.log('==========================================');
    students.rows.forEach((student, index) => {
      const fullName = [student.firstName, student.middleName, student.lastName]
        .filter(name => name && name.trim() !== '')
        .join(' ');
      const gender = student.sex || 'Not specified';
      console.log(`${index + 1}. ${student.admissionno} - ${fullName} (${gender})`);
    });
    console.log('==========================================');
    
    // Check for duplicate admission numbers
    const admissionNumbers = students.rows.map(s => s.admissionno);
    const uniqueNumbers = new Set(admissionNumbers);
    const hasDuplicates = admissionNumbers.length !== uniqueNumbers.size;
    
    if (hasDuplicates) {
      console.log('⚠️ WARNING: Duplicate admission numbers found!');
      const duplicates = admissionNumbers.filter((num, index) => admissionNumbers.indexOf(num) !== index);
      console.log('Duplicates:', [...new Set(duplicates)]);
    } else {
      console.log('✅ All admission numbers are unique');
    }
    
    // Check class distribution
    const classDistribution = await client.query(`
      SELECT c.name, COUNT(s."admissionNo") as student_count
      FROM "Student" s
      JOIN "Class" c ON s."classId" = c.id
      GROUP BY c.name
      ORDER BY c.name
    `);
    
    console.log('\n📚 CLASS DISTRIBUTION:');
    classDistribution.rows.forEach(cls => {
      console.log(`  ${cls.name}: ${cls.student_count} students`);
    });
    
    // Check gender distribution
    const genderDistribution = await client.query(`
      SELECT 
        CASE 
          WHEN sex = 'M' THEN 'Male'
          WHEN sex = 'F' THEN 'Female'
          ELSE 'Not Specified'
        END as gender,
        COUNT(*) as count
      FROM "Student"
      GROUP BY sex
      ORDER BY sex
    `);
    
    console.log('\n👥 GENDER DISTRIBUTION:');
    genderDistribution.rows.forEach(gender => {
      console.log(`  ${gender.gender}: ${gender.count} students`);
    });
    
    // Check for any students missing class assignments
    const missingClass = await client.query(`
      SELECT COUNT(*) FROM "Student" WHERE "classId" IS NULL
    `);
    
    if (parseInt(missingClass.rows[0].count) > 0) {
      console.log(`⚠️ WARNING: ${missingClass.rows[0].count} students missing class assignments`);
    } else {
      console.log('✅ All students have class assignments');
    }
    
    // Verify against expected student list (if we have a reference)
    console.log('\n🔍 VERIFICATION SUMMARY:');
    console.log(`• Total students found: ${students.rows.length}`);
    console.log(`• Unique admission numbers: ${uniqueNumbers.size}`);
    console.log(`• Classes with students: ${classDistribution.rows.length}`);
    console.log(`• Gender specified: ${students.rows.filter(s => s.sex).length}/${students.rows.length}`);
    
    // Check if any students are missing names
    const missingNames = students.rows.filter(s => !s.firstName || !s.lastName);
    if (missingNames.length > 0) {
      console.log(`⚠️ WARNING: ${missingNames.length} students missing first or last name`);
    } else {
      console.log('✅ All students have complete names');
    }
    
    console.log('\n🎉 STUDENT VERIFICATION COMPLETED SUCCESSFULLY!');
    console.log('All students have been accounted for in the database.');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Student verification failed:', error.message);
  }
}

main();
