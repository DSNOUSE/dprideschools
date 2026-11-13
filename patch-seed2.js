const fs = require('fs');

// Patch seed-new-students.js
let content = fs.readFileSync('C:\\Projects\\dprideschools\\prisma\\seed-new-students.js', 'utf8');

// Replace the newStudentsData object
const newStudentsData = `
// Student data organized by class (18 students for 2026/2027)
const newStudentsData = {
  'DISCOVERY CLASS (Pre-Nursery)': [
    { fullName: 'RUQAIYYA USMAN IMAM', gender: 'Female' },
    { fullName: 'ABDULMUMINI FAAIZ MUHAMMAD', gender: 'Male' }
  ],
  'EXPLORERS (Nursery 1)': [
    { fullName: 'FATIMA MUKHTAR ALKALI', gender: 'Female' },
    { fullName: 'FATIMA MUHAMMED BABA', gender: 'Female' },
    { fullName: 'HAFSAT USMAN IMAM', gender: 'Female' },
    { fullName: 'NANA AISHA SAAD', gender: 'Female' }
  ],
  'YEAR 2': [
    { fullName: 'BARATA AMRULLAH', gender: 'Female' }
  ],
  'YEAR 5': [
    { fullName: 'AISHA MUSA', gender: 'Female' },
    { fullName: 'MUHAMMAD ARIF ABDALLAH', gender: 'Male' },
    { fullName: 'KHADIJA USMAN IMAM', gender: 'Female' },
    { fullName: 'RUQAIYA NASIRU NABAGE', gender: 'Female' },
    { fullName: 'ZAINAB USMAN IMAM', gender: 'Female' }
  ],
  'YEAR 9': [
    { fullName: 'Ali Mohammed Baba Mala', gender: 'Male' },
    { fullName: "Umm'suleim Ibrahim", gender: 'Female' },
    { fullName: "Umm'salma Auwal Usman", gender: 'Female' },
    { fullName: 'Nafisa Usman Imam', gender: 'Female' }
  ]
};
`;

// Find and replace the newStudentsData declaration
const oldDataMatch = content.match(/const newStudentsData = \{[\s\S]*?\};/);
if (oldDataMatch) {
  content = content.replace(oldDataMatch[0], newStudentsData);
  console.log('Replaced newStudentsData in seed-new-students.js');
} else {
  console.log('Could not find newStudentsData pattern in seed-new-students.js');
}

fs.writeFileSync('C:\\Projects\\dprideschools\\prisma\\seed-new-students.js', content);
console.log('Updated seed-new-students.js');