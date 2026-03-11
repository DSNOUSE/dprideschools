require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const argon2 = require('argon2');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function resetAdminPassword() {
  try {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@dprideschools.com' } });
    if (!admin) { console.log('Admin user not found'); return; }
    
    console.log('Found admin user, id:', admin.id);
    console.log('Current hash starts with:', admin.passwordHash?.substring(0, 20));
    
    const newHash = await argon2.hash('ILoveCatsToo123#');
    console.log('New hash starts with:', newHash.substring(0, 20));
    
    // Test the new hash immediately
    const testMatch = await argon2.verify(newHash, 'ILoveCatsToo123#');
    console.log('New hash verification test:', testMatch);
    
    // Test old hash
    const oldMatch = await argon2.verify(admin.passwordHash, 'ILoveCatsToo123#').catch(() => false);
    console.log('Old hash verification test:', oldMatch);
    
    if (!oldMatch) {
      await prisma.user.update({
        where: { email: 'admin@dprideschools.com' },
        data: { passwordHash: newHash }
      });
      console.log('✅ Admin password hash updated successfully');
    } else {
      console.log('Old hash is already valid - issue may be elsewhere');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
