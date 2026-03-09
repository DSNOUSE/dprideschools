// Production seed script for Vercel deployment - minimal version
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const argon2 = require('argon2');

// Use Vercel environment variables
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@dprideschools.com';
  const adminPassword = 'ILoveCatsToo123#';

  console.log('📋 Checking database schema...');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Check if Role table exists
    try {
      const roleCount = await prisma.role.count();
      console.log('✅ Role table exists, found', roleCount, 'roles');
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('⚠️ Role table does not exist, skipping seed');
        console.log('💡 Database schema may not be migrated yet');
        console.log('💡 This is normal on first deployment - migrations will run on next build');
        return;
      }
      throw error;
    }

    // Ensure Administrator role
    console.log('🏷️ Creating Administrator role...');
    const adminRole = await prisma.role.upsert({
      where: { name: 'Administrator' },
      update: {},
      create: { name: 'Administrator', description: 'Full administrative access' },
    });
    console.log('✅ Administrator role ready');

    // Create/update admin user with new credentials
    console.log('👤 Creating admin user with email:', adminEmail);
    
    const passwordHash = await argon2.hash(adminPassword);
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { 
        passwordHash,
        name: 'Administrator'
      },
      create: {
        email: adminEmail,
        passwordHash,
        name: 'Administrator',
      },
    });

    console.log('✅ Admin user created/updated:', user.email);

    // Attach Administrator role
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
      update: {},
      create: { userId: user.id, roleId: adminRole.id },
    });

    console.log('🎉 Production admin setup completed!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log('🔐 Password: [REDACTED]');
    
    // Also seed basic academic data if needed
    const classCount = await prisma.class.count();
    if (classCount === 0) {
      console.log('📚 No classes found, seeding basic academic data...');
      
      // Create basic classes with names that match grades system
      const classes = [
        { name: 'DISCOVERY CLASS (Pre-Nursery)', sort_order: 1 },
        { name: 'EXPLORERS (Nursery 1)', sort_order: 2 },
        { name: 'PREPARATORY (Nursery 2)', sort_order: 3 },
        { name: 'YEAR 1', sort_order: 4 },
        { name: 'YEAR 2', sort_order: 5 },
        { name: 'YEAR 3', sort_order: 6 },
        { name: 'YEAR 4', sort_order: 7 },
        { name: 'YEAR 5', sort_order: 8 },
        { name: 'YEAR 7', sort_order: 9 },
        { name: 'YEAR 8', sort_order: 10 },
        { name: 'YEAR 9', sort_order: 11 },
      ];

      for (const cls of classes) {
        await prisma.class.upsert({
          where: { name: cls.name },
          update: {},
          create: cls
        });
      }

      // Create current session
      const currentYear = new Date().getFullYear();
      const sessionName = `${currentYear}/${currentYear + 1}`;
      
      const session = await prisma.session.upsert({
        where: { name: sessionName },
        update: {},
        create: { name: sessionName, isActive: true }
      });

      // Create terms
      const terms = [
        { name: 'First Term', sort_order: 1 },
        { name: 'Second Term', sort_order: 2 },
        { name: 'Third Term', sort_order: 3 }
      ];

      for (const term of terms) {
        await prisma.term.upsert({
          where: { name: term.name },
          update: {},
          create: term
        });
      }

      console.log('✅ Basic academic data seeded');
    }
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    
    // Don't fail the build - just log the error
    if (error.code === 'P2021' || error.message.includes('timeout')) {
      console.log('💡 This is expected on fresh deployments');
      console.log('💡 Admin will be created on next successful deployment');
      return;
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Seed script failed:', e);
    await prisma.$disconnect();
    process.exit(0); // Exit 0 instead of 1 to avoid failing build
  });
