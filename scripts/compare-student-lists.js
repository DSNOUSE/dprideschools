// Compare student-admission-data.json with the user's provided list
const fs = require('fs');

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync('student-admission-data.json', 'utf8'));

// User's provided list (corrected format)
const userList = [
  { sn: 1, name: "Nana Aisha Abubakar", class: "YR 8", reg: "DPS35417", gender: "F" },
  { sn: 2, name: "Hanifa Jibrin Usman", class: "YR 8", reg: "DPS39419", gender: "F" },
  { sn: 3, name: "Ali Mohammed BMM", class: "YR 8", reg: "DPS45522", gender: "M" },
  { sn: 4, name: "Ummusalma Auwal Usman", class: "YR 8", reg: "DPS32816", gender: "F" },
  { sn: 5, name: "Ummusuleim Ibrahim", class: "YR 8", reg: "DPS33316", gender: "F" },
  { sn: 6, name: "Aisha Muhammad", class: "YR 8", reg: "DPS43521", gender: "F" },
  { sn: 7, name: "Imam Usman Nafisa", class: "YR 8", reg: "DPS34617", gender: "F" },
  { sn: 8, name: "Sa'ad Fatima", class: "YR 5", reg: "DPS39318", gender: "F" },
  { sn: 9, name: "Sanusi Hafsat", class: "YR 5", reg: "DPS29415", gender: "F" },
  { sn: 10, name: "Ahmad Abdullahi Garba", class: "YR 4", reg: "DPS48225", gender: "M" },
  { sn: 11, name: "Abdallah Arif", class: "YR 4", reg: "DPS41719", gender: "M" },
  { sn: 12, name: "Abdulhamid Fatima", class: "YR 4", reg: "DPS44221", gender: "F" },
  { sn: 13, name: "Hussaini Maryam", class: "YR 4", reg: "DPS43621", gender: "F" },
  { sn: 14, name: "Mohammed Halima", class: "YR 4", reg: "DPS44721", gender: "F" },
  { sn: 15, name: "Abdulhamid Mohammed", class: "YR 4", reg: "DPS44321", gender: "M" },
  { sn: 16, name: "Nabage Rugayya Nazir", class: "YR 4", reg: "DPS44421", gender: "F" },
  { sn: 17, name: "Bilal Sani Shehu", class: "YR 4", reg: "DPS47524", gender: "M" },
  { sn: 18, name: "Aisha Musa", class: "YR 3", reg: "DPS43220", gender: "F" },
  { sn: 19, name: "Bilkisu Sani Shehu", class: "YR 3", reg: "DPS45822", gender: "F" },
  { sn: 20, name: "Khadija Usman Imam", class: "YR 3", reg: "DPS42620", gender: "F" },
  { sn: 21, name: "Zainab Usman Imam", class: "YR 3", reg: "DPS40619", gender: "F" },
  { sn: 22, name: "Hafsat Bint Abubakar", class: "YR 1", reg: "DPS48925", gender: "F" },
  { sn: 23, name: "Baraka Amrullah", class: "YR 1", reg: "DPS43821", gender: "F" },
  { sn: 24, name: "Fatima Ibrahim", class: "YR 1", reg: "DPS45422", gender: "F" },
  { sn: 25, name: "Maryam Faysal Ameen", class: "PRE", reg: "DPS40724", gender: "F" },
  { sn: 26, name: "David Oloruntoba", class: "PRE", reg: "DPS48025", gender: "M" },
  { sn: 27, name: "Mukhtar Salihu", class: "PRE", reg: "DPS49026", gender: "M" },
  { sn: 28, name: "Noor Aliyu Maina", class: "DISC.", reg: "DPS48725", gender: "M" },
  { sn: 29, name: "Umar Faruk Yahaya", class: "DISC.", reg: "DPS48325", gender: "M" },
  { sn: 30, name: "Fatima Muhammad Baba", class: "DISC.", reg: "DPS48425", gender: "F" },
  { sn: 31, name: "Nana Sa'ad", class: "DISC.", reg: "DPS48525", gender: "F" },
  { sn: 32, name: "Hafsat Usman Imam", class: "DISC.", reg: "DPS49226", gender: "F" },
  { sn: 33, name: "Amina Abdulhamid", class: "EXPL.", reg: "DPS47124", gender: "F" },
  { sn: 34, name: "Sheriff Aliyu Maina", class: "EXPL.", reg: "DPS48825", gender: "M" },
  { sn: 35, name: "Ibrahim Sani Shehu", class: "EXPL.", reg: "DPS47424", gender: "M" }
];

console.log("=== DISCREPANCY ANALYSIS ===\n");

let differencesFound = false;

userList.forEach((userStudent, index) => {
  const jsonStudent = jsonData[index];
  
  if (!jsonStudent) {
    console.log(`❌ S/N ${userStudent.sn}: Not found in JSON file`);
    differencesFound = true;
    return;
  }

  const nameMatch = userStudent.name.toLowerCase() === jsonStudent.name.toLowerCase();
  const regMatch = userStudent.reg.toLowerCase() === jsonStudent.currentRegNumber.toLowerCase();
  
  if (!nameMatch || !regMatch) {
    differencesFound = true;
    console.log(`\nS/N ${userStudent.sn}: ${jsonStudent.name}`);
    
    if (!nameMatch) {
      console.log(`  Name Difference:`);
      console.log(`    JSON: "${jsonStudent.name}"`);
      console.log(`    User: "${userStudent.name}"`);
    }
    
    if (!regMatch) {
      console.log(`  Registration Difference:`);
      console.log(`    JSON: "${jsonStudent.currentRegNumber}"`);
      console.log(`    User: "${userStudent.reg}"`);
    }
  }
});

if (!differencesFound) {
  console.log("✓ All entries match perfectly!");
} else {
  console.log("\n=== SUMMARY ===");
  console.log("Corrections needed in student-admission-data.json");
}