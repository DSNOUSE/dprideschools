// Simple database connection test
require('dotenv/config');
const { Pool } = require('pg');

async function main() {
  console.log('🔍 Testing Neon database connection...');
  
  try {
    // Create connection pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ Connection pool created');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to Neon database');
    
    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('✅ Database version:', result.rows[0].version);
    
    // Check if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('✅ Tables in database:', tables.rows.map(t => t.table_name).join(', '));
    
    // Check if users table exists
    const userTableExists = tables.rows.some(t => t.table_name === 'users');
    if (userTableExists) {
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`✅ Users table exists with ${userCount.rows[0].count} records`);
      
      if (parseInt(userCount.rows[0].count) > 0) {
        const users = await client.query('SELECT email, created_at FROM users LIMIT 5');
        console.log('✅ Sample users:', users.rows.map(u => u.email));
      }
    } else {
      console.log('⚠️ Users table does not exist - need to run migrations');
    }
    
    console.log('🎉 Neon database connection test completed!');
    
    // Release connection
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

main();
