const fs = require('fs');

// Patch find-missing-students.js
let content = fs.readFileSync('C:\\Projects\\dprideschools\\scripts\\find-missing-students.js', 'utf8');

// Replace the missingStudents array with new student first names
const newMissingStudents = `// Missing students from our list (new 18-student roster first names)
const missingStudents = [
  'RUQAIYYA',
  'ABDULMUMINI',
  'FATIMA',
  'FATIMA',
  'HAFSAT',
  'NANA',
  'BARATA',
  'FATIMA',
  'HAFSAT',
  'AISHA',
  'MUHAMMAD',
  'KHADIJA',
  'RUQAIYA',
  'ZAINAB',
  'Ali',
  'Umm',
  'Umm',
  'Nafisa'
];
`;

// Find and replace the missingStudents declaration
const oldDataMatch = content.match(/const missingStudents = \[[\s\S]*?\];/);
if (oldDataMatch) {
  content = content.replace(oldDataMatch[0], newMissingStudents);
  console.log('Replaced missingStudents in find-missing-students.js');
} else {
  console.log('Could not find missingStudents pattern in find-missing-students.js');
}

fs.writeFileSync('C:\\Projects\\dprideschools\\scripts\\find-missing-students.js', content);
console.log('Updated find-missing-students.js');