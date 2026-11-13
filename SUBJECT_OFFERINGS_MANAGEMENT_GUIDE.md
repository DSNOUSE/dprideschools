# Subject Offerings Management Guide

## 📋 Overview

Subject Offerings are the **link between subjects and classes for each session**. They control:
- Which subjects are available for each class in each session
- Whether subjects are compulsory or elective
- Which students can take which subjects
- What grades teachers can record for which subjects

---

## ✅ Current Status After Fixes

### Year 9 Subject Availability
All three sessions now have the complete 13-subject curriculum:

| Session | Subjects | Status |
|---------|----------|--------|
| 2024/2025 | 13 subjects | ✅ Fixed (added all 13) |
| 2025/2026 | 13 subjects | ✅ Fixed (added 12) |
| 2026/2027 | 13 subjects | ✅ Complete |

### Available Subjects for Year 9
- Mathematics
- English
- History
- French
- Hausa
- Literature
- Business Studies
- IRK (Islamic Religious Knowledge)
- National Value (NVE)
- Pre-Vocational Studies (PVS)
- Basic & Science Technology (BST)
- Cultural & Creative Art (CCA)
- Vocabulary/Spellings

---

## 🔍 How to View Subject Offerings in Admin Dashboard

### View All Subjects in a Session
1. **Navigate to**: Admin → Academics → Sessions
2. **Click on a session** (e.g., "2026/2027")
3. **Click "Subjects"** link
4. **See**: All subjects offered in that session, with:
   - Subject name and code
   - How many classes offer it
   - How many students enrolled

### View Subjects for a Specific Class
1. **Navigate to**: Admin → Academics → Sessions
2. **Click on a session** (e.g., "2026/2027")
3. **Click "Classes"** link
4. **Click on a class** (e.g., "YEAR 9")
5. **See**: 
   - Total students enrolled
   - Number of subjects offered
   - List of all subjects for that class

---

## ⚙️ How to Manage Subject Offerings (Currently Database-Only)

### View Current Subject Offerings
To see which subjects a class has in a session, use **Prisma Studio**:

