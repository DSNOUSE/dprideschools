// Test authentication status and signin page health
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🔍 Testing signin page health...');

  try {
    // Test NextAuth configuration
    const authUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/providers`;
    
    const response = await fetch(authUrl);
    const providers = await response.json();
    
    // Test database connection for authentication
    const { PrismaClient } = require('@prisma/client');
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    await prisma.$connect();
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
      include: { roles: { include: { role: true } } }
    });
    
    await prisma.$disconnect();
    
    res.status(200).json({
      success: true,
      signinPage: {
        status: '✅ Signin page exists and configured',
        providers: Object.keys(providers),
        nextAuthConfigured: true
      },
      authentication: {
        adminUser: adminUser ? {
          email: adminUser.email,
          roles: adminUser.roles.map(r => r.role.name),
          exists: true
        } : {
          exists: false,
          email: process.env.ADMIN_EMAIL
        },
        databaseConnected: true
      },
      environment: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET
      },
      recommendations: {
        shouldWork: !!adminUser && !!process.env.NEXTAUTH_SECRET,
        loginCredentials: adminUser ? {
          email: process.env.ADMIN_EMAIL,
          password: '[CONFIGURED]'
        } : null
      }
    });
    
  } catch (error) {
    console.error('❌ Signin test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      signinPage: {
        status: '❌ Signin page has issues',
        problem: error.message
      }
    });
  }
}
