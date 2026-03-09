// Check User table in Neon database
require('dotenv/config');
const { Pool } = require('pg');

async function main() {
  console.log('🔍 Checking User table in Neon database...');
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    // Check User table structure
    try {
      const result = await client.query('SELECT COUNT(*) FROM "User"');
      console.log('✅ User table exists with', result.rows[0].count, 'records');
      
      if (parseInt(result.rows[0].count) > 0) {
        const users = await client.query('SELECT email, created_at FROM "User" LIMIT 5');
        console.log('✅ Sample users:', users.rows.map(u => u.email));
      }
    } catch (error) {
      console.log('⚠️ User table error:', error.message);
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

main();
