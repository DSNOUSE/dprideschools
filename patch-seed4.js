const fs = require('fs');

// Patch seed-new-students-fixed.js
let content = fs.readFileSync('C:\\Projects\\dprideschools\\prisma\\seed-new-students-fixed.js', 'utf8');

// Replace the studentsData array
const newStudentsData = `const studentsData = [
  // DISCOVERY CLASS (Pre-Nursery)
  { fullName: 'RUQAIYYA USMAN IMAM', gender: 'Female' },
  { fullName: 'ABDULMUMINI FAAIZ MUHAMMAD', gender: 'Male' },

  // EXPLORERS (Nursery 1)
  { fullName: 'FATIMA MUKHTAR ALKALI', gender: 'Female' },
  { fullName: 'FATIMA MUHAMMED BABA', gender: 'Female' },
  { fullName: 'HAFSAT USMAN IMAM', gender: 'Female' },
  { fullName: 'NANA AISHA SAAD', gender: 'Female' },

  // YEAR 2
  { fullName: 'BARATA AMRULLAH', gender: 'Female' },

  // YEAR 5
  { fullName: 'AISHA MUSA', gender: 'Female' },
  { fullName: 'MUHAMMAD ARIF ABDALLAH', gender: 'Male' },
  { fullName: 'KHADIJA USMAN IMAM', gender: 'Female' },
  { fullName: 'RUQAIYA NASIRU NABAGE', gender: 'Female' },
  { fullName: 'ZAINAB USMAN IMAM', gender: 'Female' },

  // YEAR 9
  { fullName: 'Ali Mohammed Baba Mala', gender: 'Male' },
  { fullName: "Umm'suleim Ibrahim", gender: 'Female' },
  { fullName: "Umm'salma Auwal Usman", gender: 'Female' },
  { fullName: 'Nafisa Usman Imam', gender: 'Female' }
];
`;

// Find and replace the studentsData declaration
const oldDataMatch = content.match(/const studentsData = \[[\s\S]*?\];/);
if (oldDataMatch) {
  content = content.replace(oldDataMatch[0], newStudentsData);
  console.log('Replaced studentsData in seed-new-students-fixed.js');
} else {
  console.log('Could not find studentsData pattern in seed-new-students-fixed.js');
}

fs.writeFileSync('C:\\Projects\\dprideschools\\prisma\\seed-new-students-fixed.js', content);
console.log('Updated seed-new-students-fixed.js');