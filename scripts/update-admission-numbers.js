// Script to update student admission numbers from extracted data
// Usage: node scripts/update-admission-numbers.js

const fs = require('fs');
const path = require('path');

try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      const unquoted = value.replace(/^"|"$/g, '');
      if (!process.env[key]) process.env[key] = unquoted;
    });
  }
} catch (err) {}

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Manual name mapping for database vs extracted data mismatches
const nameMapping = {
  'Nanga Aisha Abubakar': 'Nana Aisha Abubakar',
  'Hanifa Jibrin Usman': 'Hanifa Jibrin Usman',
  'Ali Muhammad Usman': 'Ali Mohammed B.M',
  'Ummalsalma Auwwal Usman': 'Hanan Auwal',
  'Ummulsulaim Ibrahim': "Umm'suleim Ibrahim",
  'Aisha Muhammad': 'Aisha Muhammad',
  'Imam Usman Nafisa': 'Imam Usman Nafisa',
  'Salad Fatima': 'Saad Fatima',
  'Sanusi Hafsat': 'Sanusi Hafsat',
  'Ahmad Abdultahi Garba': 'Ahmed Abdullahi Garba',
  'Abdullah Arif': 'Abdallah Arif',
  'Abdultahmid Fatima': 'Abdulhamid Fatima',
  'Hussaini Maryam': 'Hussaini Maryam',
  'Mohammed Halima': 'Mohammed Halima',
  'Abdultahmid Muhammad': 'Abdulhamid Mohammed',
  'Nabage Ruqaiya Nasir': 'Nabage Ruqaiya Nasiru',
  'Bilal Sani Sheku': 'Bilal Sani',
  'Aisha Musa': 'Aisha Musa',
  'Bilkisu Sani Sheku': 'Bilikisu Sani Shehu',
  'Khadija vsman Imam': 'Khadija U. Imam',
  'Zainab Usman Imam': 'Zainab U. Imam',
  'Hafsat Bint Abubakar': 'Hafsat Bint Abubakar',
  'Baratu Amrullah': 'Barata Amrullah',
  'Fatima Ibrahim': 'Fatima Ibrahim',
  'Maryam Faysal Ameen': 'Maryam Faysal Amin',
  'Davidoloruntola': 'David Oloruntola',
  'Mukhtar Salihu': 'Mukhtar Salihu',
  'Noor Aliya Maina': 'Noor Aliyu Maina',
  'Umar Faruk Yalaka': 'Umar Faruk Yahaya',
  'Fatima Muhammad Baba': 'Fatima Muhammad Baba',
  'Nana Salad': 'Nana Sa\'ad',
  'Hafsat Usman Imam': 'Hafsat Usman Imam',
  'Amina Abdutahmid': 'Amina Abdulhamid',
  'Sheriff Aliyu Maina': 'Sheriff Aliyu Maina',
  'Ibrahim Sani Sheku': 'Ramadan Sani Shehu'
};

async function main() {
  // Load student data from JSON
  const dataPath = path.resolve(process.cwd(), 'student-admission-data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('student-admission-data.json not found');
    process.exit(2);
  }

  const students = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Loaded ${students.length} students from JSON\n`);

  let updated = 0;
  let notFound = 0;
  let errors = 0;

  for (const student of students) {
    try {
      // Use mapped name if available
      const searchName = nameMapping[student.name] || student.name;
      
      // Split name into parts
      const nameParts = searchName.split(' ').filter(part => part.length > 0);
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null;

      // Strategy 1: Try exact match with middle name
      let existingStudent = await prisma.student.findFirst({
        where: {
          firstName: { equals: firstName, mode: 'insensitive' },
          lastName: { equals: lastName, mode: 'insensitive' },
          ...(middleName && { middleName: { equals: middleName, mode: 'insensitive' } })
        },
        include: { class: true }
      });

      // Strategy 2: Try matching firstName and any part of the remaining name in lastName/middleName
      if (!existingStudent) {
        const allMatches = await prisma.student.findMany({
          where: {
            firstName: { equals: firstName, mode: 'insensitive' }
          },
          include: { class: true }
        });
        
        // Find best match by checking if any of the other name parts appear in lastName or middleName
        existingStudent = allMatches.find(s => {
          const fullName = `${s.firstName} ${s.middleName || ''} ${s.lastName}`.toLowerCase();
          const searchParts = searchName.toLowerCase().split(' ').slice(1);
          return searchParts.every(part => fullName.includes(part));
        });
      }

      if (!existingStudent) {
        console.log(`  ⚠ Not found: ${student.name} (searched as: ${searchName})`);
        notFound++;
        continue;
      }

      // Update admission number
      await prisma.student.update({
        where: { id: existingStudent.id },
        data: { admissionNo: student.currentRegNumber }
      });

      console.log(`  ✓ Updated: ${student.name} (${existingStudent.class.name}) -> ${student.currentRegNumber}`);
      updated++;
    } catch (err) {
      console.error(`  ✗ Error updating ${student.name}:`, err.message);
      errors++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Not found: ${notFound}`);
  console.log(`   Errors: ${errors}`);

  await prisma.$disconnect();
  await pool.end();
}

main();
