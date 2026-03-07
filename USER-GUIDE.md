# DPRIDE School Result System - User Guide

## 🎯 Quick Start Guide

### 👨‍🏫 For Teachers: How to Input Results

#### **Step 1: Login**
1. Go to: http://localhost:3000/signin
2. Enter your credentials:
   - **Email**: `dsnousee@gmail.com`
   - **Password**: `Dsnouse2025`

#### **Step 2: Navigate to Grade Management**
1. After login, go to: http://localhost:3000/admin/academics/grades
2. You'll see the grade entry interface

#### **Step 3: Select Class Details**
Use the dropdown menus to select:
- **Class**: Choose from available classes (e.g., "Primary 1")
- **Session**: Select academic year (e.g., "2024/2025")
- **Term**: Choose term (e.g., "Term 1")
- **Subject**: Select subject (e.g., "Mathematics")

#### **Step 4: Enter Grades**
The system will display all students in the selected class. For each student:
- **1st Score**: Enter first assessment score (0-100)
- **2nd Score**: Enter second assessment score (0-100)
- **4th Score**: Enter final assessment score (0-100)
- **Average**: Automatically calculated by system

#### **Step 5: Save Grades**
1. Click "Save Grades" button
2. System validates all entries
3. Grades are saved and result summaries are updated automatically

---

### 👨‍🎓 For Students/Parents: How to View Results

#### **Step 1: Login**
1. Go to: http://localhost:3000/signin
2. **Students**: Use admission number as both username and password
   - Example: Username `DPS2024001`, Password `DPS2024001`
3. **Parents**: Use email and password
   - Example: Email `parent1@dprideschools.com`, Password `Password123!`

#### **Step 2: Go to Results Page**
1. After login, navigate to: http://localhost:3000/results
2. Or click "Results" in the navigation menu

#### **Step 3: Search for Results**
Fill in the search form:
- **Select Class**: Choose your class (e.g., "Primary 1")
- **Select Session**: Choose academic year (e.g., "2024/2025")
- **Select Term**: Choose term (e.g., "Term 1")
- **Student ID**: Enter admission number (e.g., "DPS2024001")

#### **Step 4: View Results**
Click "Search Result" to see:
- **Student Information**: Name, admission number, class, photo
- **Performance Summary**: Average, total score, position in class
- **Subject Grades**: Detailed scores for each subject
- **Grade Analysis**: Color-coded grades (A=Green, B=Blue, etc.)

---

## 📊 Interface Screenshots & Descriptions

### **Teacher Grade Entry Interface**
```
┌─────────────────────────────────────────────────────────────┐
│ Grade Management                                            │
│ Enter and manage student grades for different subjects      │
├─────────────────────────────────────────────────────────────┤
│ Class: [Primary 1 ▼]  Session: [2024/2025 ▼]              │
│ Term: [Term 1 ▼]    Subject: [Mathematics ▼]               │
├─────────────────────────────────────────────────────────────┤
│ Admission No   Student Name        1st  2nd  4th  Average   │
│ DPS2026012      Maryam Amin        85   88   90   87.7     │
│ DPS2026011      David Oloruntola   92   85   88   88.3     │
├─────────────────────────────────────────────────────────────┤
│                                    [Save Grades]           │
└─────────────────────────────────────────────────────────────┘
```

### **Student Result Viewing Interface**
```
┌─────────────────────────────────────────────────────────────┐
│ Student Results Dashboard                                   │
├─────────────────────────────────────────────────────────────┤
│ [📷 Photo]  Ahmed Muhammad DPS2024001                       │
│             Class: Primary 1 | Session: 2024/2025           │
│             Term: Term 1 | Gender: M                        │
├─────────────────────────────────────────────────────────────┤
│ 📈 Average: 85.9  🏆 Total: 257.7  📚 Max: 300  🥇 Pos: 3  │
├─────────────────────────────────────────────────────────────┤
│ Subject Results                            Teacher's Comment │
│ ┌─────────────────────────┐              ┌─────────────────┐ │
│ │ Mathematics  87.7% [A]  │              │ No comment yet │ │
│ │ 1st:85  2nd:88  4th:90 │              │                 │ │
│ │ ████████████████████ 87%│              │ [Open Teacher  │ │
│ └─────────────────────────┘              │ Panel]         │ │
│ │ English       88.3% [A]  │              │                 │ │
│ │ 1st:92  2nd:85  4th:88 │              └─────────────────┘ │
│ │ ████████████████████ 88%│                                │ │
│ └─────────────────────────┘                                │ │
│ │ Science      81.7% [A]  │                                │ │
│ │ 1st:78  2nd:82  4th:85 │                                │ │
│ │ ████████████████████ 82%│                                │ │
│ └─────────────────────────┘                                │ │
├─────────────────────────────────────────────────────────────┤
│ [Logout] [Check Another Result]                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Details

### **User Types & Credentials**

#### **Administrators/Teachers**
- **Email**: `dsnousee@gmail.com`
- **Password**: `Dsnouse2025`
- **Access**: Full system access, grade entry, student management

#### **Students**
- **Username**: Admission number (e.g., `DPS2024001`)
- **Password**: Same as admission number
- **Access**: View own results only

#### **Parents**
- **Email**: `parent1@dprideschools.com` (through `parent5@dprideschools.com`)
- **Password**: `Password123!`
- **Access**: View linked students' results

---

## 📱 Mobile Usage

The system is fully responsive and works on:
- ✅ Desktop computers
- ✅ Tablets (iPad, Android tablets)
- ✅ Mobile phones (iPhone, Android)

Simply use the same URLs and login process on any device.

---

## ⚡ Quick Tips

### **For Teachers**
- 📝 Save frequently to avoid losing data
- 🔍 Double-check scores before saving
- 📊 Use the automatic average calculation
- 🔐 Always log out when finished

### **For Students/Parents**
- 🔑 Keep your login credentials secure
- 📸 Take screenshots of results for personal records
- 📧 Contact school for any discrepancies
- 📱 Bookmark the results page for quick access

---

## 🆘 Troubleshooting

### **Common Issues**

#### **Can't Login**
- Check credentials are correct
- Ensure caps lock is off
- Try refreshing the page

#### **Grades Not Saving**
- Ensure all required fields are filled
- Check internet connection
- Verify you have teacher/admin access

#### **Results Not Showing**
- Verify admission number is correct
- Check class/session/term selections
- Ensure results have been entered by teacher

#### **System Slow**
- Check internet connection
- Try refreshing the page
- Contact IT support if persistent

---

## 📞 Support

For technical support or questions:
- 📧 Email: support@dprideschools.com
- 📞 Phone: [School phone number]
- 📍 Visit: IT Department at school

---

*Last Updated: March 5, 2026*  
*System Version: 1.0*
