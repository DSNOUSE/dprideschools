# 📐 Architecture: How Subject Offerings Enable Grade Management

## System Overview

### The Challenge
Grade Management needs to show a dropdown of **which subjects are available** for a specific **class in a specific session in a specific term**. Without this data, admins can't record grades.

### The Solution: SubjectOffering Table
A single database table that defines: **"Class X offers Subject Y in Session Z"**

---

## Data Model

### Core Tables & Relationships

```
┌──────────────┐
│   Subject    │  (What subject? Math, English, History, etc.)
│  (Master)    │
├──────────────┤
│ id (PK)      │
│ name         │
│ code         │
│ isActive     │
└──────┬───────┘
       │
       │ (1-to-many)
       │
       ▼
┌──────────────────────┐
│ SubjectOffering      │  ← KEY TABLE
│ (Class-Subject Link) │
├──────────────────────┤
│ id (PK)              │
│ subjectId (FK)       │◄─ Which subject?
│ classId (FK)         │◄─ Which class?
│ sessionId (FK)       │◄─ Which session?
│ isCompulsory         │
│ isActive             │
└─────┬────────────────┘
      │
      │ (1-to-many)
      │
      ├──► to StudentSubject (enrolls students)
      │
      ├──► to TeacherSubject (assigns teachers)
      │
      ├──► to Assessment (defines CA1, CA2, Exam)
      │
      └──► to SubjectResult (stores grades)
```

---

## How Grade Recording Works

### Step 1: User Selection
```
Admin selects:
  Class: Year 9 (ID: 13)
  Session: 2026/2027 (ID: 2)
  Term: First Term (ID: 8)
  Subject: [Dropdown - where does this come from?]
```

### Step 2: Load Subjects
```
Query: SELECT * FROM SubjectOffering 
       WHERE classId = 13 
         AND sessionId = 2 
         AND isActive = true
       ORDER BY subject.name

Result: 13 rows returned (one for each subject)
```

### Step 3: Display Dropdown
```
UI shows:
  - Mathematics
  - English
  - History
  ... (10 more)
  - Vocabulary/Spellings
```

### Step 4: User Selects Subject
```
Admin selects: Mathematics (subjectId: 7)
```

### Step 5: Load Students
```
Query: SELECT DISTINCT student.* 
       FROM Enrollment e
       WHERE e.classId = 13 
         AND e.sessionId = 2
       ORDER BY student.lastName

Result: 25-30 students
```

### Step 6: Load Existing Grades
```
Query: SELECT * FROM SubjectResult sr
       WHERE sr.classId = 13
         AND sr.sessionId = 2
         AND sr.termId = 8
         AND sr.subjectId = 7

Result: Some students may have grades, others don't
```

### Step 7: Populate Form
```
Form shows:
  Student 1: CA1 [8] CA2 [7] Exam [60]
  Student 2: CA1 [ ] CA2 [ ] Exam [ ]
  Student 3: CA1 [9] CA2 [8] Exam [70]
  ... (more students)
```

### Step 8: Admin Enters/Modifies Scores
```
Admin makes changes and clicks "Save"
```

### Step 9: Validate & Save
```
Validation:
  - Check at least one score entered
  - Verify ranges: CA (0-10), Exam (0-80)
  - Check StudentSubject enrollment

Save: Insert/Update SubjectResult records
      with CA1, CA2, Exam scores
```

### Step 10: Calculate Results
```
For each student:
  - CA1 + CA2 = Continuous Assessment
  - Final Score = (CA1 + CA2)/20 * 30 + Exam/80 * 70
  - Store in SubjectResult.totalScore
  - Calculate percentage
  - Determine grade (A, B, C, etc.)
```

### Step 11: Audit & Logging
```
Log:
  - Who made the change (teacher/admin)
  - What changed (scores)
  - When it changed
  - Class, subject, term affected
```

---

## Data Dependencies

### The Chain
```
SubjectOffering (defines availability)
         ↓
    Student selects that offering
         ↓
StudentSubject (enroll student)
         ↓
    Teacher records grades
         ↓
    SubjectResult (store grades)
         ↓
AssessmentScore (CA1, CA2, Exam)
         ↓
    Calculate grade & percentage
         ↓
    Publish to Results Portal
         ↓
    Student views results
```

### Critical Path
```
MUST EXIST for Grade Management to work:
  SubjectOffering ← This is the bottleneck!
  
MUST EXIST for grades to be visible:
  SubjectOffering + StudentSubject + SubjectResult

MUST EXIST for results calculation:
  SubjectOffering + SubjectResult + AssessmentScore
```

---

## Why the Problem Occurred

### What Was Missing
Year 9 only had 1 SubjectOffering record per session:
```
SubjectOffering {
  id: 126,
  subjectId: 9,      // Vocabulary/Spellings only!
  classId: 13,       // Year 9
  sessionId: 2,      // 2026/2027
  isActive: true
}
```

### What Should Have Existed
Year 9 should have 13 SubjectOffering records:
```
SubjectOffering {
  id: 127, subjectId: 15, classId: 13, sessionId: 2  // IRK
}
SubjectOffering {
  id: 128, subjectId: 18, classId: 13, sessionId: 2  // Business Studies
}
SubjectOffering {
  id: 129, subjectId: 11, classId: 13, sessionId: 2  // English
}
... (10 more) ...
SubjectOffering {
  id: 126, subjectId: 9,  classId: 13, sessionId: 2  // Vocabulary/Spellings
}
```

