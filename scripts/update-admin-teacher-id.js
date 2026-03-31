// Simple script to update admin user with teacher ID
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();

async function updateAdminTeacherId() {
  try {
    console.log('🔧 Updating admin user with teacher ID...');

    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@dprideschools.com' }
    });

    if (adminUser) {
      // Update with teacher ID
      const updatedUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: { teacherId: 'ADMIN001' }
      });

      console.log(`✅ Updated admin user: ${updatedUser.name}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Teacher ID: ${updatedUser.teacherId}`);
    } else {
      console.log('❌ Admin user not found');
    }

    console.log('\n🎉 Admin user updated successfully!');
    console.log('\n📋 You can now test the audit system:');
    console.log('1. Log in as: admin@dprideschools.com');
    console.log('2. Record some grades');
    console.log('3. Check /admin/audit for teacher ID tracking');
    
  } catch (error) {
    console.error('❌ Error updating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run script
updateAdminTeacherId();
