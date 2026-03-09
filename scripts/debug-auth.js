// Debug script to check authentication setup on Vercel
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Use Vercel environment variables
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function debugAuth() {
  console.log('🔍 Debugging Authentication Setup');
  console.log('=====================================');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ Missing');
  console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '✅ Set' : '❌ Missing');
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Missing');
  
  console.log('\n🗄️ Database Check:');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
      include: { 
        roles: { 
          include: { role: true } 
        } 
      }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email);
      console.log('📝 Admin roles:', adminUser.roles.map(r => r.role.name));
      console.log('🆔 Admin ID:', adminUser.id);
    } else {
      console.log('❌ Admin user NOT found');
    }
    
    // Check all users
    const allUsers = await prisma.user.findMany({
      include: { 
        roles: { 
          include: { role: true } 
        } 
      }
    });
    
    console.log('\n👥 All Users in Database:');
    allUsers.forEach(user => {
      const roles = user.roles.map(r => r.role.name).join(', ') || 'No roles';
      console.log(`  - ${user.email} (${roles})`);
    });
    
    // Check roles
    const roles = await prisma.role.findMany();
    console.log('\n🏷️ Available Roles:');
    roles.forEach(role => {
      console.log(`  - ${role.name}: ${role.description}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth().catch(console.error);
