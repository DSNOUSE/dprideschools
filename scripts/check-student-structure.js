// Check Student table structure in Neon database
require('dotenv/config');
const { Pool } = require('pg');

async function main() {
  console.log('🔍 Checking Student table structure in Neon database...');
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    // Get Student table columns
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Student' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Student table columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Get total student count
    const countResult = await client.query('SELECT COUNT(*) FROM "Student"');
    console.log(`\n✅ Total students in database: ${countResult.rows[0].count}`);
    
    // Get all students with correct column names
    const students = await client.query(`
      SELECT * FROM "Student" 
      ORDER BY id
      LIMIT 10
    `);
    
    console.log('\n📋 Sample Students:');
    students.rows.forEach((student, index) => {
      console.log(`${index + 1}. ID: ${student.id}`);
      Object.keys(student).forEach(key => {
        if (key !== 'id') {
          console.log(`   ${key}: ${student[key]}`);
        }
      });
      console.log('');
    });
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

main();
