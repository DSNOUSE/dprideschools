const fs = require('fs');

const students = [
  { sn: 1, classKey: "DISCOVERY", name: "RUQAIYYA USMAN IMAM", sex: "Female", reg: "493/26" },
  { sn: 2, classKey: "DISCOVERY", name: "ABDULMUMINI FAAIZ MUHAMMAD", sex: "Male", reg: "494/26" },
  { sn: 3, classKey: "EXPLORERS", name: "FATIMA MUKHTAR ALKALI", sex: "Female", reg: "495/26" },
  { sn: 4, classKey: "EXPLORERS", name: "FATIMA MUHAMMED BABA", sex: "Female", reg: "496/26" },
  { sn: 5, classKey: "EXPLORERS", name: "HAFSAT USMAN IMAM", sex: "Female", reg: "497/26" },
  { sn: 6, classKey: "EXPLORERS", name: "NANA AISHA SAAD", sex: "Female", reg: "498/26" },
  { sn: 7, classKey: "YEAR 2", name: "BARATA AMRULLAH", sex: "Female", reg: "499/26" },
  { sn: 8, classKey: "YEAR 2", name: "FATIMA IBRAHIM", sex: "Female", reg: "500/26" },
  { sn: 9, classKey: "YEAR 2", name: "HAFSAT BINT ABUBAKAR", sex: "Female", reg: "501/26" },
  { sn: 10, classKey: "YEAR 5", name: "AISHA MUSA", sex: "Female", reg: "502/26" },
  { sn: 11, classKey: "YEAR 5", name: "MUHAMMAD ARIF ABDALLAH", sex: "Male", reg: "503/26" },
  { sn: 12, classKey: "YEAR 5", name: "KHADIJA USMAN IMAM", sex: "Female", reg: "504/26" },
  { sn: 13, classKey: "YEAR 5", name: "RUQAIYA NASIRU NABAGE", sex: "Female", reg: "505/26" },
  { sn: 14, classKey: "YEAR 5", name: "ZAINAB USMAN IMAM", sex: "Female", reg: "506/26" },
  { sn: 15, classKey: "YEAR 9", name: "Ali Mohammed Baba Mala", sex: "Male", reg: "507/26" },
  { sn: 16, classKey: "YEAR 9", name: "Umm'suleim Ibrahim", sex: "Female", reg: "508/26" },
  { sn: 17, classKey: "YEAR 9", name: "Umm'salma Auwal Usman", sex: "Female", reg: "509/26" },
  { sn: 18, classKey: "YEAR 9", name: "Nafisa Usman Imam", sex: "Female", reg: "510/26" }
];

const json = JSON.stringify(students, null, 2);
fs.writeFileSync('C:\\Projects\\dprideschools\\student-admission-data.json', json + '\n');
console.log('Updated student-admission-data.json with', students.length, 'students');