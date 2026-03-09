// Check User table structure in Neon database
require('dotenv/config');
const { Pool } = require('pg');

async function main() {
  console.log('🔍 Checking User table structure in Neon database...');
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    // Get User table columns
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('✅ User table columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check existing users
    const users = await client.query('SELECT * FROM "User" LIMIT 5');
    console.log('\n✅ Existing users:');
    users.rows.forEach(user => {
      console.log(`  - Email: ${user.email}, ID: ${user.id}`);
    });
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

main();