1. **Start Prisma Studio**:
   ```bash
   npx prisma studio
   ```
   (Opens http://localhost:5555)

2. **Navigate to SubjectOffering table**

3. **Filter to see Year 9's offerings**:
   - classId = 13 (Year 9)
   - sessionId = 2 (2026/2027)

### Add a New Subject to a Class (Manual)
Using Prisma Studio:
1. Go to SubjectOffering table
2. Click "Add Row"
3. Fill in:
   - subjectId: (the subject ID)
   - classId: 13 (Year 9)
   - sessionId: 2 (2026/2027)
   - isCompulsory: true
   - isActive: true

### Remove a Subject from a Class (Manual)
Using Prisma Studio:
1. Find the SubjectOffering record
2. Click delete icon
3. Confirm deletion

---

## 🚀 How Subject Offerings Affect the System

### Grade Management
- Teachers/Admins can **only record grades** for subjects that have active SubjectOffering records
- When you select: Class → Session → Term → Subject
  - The dropdown shows only subjects with active offerings for that combination

### Student Results
- Student results show **only subjects they're enrolled in** (via StudentSubject table)
- StudentSubject links to SubjectOffering records

### Data Dependencies
```
SubjectOffering (defines what's available)
    ↓
StudentSubject (links students to offerings)
    ↓
SubjectResult (stores grades for students)
    ↓
AssessmentScore (stores CA1, CA2, Exam scores)
```

---

## 🔧 Batch Operations

### Fix Subjects for All Sessions (Like We Just Did)
If you need to apply the same fix to another class:

```bash
node -r dotenv/config prisma/fix-all-sessions-subjects.mjs
```

This script:
- Gets baseline subjects from 2026/2027 session
- Applies them to all other sessions
- Ensures historical sessions have complete data

### Customize for Other Classes
You can modify the script to work with other class IDs:

1. Edit `prisma/fix-all-sessions-subjects.mjs`
2. Change `YEAR_9_CLASS_ID = 13` to another class ID
3. Run the script
4. Verify results

---

## 💡 Best Practices

### When Creating a New Session
1. **Copy subject offerings from previous session**:
   - Use the fix script as a template
   - Or manually add SubjectOffering records via Prisma Studio

2. **Verify completeness**:
   - Each class should have appropriate subjects
   - Check Grade Management dropdown shows all subjects

### When Modifying Offerings
1. **Don't delete existing offerings** if grades exist for them
   - This breaks the data chain: SubjectResult → SubjectOffering
   - Instead, set `isActive = false`

2. **Test in Grade Management**:
   - Go to Grade Management
   - Select the affected class/session/term
   - Verify subjects appear and students load

3. **Check Student Enrollment**:
   - Ensure students are enrolled in the subjects via StudentSubject
   - Otherwise students won't see those grades in results

### When Removing a Subject
1. **Check for existing grades first**:
   - Query SubjectResult table for that subject/class/session combo
   - If grades exist, don't delete the offering

2. **Soft delete approach**:
   - Set `isActive = false` instead of deleting
   - Preserves historical data
   - Subject won't show in Grade Management, but grades remain accessible

---

## 🚨 Common Issues & Solutions

### Issue: Subject Doesn't Appear in Grade Management
**Solution**: Check that:
1. SubjectOffering exists with `isActive = true`
2. Correct class, session, and term selected
3. Page is refreshed to load latest data

### Issue: Students Don't Load in Grade Management
**Solution**: Check that:
1. Enrollment records exist for that class/session
2. Students' status is ACTIVE or similar
3. At least one subject is selected

### Issue: Can't Save Grades
**Solution**: Check that:
1. At least one score is entered (CA1, CA2, or Exam)
2. Scores are within valid ranges (CA: 0-10, Exam: 0-80)
3. The subject offering exists (see above)

### Issue: Historical Grades Not Visible
**Solution**: Check that:
1. SubjectOffering exists for that session
2. SubjectResult records exist in database
3. Grade Management is queried with correct session/term filters

---

## 📊 Schema Reference

### SubjectOffering Table
```sql
-- Defines which subjects are offered in which classes for which sessions
SubjectOffering {
  id Int (PRIMARY KEY)
  subjectId Int (FOREIGN KEY → Subject)
  classId Int (FOREIGN KEY → Class)
  sessionId Int (FOREIGN KEY → Session)
  isCompulsory Boolean (default: true)
  isActive Boolean (default: true)
  
  -- Unique constraint: only one offering per (subject, class, session)
  UNIQUE(subjectId, classId, sessionId)
}
```

### Related Tables
```sql
-- Students enrolled in a subject for a session
StudentSubject {
  studentId String (FK → Student)
  offeringId Int (FK → SubjectOffering)
  isActive Boolean
  enrolledAt DateTime
}

-- Grades recorded for students
SubjectResult {
  studentId String
  subjectId Int
  classId Int
  termId Int
  sessionId Int
  firstScore (CA 1)
  secondScore (CA 2)
  fourthScore (Exam)
  totalScore
  percentage
}
```

---

## 🎯 Next Steps

1. **Test Grade Management** across all sessions:
   - Select 2024/2025 → Year 9 → First Term
   - Verify all 13 subjects appear

2. **Record test grades** for historical sessions:
   - This ensures data chain is complete

3. **Consider Admin UI**:
   - Add button to manage subject offerings directly from Admin Dashboard
   - Without needing Prisma Studio

4. **Regular audits**:
   - Check that new classes get proper subject offerings
   - Ensure no classes are left with incomplete offerings

---

## 📞 Technical Support

**For issues with subject offerings**:
1. Check the SubjectOffering table in Prisma Studio
2. Verify the UNIQUE constraint on (subjectId, classId, sessionId)
3. Check that isActive = true for offerings you want to use
4. Look at Grade Management API logs for validation errors

**To run fixes**:
```bash
# Fix all sessions to match baseline
node -r dotenv/config prisma/fix-all-sessions-subjects.mjs

# View database in GUI
npx prisma studio
```
