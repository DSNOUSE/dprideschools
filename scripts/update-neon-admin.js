// Update admin credentials in Neon database
require('dotenv/config');
const { Pool } = require('pg');
const argon2 = require('argon2');

async function main() {
  console.log('🔐 Updating admin credentials in Neon database...');
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    const adminEmail = 'admin@dprideschools.com';
    const adminPassword = 'ILoveCatsToo123#';
    
    // Hash the password
    const passwordHash = await argon2.hash(adminPassword);
    
    // Check if admin exists
    const existingAdmin = await client.query('SELECT * FROM "User" WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length === 0) {
      // Create new admin
      await client.query(`
        INSERT INTO "User" (id, email, passwordHash, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
      `, [adminEmail, passwordHash]);
      console.log('✅ Admin user created');
    } else {
      // Update existing admin
      await client.query(`
        UPDATE "User" 
        SET passwordHash = $2, "updatedAt" = NOW()
        WHERE email = $1
      `, [adminEmail, passwordHash]);
      console.log('✅ Admin user updated');
    }
    
    // Create parent account
    const parentEmail = 'parent@dprideschools.com';
    const parentPassword = 'Parent123!';
    const parentHash = await argon2.hash(parentPassword);
    
    const existingParent = await client.query('SELECT * FROM "User" WHERE email = $1', [parentEmail]);
    
    if (existingParent.rows.length === 0) {
      await client.query(`
        INSERT INTO "User" (id, email, passwordHash, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
      `, [parentEmail, parentHash]);
      console.log('✅ Parent account created');
    } else {
      console.log('✅ Parent account already exists');
    }
    
    // Create student account
    const studentEmail = 'student@dprideschools.com';
    const studentPassword = 'Student123!';
    const studentHash = await argon2.hash(studentPassword);
    
    const existingStudent = await client.query('SELECT * FROM "User" WHERE email = $1', [studentEmail]);
    
    if (existingStudent.rows.length === 0) {
      await client.query(`
        INSERT INTO "User" (id, email, passwordHash, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
      `, [studentEmail, studentHash]);
      console.log('✅ Student account created');
    } else {
      console.log('✅ Student account already exists');
    }
    
    // Show all users
    const allUsers = await client.query('SELECT email FROM "User" ORDER BY email');
    console.log('\n✅ All users in database:');
    allUsers.rows.forEach(user => {
      console.log(`  - ${user.email}`);
    });
    
    console.log('\n🎉 Admin credentials updated successfully!');
    console.log(`📧 Admin Email: ${adminEmail}`);
    console.log(`🔑 Admin Password: ${adminPassword}`);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

main();
