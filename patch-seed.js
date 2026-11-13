const fs = require('fs');

let content = fs.readFileSync('C:\\Projects\\dprideschools\\prisma\\seed-all-students.js', 'utf8');

// Replace the allStudentsData array
const newStudentsData = `const allStudentsData = [
  // DISCOVERY CLASS (Pre-Nursery)
  { fullName: 'RUQAIYYA USMAN IMAM', gender: 'Female', class: 'DISCOVERY CLASS (Pre-Nursery)', department: 'Early Years' },
  { fullName: 'ABDULMUMINI FAAIZ MUHAMMAD', gender: 'Male', class: 'DISCOVERY CLASS (Pre-Nursery)', department: 'Early Years' },

  // EXPLORERS (Nursery 1)
  { fullName: 'FATIMA MUKHTAR ALKALI', gender: 'Female', class: 'EXPLORERS (Nursery 1)', department: 'Early Years' },
  { fullName: 'FATIMA MUHAMMED BABA', gender: 'Female', class: 'EXPLORERS (Nursery 1)', department: 'Early Years' },
  { fullName: 'HAFSAT USMAN IMAM', gender: 'Female', class: 'EXPLORERS (Nursery 1)', department: 'Early Years' },
  { fullName: 'NANA AISHA SAAD', gender: 'Female', class: 'EXPLORERS (Nursery 1)', department: 'Early Years' },

  // YEAR 2
  { fullName: 'BARATA AMRULLAH', gender: 'Female', class: 'YEAR 2', department: 'Primary' },

  // YEAR 5
  { fullName: 'AISHA MUSA', gender: 'Female', class: 'YEAR 5', department: 'Primary' },
  { fullName: 'MUHAMMAD ARIF ABDALLAH', gender: 'Male', class: 'YEAR 5', department: 'Primary' },
  { fullName: 'KHADIJA USMAN IMAM', gender: 'Female', class: 'YEAR 5', department: 'Primary' },
  { fullName: 'RUQAIYA NASIRU NABAGE', gender: 'Female', class: 'YEAR 5', department: 'Primary' },
  { fullName: 'ZAINAB USMAN IMAM', gender: 'Female', class: 'YEAR 5', department: 'Primary' },

  // YEAR 9
  { fullName: 'Ali Mohammed Baba Mala', gender: 'Male', class: 'YEAR 9', department: 'Secondary' },
  { fullName: "Umm'suleim Ibrahim", gender: 'Female', class: 'YEAR 9', department: 'Secondary' },
  { fullName: "Umm'salma Auwal Usman", gender: 'Female', class: 'YEAR 9', department: 'Secondary' },
  { fullName: 'Nafisa Usman Imam', gender: 'Female', class: 'YEAR 9', department: 'Secondary' }
];
`;

// Find and replace the allStudentsData declaration
const oldDataMatch = content.match(/const allStudentsData = \[[\s\S]*?\];/);
if (oldDataMatch) {
  content = content.replace(oldDataMatch[0], newStudentsData);
  console.log('Replaced allStudentsData');
} else {
  console.log('Could not find allStudentsData pattern');
}

fs.writeFileSync('C:\\Projects\\dprideschools\\prisma\\seed-all-students.js', content);
console.log('Updated seed-all-students.js');