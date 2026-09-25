import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const existingScale = await prisma.gradingScale.findFirst({
    where: { isDefault: true },
  });

  if (!existingScale) {
    console.error('No default GradingScale found!');
    return;
  }

  // Create the standard bands linked to existing default scale (id: 1)
  const bands = [
    { scaleId: existingScale.id, grade: 'A', minScore: 70, maxScore: 100, remark: 'Excellent', sortOrder: 1 },
    { scaleId: existingScale.id, grade: 'B', minScore: 60, maxScore: 69.99, remark: 'Very Good', sortOrder: 2 },
    { scaleId: existingScale.id, grade: 'C', minScore: 50, maxScore: 59.99, remark: 'Good', sortOrder: 3 },
    { scaleId: existingScale.id, grade: 'D', minScore: 45, maxScore: 49.99, remark: 'Pass', sortOrder: 4 },
    { scaleId: existingScale.id, grade: 'E', minScore: 40, maxScore: 44.99, remark: 'Weak Pass', sortOrder: 5 },
    { scaleId: existingScale.id, grade: 'F', minScore: 0, maxScore: 39.99, remark: 'Fail', sortOrder: 6 },
  ];

  for (const band of bands) {
    await prisma.gradeBand.upsert({
      where: {
        scaleId_grade: { scaleId: band.scaleId, grade: band.grade },
      },
      update: band,
      create: band,
    });
  }

  console.log(`Seeded ${bands.length} grade bands for scale "${existingScale.name}" (id: ${existingScale.id})`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