### The Impact
```
With 1 offering:
  - Subject dropdown shows only 1 subject
  - Teachers can only record grades for 1 subject
  - Can't view/edit grades for other subjects
  - Historical grades inaccessible
  ❌ Grade Management broken

With 13 offerings:
  - Subject dropdown shows all 13 subjects
  - Teachers can record grades for all subjects
  - Can view/edit grades for all subjects
  - Historical grades fully accessible
  ✅ Grade Management fully functional
```

---

## How the Fix Works

### Before Fix
```
For Year 9 in 2025/2026:
  SubjectOffering COUNT = 0 (actually 1 but broken)
  Result: Query returns nothing OR just 1 subject
```

### The Fix Script
```javascript
// Pseudocode logic:
baseline = get SubjectOffering for 2026/2027 (13 records)
for each session in [2024/2025, 2025/2026]:
  existing = get SubjectOffering for that session
  missing = baseline minus existing
  for each missing subject:
    CREATE SubjectOffering with:
      subjectId = (from baseline)
      classId = 13 (Year 9)
      sessionId = (current session)
      isActive = true
```

### After Fix
```
For Year 9 in 2024/2025:
  SubjectOffering COUNT = 13 ✅
For Year 9 in 2025/2026:
  SubjectOffering COUNT = 13 ✅
For Year 9 in 2026/2027:
  SubjectOffering COUNT = 13 ✅
Result: Query returns 13 subjects for all sessions
```

---

## Architecture Best Practices

### What This Teaches Us
1. **Always have baseline data**: When creating a new session, copy offerings from previous session
2. **Enforce constraints**: UNIQUE(subjectId, classId, sessionId) prevents duplicates
3. **Use active flags**: isActive allows soft-delete, preserving grade history
4. **Transaction everything**: Grade changes must be atomic
5. **Validate relationships**: Check StudentSubject before recording grades

### Recommended Improvements
1. **Seed scripts**: Automatically create complete offerings for new sessions
2. **Admin UI**: Allow drag-and-drop subject management
3. **Validation warnings**: Warn if class has <5 subjects
4. **Bulk operations**: Copy offerings between sessions with one button
5. **Audit trail**: Log all SubjectOffering changes

---

## Query Examples

### Check if offerings exist
```sql
SELECT COUNT(*) FROM SubjectOffering 
WHERE classId = 13 AND sessionId = 2 AND isActive = true;
-- Should return 13 for Year 9
```

### List all offerings for a class
```sql
SELECT s.name, so.isCompulsory, so.isActive
FROM SubjectOffering so
JOIN Subject s ON so.subjectId = s.id
WHERE so.classId = 13 AND so.sessionId = 2
ORDER BY s.name;
```

### Find classes with incomplete offerings
```sql
SELECT c.name, COUNT(so.id) as subject_count
FROM Class c
LEFT JOIN SubjectOffering so ON c.id = so.classId 
                              AND so.sessionId = 2 
                              AND so.isActive = true
WHERE c.levelId IN (SELECT id FROM ClassLevel WHERE section = 'SECONDARY')
GROUP BY c.id
HAVING COUNT(so.id) < 5  -- Less than 5 subjects
ORDER BY subject_count;
```

### Verify data chain exists
```sql
-- For each student, check chain: Enrollment → StudentSubject → SubjectResult
SELECT e.studentId, COUNT(DISTINCT ss.id) as subject_count, 
       COUNT(DISTINCT sr.id) as grade_count
FROM Enrollment e
LEFT JOIN StudentSubject ss ON e.studentId = ss.studentId
LEFT JOIN SubjectResult sr ON e.studentId = sr.studentId
WHERE e.classId = 13 AND e.sessionId = 2
GROUP BY e.studentId;
```

---

## Troubleshooting Decision Tree

```
Subject dropdown empty?
├─ Check: SubjectOffering records exist?
│  ├─ No → Run fix script or create manually
│  └─ Yes → Check isActive = true
├─ Check: classId, sessionId correct?
│  ├─ No → Select correct class/session
│  └─ Yes → Continue
└─ Clear browser cache and reload

Students don't load?
├─ Check: Enrollment records exist?
│  └─ No → Enroll students
├─ Check: Enrollment.sessionId matches?
│  └─ No → Check session ID
└─ Refresh page

Can't save grades?
├─ Check: At least one score entered?
│  └─ No → Enter a score
├─ Check: Scores in valid range?
│  ├─ CA1-2: 0-10
│  ├─ Exam: 0-80
│  └─ If no → Fix score ranges
└─ Check: API error details?
   └─ In browser console (F12)

Grades don't persist?
├─ Check: API returned success?
│  └─ No → Check error details
├─ Check: StudentSubject enrollment exists?
│  └─ No → Enroll student in subject
└─ Refresh and reload form
```

---

## Summary

The **SubjectOffering table is the master key** that controls:
- ✅ Which subjects appear in Grade Management
- ✅ Which grades can be recorded
- ✅ Which historical grades are accessible
- ✅ System consistency across sessions

Without complete SubjectOffering records = Grade Management broken  
With complete SubjectOffering records = Grade Management fully functional

**The fix**: Ensured all sessions have complete, consistent SubjectOffering records.
