// Test authentication flow on Vercel
// This script can be run in Vercel logs or as a serverless function

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🔍 Testing Authentication Flow');
  console.log('================================');
  
  // Check environment
  const envCheck = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };
  
  console.log('Environment Check:', envCheck);
  
  try {
    // Test database connection
    const { PrismaClient } = require('@prisma/client');
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Check admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
      include: { roles: { include: { role: true } } }
    });
    
    if (adminUser) {
      console.log('✅ Admin user exists:', adminUser.email);
      console.log('📝 Admin roles:', adminUser.roles.map(r => r.role.name));
      
      // Test password verification
      const argon2 = require('argon2');
      const isValid = await argon2.verify(adminUser.passwordHash, process.env.ADMIN_PASSWORD);
      console.log('🔐 Password verification:', isValid ? '✅ Valid' : '❌ Invalid');
    } else {
      console.log('❌ Admin user not found');
    }
    
    await prisma.$disconnect();
    
    res.status(200).json({
      success: true,
      envCheck,
      adminUser: adminUser ? {
        email: adminUser.email,
        roles: adminUser.roles.map(r => r.role.name)
      } : null
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      envCheck 
    });
  }
}
