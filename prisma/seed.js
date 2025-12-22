// Prisma seed script to create base roles/permissions and an initial admin user
// Reads ADMIN_EMAIL and ADMIN_PASSWORD from environment variables

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const argon2 = require('argon2');

// Prisma 7 client requires an adapter when using the Node.js driver
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment variables');
  }

  // Ensure base permissions (keep minimal to start)
  const basePermissions = [
    { key: 'admin.access', label: 'Access Admin Area' },
    { key: 'manage.users', label: 'Manage Users' },
    { key: 'manage.academics', label: 'Manage Academic Data' },
  ];

  for (const p of basePermissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: { label: p.label },
      create: p,
    });
  }

  // Ensure Administrator role
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrator' },
    update: {},
    create: { name: 'Administrator', description: 'Full administrative access' },
  });

  // Link all base permissions to Administrator
  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // Create admin user if not exists
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

  // Attach Administrator role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
    update: {},
    create: { userId: user.id, roleId: adminRole.id },
  });

  console.log('Seed completed: Admin user ensured at', adminEmail);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
