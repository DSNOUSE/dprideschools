// Simple Neon seed script
require('dotenv/config');

async function main() {
  console.log('🌱 Starting Neon database seeding...');
  
  try {
    // Create Prisma client with explicit DATABASE_URL
    const { PrismaClient } = require('@prisma/client');
    const argon2 = require('argon2');
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Neon database');

    // Check if we can read basic data
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Found ${userCount} users in database`);
    } catch (error) {
      console.log('⚠️ User table may not exist yet:', error.message);
    }

    // Create admin user if table exists
    try {
      const adminEmail = 'admin@dprideschools.com';
      const adminPassword = 'ILoveCatsToo123#';
      
      const passwordHash = await argon2.hash(adminPassword);
      
      // Check if admin exists
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
      });
      
      if (!existingAdmin) {
        await prisma.user.create({
          data: {
            email: adminEmail,
            passwordHash: passwordHash
          }
        });
        console.log('✅ Admin user created');
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (error) {
      console.log('⚠️ Could not create admin user:', error.message);
    }

    console.log('🎉 Neon database seeding completed!');
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

main();
