const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Load extracted data
const extractedData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'student-admission-data.json'), 'utf8'));

// Name mapping (same as in update-admission-numbers.js)
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
  // Load live database data
  const dbStudents = await prisma.student.findMany({
    select: { firstName: true, middleName: true, lastName: true, admissionNo: true }
  });

  console.log("=== REGISTRATION NUMBER COMPARISON ===\n");

  let needsUpdate = 0;
  let alreadyCorrect = 0;

  for (const student of extractedData) {
    const mappedName = nameMapping[student.name] || student.name;
    const nameParts = mappedName.split(' ').filter(part => part.length > 0);
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null;

    // Find matching student using same logic as update script
    let dbStudent = null;
    
    // Strategy 1: Exact match
    dbStudent = dbStudents.find(s => 
      s.firstName.toLowerCase() === firstName.toLowerCase() &&
      s.lastName.toLowerCase() === lastName.toLowerCase() &&
      (!middleName || (s.middleName && s.middleName.toLowerCase() === middleName.toLowerCase()))
    );

    // Strategy 2: Partial match for compound names
    if (!dbStudent) {
      dbStudent = dbStudents.find(s => {
        if (s.firstName.toLowerCase() !== firstName.toLowerCase()) return false;
        const dbFullName = `${s.middleName || ''} ${s.lastName}`.toLowerCase();
        const searchParts = mappedName.toLowerCase().split(' ').slice(1);
        return searchParts.every(part => dbFullName.includes(part));
      });
    }

    if (!dbStudent) {
      console.log(`❌ NOT IN DATABASE: ${student.name}`);
      console.log(`   (searched as: ${mappedName})`);
      console.log(`   Expected: ${student.currentRegNumber}\n`);
      needsUpdate++;
    } else if (dbStudent.admissionNo === student.currentRegNumber) {
      console.log(`✅ CORRECT: ${student.name} | ${dbStudent.admissionNo}`);
      alreadyCorrect++;
    } else {
      console.log(`⚠️  MISMATCH: ${student.name}`);
      console.log(`   Database:  ${dbStudent.admissionNo}`);
      console.log(`   Expected:  ${student.currentRegNumber}\n`);
      needsUpdate++;
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Total students: ${extractedData.length}`);
  console.log(`Already correct: ${alreadyCorrect}`);
  console.log(`Need update: ${needsUpdate}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
