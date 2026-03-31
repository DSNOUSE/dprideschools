// Script to create real class teachers so their names appear on results
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use the same simple construction pattern as other local scripts
// (seed-production-robust.js uses the adapter form mainly for Vercel)
const prisma = new PrismaClient();

async function createClassTeachers() {
  try {
    console.log('🔧 Creating class teachers...');

    const teachers = [
      {
        email: 'ado.ziya.aldeen@dprideschools.com',
        name: 'Ado Ziya Aldeen',
        teacherId: 'YEAR3',
      },
      {
        email: 'peace.matthew@dprideschools.com',
        name: 'Peace Matthew',
        teacherId: 'DISCOVERY',
      },
      {
        email: 'angibi.emmanuel.danjuma@dprideschools.com',
        name: 'Angibi Emmanuel Danjuma',
        teacherId: 'YEAR1',
      },
      {
        email: 'emmanuel.asmah@dprideschools.com',
        name: 'Emmanuel Asmah',
        teacherId: 'YEAR7',
      },
      {
        email: 'patience.haruna.tanko@dprideschools.com',
        name: 'Patience Haruna Tanko',
        teacherId: 'YEAR8',
      },
    ];

    // Ensure Teacher role exists
    let teacherRole = await prisma.role.findUnique({ where: { name: 'Teacher' } });
    if (!teacherRole) {
      teacherRole = await prisma.role.create({
        data: { name: 'Teacher', description: 'Class / subject teacher' },
      });
      console.log('✅ Created Teacher role');
    }

    for (const teacherData of teachers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: teacherData.email },
      });

      if (!existingUser) {
        const passwordHash = await bcrypt.hash('Teacher123!', 10);

        const user = await prisma.user.create({
          data: {
            ...teacherData,
            passwordHash,
          },
        });

        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: teacherRole.id,
          },
        });

        console.log(`✅ Created teacher: ${teacherData.name} (${teacherData.teacherId})`);
        console.log(`   Email: ${teacherData.email}`);
        console.log('   Password: Teacher123!');
      } else {
        console.log(`ℹ️ Teacher already exists: ${teacherData.email}`);

        if (!existingUser.teacherId) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { teacherId: teacherData.teacherId },
          });
          console.log(`   Updated teacher ID -> ${teacherData.teacherId}`);
        }
      }
    }

    console.log('\n🎉 Class teachers created/updated successfully.');
    console.log('You can now use these accounts when adding general comments so their names appear on student results.');
  } catch (error) {
    console.error('❌ Error creating class teachers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createClassTeachers();

