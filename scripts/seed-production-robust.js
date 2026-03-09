// Production seed script for Vercel deployment with better error handling
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const argon2 = require('argon2');

// Use Vercel environment variables
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('⚠️ Missing ADMIN_EMAIL or ADMIN_PASSWORD, skipping seed');
    return;
  }

  console.log('🔧 Creating admin user for production...');

  try {
    // First, check if the database schema is ready
    console.log('📋 Checking database schema...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Check if Role table exists
    try {
      await prisma.role.count();
      console.log('✅ Role table exists');
    } catch (error) {
      console.log('❌ Role table does not exist, schema needs migration');
      console.log('💡 Make sure migrations are applied before seeding');
      return;
    }

    // Ensure Administrator role
    console.log('🏷️ Creating Administrator role...');
    const adminRole = await prisma.role.upsert({
      where: { name: 'Administrator' },
      update: {},
      create: { name: 'Administrator', description: 'Full administrative access' },
    });

    console.log('✅ Administrator role ensured:', adminRole.name);

    // Create admin user if not exists
    console.log('👤 Creating admin user...');
    const passwordHash = await argon2.hash(adminPassword);

    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash },
      create: {
        email: adminEmail,
        passwordHash,
        name: 'Administrator',
      },
    });

    console.log('✅ Admin user created/updated:', user.email);

    // Attach Administrator role
    console.log('🔗 Attaching role to user...');
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
      update: {},
      create: { userId: user.id, roleId: adminRole.id },
    });

    console.log('🎉 Production admin user setup completed successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log('🔐 Password: [REDACTED]');
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    
    if (error.code === 'P2021') {
      console.log('💡 This usually means the database schema is not migrated.');
      console.log('💡 Please ensure migrations are applied before seeding.');
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
    process.exit(1);
  });
