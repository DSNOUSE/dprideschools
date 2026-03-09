// Debug authentication credentials and database
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { PrismaClient } = require('@prisma/client');
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const argon2 = require('argon2');
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    await prisma.$connect();
    
    console.log('🔍 Checking authentication setup...');
    
    // Get environment variables (without exposing sensitive data)
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL
    };
    
    console.log('Environment check:', envCheck);
    
    // Find admin user in database
    const adminUser = await prisma.user.findUnique({
      where: { email: envCheck.ADMIN_EMAIL },
      include: { 
        roles: { include: { role: true } }
      }
    });
    
    console.log('Admin user found:', !!adminUser);
    
    let passwordMatch = false;
    let passwordTest = '';
    
    if (adminUser && process.env.ADMIN_PASSWORD) {
      try {
        // Test password verification
        passwordMatch = await argon2.verify(adminUser.passwordHash, process.env.ADMIN_PASSWORD);
        passwordTest = passwordMatch ? 'MATCHES' : 'DOES NOT MATCH';
        console.log('Password verification:', passwordTest);
      } catch (verifyError) {
        passwordTest = 'ERROR: ' + verifyError.message;
        console.log('Password verification error:', verifyError.message);
      }
    }
    
    await prisma.$disconnect();
    
    res.status(200).json({
      success: true,
      environment: envCheck,
      adminUser: adminUser ? {
        email: adminUser.email,
        name: adminUser.name,
        roles: adminUser.roles.map(r => r.role.name),
        hasPasswordHash: !!adminUser.passwordHash
      } : null,
      authentication: {
        adminUserExists: !!adminUser,
        passwordVerification: passwordTest,
        passwordMatch: passwordMatch,
        loginShouldWork: passwordMatch && !!adminUser
      },
      recommendations: {
        ifPasswordFails: [
          'Check if ADMIN_EMAIL matches database user',
          'Verify ADMIN_PASSWORD is correct',
          'Ensure password hash was created properly'
        ],
        correctCredentials: {
          email: envCheck.ADMIN_EMAIL,
          password: '[CONFIGURED]',
          useTheseCredentials: true
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Auth debug failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      recommendations: ['Check database connection', 'Verify environment variables']
    });
  }
}
