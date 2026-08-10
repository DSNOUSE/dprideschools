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

// Name mapping from corrected names in JSON to actual names in database
const nameMapping = {
  'Nana Aisha Abubakar': 'Nana Aisha Abubakar',
  'Hanifa Jibrin Usman': 'Hanifa Jibrin Usman',
  'Ali Mohammed BMM': 'Ali Mohammed B.M',
  'Ummusalma Auwal Usman': 'Hanan Auwal',
  'Ummusuleim Ibrahim': "Umm'suleim Ibrahim",
  'Aisha Muhammad': 'Aisha Muhammad',
  'Imam Usman Nafisa': 'Imam Usman Nafisa',
  'Sa\'ad Fatima': 'Saad Fatima',
  'Sanusi Hafsat': 'Sanusi Hafsat',
  'Ahmad Abdullahi Garba': 'Ahmed Abdullahi Garba',
  'Abdallah Arif': 'Abdallah Arif',
  'Abdulhamid Fatima': 'Abdulhamid Fatima',
  'Hussaini Maryam': 'Hussaini Maryam',
  'Mohammed Halima': 'Mohammed Halima',
  'Abdulhamid Mohammed': 'Abdulhamid Mohammed',
  'Nabage Rugayya Nazir': 'Nabage Ruqaiya Nasiru',
  'Bilal Sani Shehu': 'Bilal Sani',
  'Aisha Musa': 'Aisha Musa',
  'Bilkisu Sani Shehu': 'Bilikisu Sani Shehu',
  'Khadija Usman Imam': 'Khadija U. Imam',
  'Zainab Usman Imam': 'Zainab U. Imam',
  'Hafsat Bint Abubakar': 'Hafsat Bint Abubakar',
  'Baraka Amrullah': 'Barata Amrullah',
  'Fatima Ibrahim': 'Fatima Ibrahim',
  'Maryam Faysal Ameen': 'Maryam Faysal Amin',
  'David Oloruntoba': 'David Oloruntola',
  'Mukhtar Salihu': 'Mukhtar Salihu',
  'Noor Aliyu Maina': 'Noor Aliyu Maina',
  'Umar Faruk Yahaya': 'Umar Faruk Yahaya',
  'Fatima Muhammad Baba': 'Fatima Muhammad Baba',
  'Nana Sa\'ad': 'Nana Sa\'ad',
  'Hafsat Usman Imam': 'Hafsat Usman Imam',
  'Amina Abdulhamid': 'Amina Abdulhamid',
  'Sheriff Aliyu Maina': 'Sheriff Aliyu Maina',
  'Ibrahim Sani Shehu': 'Ramadan Sani Shehu'
};

async function main() {
  // Load student data from JSON
  const dataPath = path.resolve(process.cwd(), 'student-admission-data.json');
  const students = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  console.log('=== CHECKING DATABASE STUDENTS ===\n');
  
  for (const studentData of students) {
    // Use mapped name if available
    const searchName = nameMapping[studentData.name] || studentData.name;
    
    const nameParts = searchName.split(' ').filter(part => part.length > 0);
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null;

    // Strategy 1: Try exact match
    let dbStudent = await prisma.student.findFirst({
      where: {
        firstName: { equals: firstName, mode: 'insensitive' },
        lastName: { equals: lastName, mode: 'insensitive' },
        ...(middleName && { middleName: { equals: middleName, mode: 'insensitive' } })
      }
    });

    if (!dbStudent) {
      // Try partial match
      const allMatches = await prisma.student.findMany({
        where: {
          firstName: { equals: firstName, mode: 'insensitive' }
        }
      });
      
      const searchParts = searchName.toLowerCase().split(' ').slice(1);
      dbStudent = allMatches.find(s => {
        const dbName = `${s.firstName} ${s.middleName || ''} ${s.lastName}`.toLowerCase();
        return searchParts.every(part => dbName.includes(part));
      });
    }

    if (dbStudent) {
      const fullName = `${dbStudent.firstName} ${dbStudent.middleName || ''} ${dbStudent.lastName}`;
      const matchStatus = dbStudent.admissionNo === studentData.currentRegNumber ? '✓' : '✗';
      console.log(`${matchStatus} ${studentData.name} | DB: "${fullName}" | Reg: ${dbStudent.admissionNo} | Expected: ${studentData.currentRegNumber}`);
    } else {
      console.log(`⚠ ${studentData.name} | NOT FOUND`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});