// Check all students in Neon database
require('dotenv/config');
const { Pool } = require('pg');

async function main() {
  console.log('📊 Checking all students in Neon database...');
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    // Get total student count
    const countResult = await client.query('SELECT COUNT(*) FROM "Student"');
    console.log(`✅ Total students in database: ${countResult.rows[0].count}`);
    
    // Get all students with details
    const students = await client.query(`
      SELECT admissionNo, fullName, gender, "classId", "sessionId"
      FROM "Student" 
      ORDER BY admissionNo
    `);
    
    console.log('\n📋 Complete Student List:');
    console.log('==========================================');
    students.rows.forEach((student, index) => {
      console.log(`${index + 1}. ${student.admissionno} - ${student.fullname} (${student.gender})`);
    });
    console.log('==========================================');
    
    // Check for any missing admission numbers
    const admissionNumbers = students.rows.map(s => s.admissionno);
    const hasDuplicates = admissionNumbers.length !== new Set(admissionNumbers).length;
    if (hasDuplicates) {
      console.log('⚠️ WARNING: Duplicate admission numbers found!');
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
    
    console.log('\n📚 Class Distribution:');
    classDistribution.rows.forEach(cls => {
      console.log(`  ${cls.name}: ${cls.student_count} students`);
    });
    
    // Check if any students are missing class assignments
    const missingClass = await client.query(`
      SELECT COUNT(*) FROM "Student" WHERE "classId" IS NULL
    `);
    
    if (parseInt(missingClass.rows[0].count) > 0) {
      console.log(`⚠️ WARNING: ${missingClass.rows[0].count} students missing class assignments`);
    } else {
      console.log('✅ All students have class assignments');
    }
    
    console.log('\n🎉 Student verification completed!');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Student check failed:', error.message);
  }
}

main();
