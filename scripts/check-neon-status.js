// Neon database status check
require('dotenv/config');

async function main() {
  console.log('🔍 Checking Neon database status...');
  
  try {
    // Import Prisma Client
    const { PrismaClient } = require('@prisma/client');
    
    // Create client with explicit configuration
    const prisma = new PrismaClient({
      log: ['info', 'warn', 'error'],
    });
    
    console.log('✅ Prisma Client created');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to Neon database successfully');
    
    // Test basic query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database version:', result[0].version);
    
    // Check if tables exist
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      console.log('✅ Tables in database:', tables.map(t => t.table_name).join(', '));
    } catch (error) {
      console.log('⚠️ Could not list tables:', error.message);
    }
    
    // Check if users table exists and has data
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Users table exists with ${userCount} records`);
      
      if (userCount > 0) {
        const users = await prisma.user.findMany({
          select: { email: true, createdAt: true },
          take: 5
        });
        console.log('✅ Sample users:', users.map(u => u.email));
      }
    } catch (error) {
      console.log('⚠️ Users table may not exist:', error.message);
    }
    
    console.log('🎉 Neon database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.log('💡 This might mean:');
    console.log('   - DATABASE_URL is not set correctly');
    console.log('   - Database schema is not migrated');
    console.log('   - Network connection issues');
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}

main();
