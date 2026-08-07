const fs = require('fs');
const path = require('path');

// Load extracted data
const extractedData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'student-admission-data.json'), 'utf8'));

// Database data from check-students.js output
const dbStudents = [
  { name: "Abdallah Arif", reg: "417/19" },
  { name: "Abdallah Rabiu", reg: "DPS2026037" },
  { name: "Abdulhamid Fatima", reg: "442/21" },
  { name: "Abdulhamid Mohammed", reg: "443/21" },
  { name: "Ahmed Abubakar", reg: "DPS2026038" },
  { name: "Ahmed Abdullahi Garba", reg: "DPS2026023" },
  { name: "Aisha Musa", reg: "432/20" },
  { name: "Aisha Muhammad", reg: "435/21" },
  { name: "Ali Mohammed B.M", reg: "DPS2026032" },
  { name: "Amina Abdulhamid", reg: "471/24" },
  { name: "Barata Amrullah", reg: "428/21" },
  { name: "Bilal Sani", reg: "475/24" },
  { name: "Bilikisu Sani Shehu", reg: "DPS2026017" },
  { name: "David Oloruntola", reg: "407/24" },
  { name: "Fatima Muhammad Baba", reg: "484/25" },
  { name: "Fatima Ibrahim", reg: "198/21" },
  { name: "Hafsat Usman Imam", reg: "492/26" },
  { name: "Hafsat Bint Abubakar", reg: "DPS2026103" },
  { name: "Hafsat Bint Abubakar", reg: "489/25" },
  { name: "Hanan Auwal", reg: "328116" },
  { name: "Hanifa Jibrin Usman", reg: "394119" },
  { name: "Hussaini Maryam", reg: "436/21" },
  { name: "Imam Usman Nafisa", reg: "346117" },
  { name: "Khadija U. Imam", reg: "426/20" },
  { name: "Maryam Faysal Amin", reg: "DPS2026012" },
  { name: "Mohammed Halima", reg: "447/21" },
  { name: "Mukhtar Salihu", reg: "480/25" },
  { name: "Nabage Ruqaiya Nasiru", reg: "444/21" },
  { name: "Nana Aisha Abubakar", reg: "DPS2026035" },
  { name: "Nana Sa'ad", reg: "485/25" },
  { name: "Noor Aliyu Maina", reg: "487/25" },
  { name: "Ramadan Ibrahim", reg: "DPS2026008" },
  { name: "Ramadan Sani Shehu", reg: "474/24" },
  { name: "Saad Fatima", reg: "39318" },
  { name: "Sanusi Musab", reg: "DPS2026039" },
  { name: "Sanusi Hafsat", reg: "29415" },
  { name: "Sheriff Aliyu Maina", reg: "488/25" },
  { name: "Umar Faruk Yahaya", reg: "DPS2026005" },
  { name: "Umm'suleim Ibrahim", reg: "33316" },
  { name: "Zaid Musa", reg: "DPS2026040" },
  { name: "Zainab U. Imam", reg: "406/19" }
];

console.log("=== REGISTRATION NUMBER COMPARISON ===\n");

let needsUpdate = 0;
let alreadyCorrect = 0;

extractedData.forEach(student => {
  const dbStudent = dbStudents.find(s => s.name === student.name || 
    s.name.replace(/\s+/g, ' ').trim() === student.name.replace(/\s+/g, ' ').trim());
  
  if (!dbStudent) {
    console.log(`❌ NOT IN DATABASE: ${student.name}`);
    console.log(`   Expected: ${student.currentRegNumber}\n`);
    needsUpdate++;
  } else if (dbStudent.reg === student.currentRegNumber) {
    console.log(`✅ CORRECT: ${student.name} | ${dbStudent.reg}`);
    alreadyCorrect++;
  } else {
    console.log(`⚠️  MISMATCH: ${student.name}`);
    console.log(`   Database:  ${dbStudent.reg}`);
    console.log(`   Expected:  ${student.currentRegNumber}\n`);
    needsUpdate++;
  }
});

console.log("\n=== SUMMARY ===");
console.log(`Total students: ${extractedData.length}`);
console.log(`Already correct: ${alreadyCorrect}`);
console.log(`Need update: ${needsUpdate}`);