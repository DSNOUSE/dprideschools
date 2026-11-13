const fs = require('fs');

// Patch seed-students-simple.js
let content = fs.readFileSync('C:\\Projects\\dprideschools\\prisma\\seed-students-simple.js', 'utf8');

// Replace the studentsData array
const newStudentsData = `const studentsData = [
  // DISCOVERY CLASS (Pre-Nursery)
  { fullName: 'RUQAIYYA USMAN IMAM', gender: 'Female', class: 'DISCOVERY CLASS (Pre-Nursery)' },
  { fullName: 'ABDULMUMINI FAAIZ MUHAMMAD', gender: 'Male', class: 'DISCOVERY CLASS (Pre-Nursery)' },

  // EXPLORERS (Nursery 1)
  { fullName: 'FATIMA MUKHTAR ALKALI', gender: 'Female', class: 'EXPLORERS (Nursery 1)' },
  { fullName: 'FATIMA MUHAMMED BABA', gender: 'Female', class: 'EXPLORERS (Nursery 1)' },
  { fullName: 'HAFSAT USMAN IMAM', gender: 'Female', class: 'EXPLORERS (Nursery 1)' },
  { fullName: 'NANA AISHA SAAD', gender: 'Female', class: 'EXPLORERS (Nursery 1)' },

  // YEAR 2
  { fullName: 'BARATA AMRULLAH', gender: 'Female', class: 'YEAR 2' },

  // YEAR 5
  { fullName: 'AISHA MUSA', gender: 'Female', class: 'YEAR 5' },
  { fullName: 'MUHAMMAD ARIF ABDALLAH', gender: 'Male', class: 'YEAR 5' },
  { fullName: 'KHADIJA USMAN IMAM', gender: 'Female', class: 'YEAR 5' },
  { fullName: 'RUQAIYA NASIRU NABAGE', gender: 'Female', class: 'YEAR 5' },
  { fullName: 'ZAINAB USMAN IMAM', gender: 'Female', class: 'YEAR 5' },

  // YEAR 9
  { fullName: 'Ali Mohammed Baba Mala', gender: 'Male', class: 'YEAR 9' },
  { fullName: "Umm'suleim Ibrahim", gender: 'Female', class: 'YEAR 9' },
  { fullName: "Umm'salma Auwal Usman", gender: 'Female', class: 'YEAR 9' },
  { fullName: 'Nafisa Usman Imam', gender: 'Female', class: 'YEAR 9' }
];
`;

// Find and replace the studentsData declaration
const oldDataMatch = content.match(/const studentsData = \[[\s\S]*?\];/);
if (oldDataMatch) {
  content = content.replace(oldDataMatch[0], newStudentsData);
  console.log('Replaced studentsData in seed-students-simple.js');
} else {
  console.log('Could not find studentsData pattern in seed-students-simple.js');
}

fs.writeFileSync('C:\\Projects\\dprideschools\\prisma\\seed-students-simple.js', content);
console.log('Updated seed-students-simple.js');