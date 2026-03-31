// Script to create test teachers with proper roles and teacher IDs
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use environment variables for database connection
const prisma = new PrismaClient();

async function createTestTeachers() {
  try {
    console.log('🔧 Creating test teachers...');

    // Create test teachers with proper password hashing
    const teachers = [
      {
        email: 'john.smith@dprideschools.com',
        name: 'John Smith',
        teacherId: 'TCH001'
      },
      {
        email: 'sarah.johnson@dprideschools.com', 
        name: 'Sarah Johnson',
        teacherId: 'TCH002'
      },
      {
        email: 'michael.brown@dprideschools.com',
        name: 'Michael Brown', 
        teacherId: 'TCH003'
      }
    ];

    for (const teacherData of teachers) {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: teacherData.email }
      });

      if (!existingUser) {
        // Hash password
        const passwordHash = await bcrypt.hash('teacher123', 10);

        // Create user
        const user = await prisma.user.create({
          data: {
            ...teacherData,
            passwordHash
          }
        });

        // Assign Teacher role
        const teacherRole = await prisma.role.findUnique({
          where: { name: 'Teacher' }
        });

        if (teacherRole) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: teacherRole.id
            }
          });
        }

        console.log(`✅ Created teacher: ${teacherData.name} (${teacherData.teacherId})`);
        console.log(`   Email: ${teacherData.email}`);
        console.log(`   Password: teacher123`);
      } else {
        console.log(`⚠️ Teacher already exists: ${teacherData.email}`);
        
        // Update existing user with teacherId if missing
        if (!existingUser.teacherId) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { teacherId: teacherData.teacherId }
          });
          console.log(`✅ Updated teacher ID for: ${teacherData.email} -> ${teacherData.teacherId}`);
        }
      }
    }

    console.log('\n🎉 Test teachers created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Email: john.smith@dprideschools.com | Password: teacher123 | ID: TCH001');
    console.log('Email: sarah.johnson@dprideschools.com | Password: teacher123 | ID: TCH002');
    console.log('Email: michael.brown@dprideschools.com | Password: teacher123 | ID: TCH003');
    
  } catch (error) {
    console.error('❌ Error creating teachers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run script
createTestTeachers();
