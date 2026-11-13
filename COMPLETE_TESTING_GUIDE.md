# ✅ Complete Testing Guide - Subject Offerings Across All Sessions

## 🎯 Objective
Verify that Year 9 students can have grades recorded and viewed across **all sessions** (2024/2025, 2025/2026, 2026/2027) with **consistent subject availability**.

---

## 📋 Pre-Test Checklist

- [ ] Dev server running on http://localhost:3000
- [ ] Logged in as Administrator
- [ ] Database has been fixed with all sessions' subject offerings
- [ ] You have Year 9 student credentials to test with

---

## Test 1: Subject Availability Across All Sessions ✅

### Objective
Verify that Grade Management shows **all 13 subjects** for Year 9 in every session and every term.

### Test Steps

**Session 1: 2024/2025 - First Term**
1. Navigate to Admin → Academics → Grades
2. Fill form:
   - Class: **Year 9**
   - Session: **2024/2025**
   - Term: **First Term**
3. Click Subject dropdown
4. **Expected**: See all 13 subjects listed
5. **Document**: ✅ or ❌

**Session 2: 2024/2025 - Second Term**
6. Change Term to: **Second Term**
7. Click Subject dropdown
8. **Expected**: See all 13 subjects (same list)
9. **Document**: ✅ or ❌

**Session 3: 2024/2025 - Third Term**
10. Change Term to: **Third Term**
11. Click Subject dropdown
12. **Expected**: See all 13 subjects (same list)
13. **Document**: ✅ or ❌

**Session 4: 2025/2026 - All Terms**
14. Change Session to: **2025/2026**
15. Change Term to: **First Term**
16. Click Subject dropdown
17. **Expected**: See all 13 subjects
18. Repeat for Second Term and Third Term
19. **Document**: ✅ or ❌ for each

**Session 5: 2026/2027 - All Terms**
20. Change Session to: **2026/2027**
21. Change Term to: **First Term**
22. Click Subject dropdown
23. **Expected**: See all 13 subjects
24. Repeat for Second Term and Third Term
25. **Document**: ✅ or ❌ for each

### Expected Subjects (All Sessions)
- [ ] Mathematics
- [ ] English
- [ ] History
- [ ] French
- [ ] Hausa
- [ ] Literature
- [ ] Business Studies
- [ ] IRK
- [ ] National Value (NVE)
- [ ] Pre-Vocational Studies (PVS)
- [ ] Basic & Science Technology (BST)
- [ ] Cultural & Creative Art (CCA)
- [ ] Vocabulary/Spellings

### Pass Criteria
✅ **PASS** if all 13 subjects appear in all sessions, all terms
❌ **FAIL** if any session/term shows fewer subjects

---

## Test 2: Grade Recording Across Sessions ✅

### Objective
Verify that you can record grades for Year 9 students in different sessions.

### Test Steps

**2026/2027 - Current Session**
1. Navigate to Admin → Academics → Grades
2. Select:
   - Class: **Year 9**
   - Session: **2026/2027**
   - Term: **First Term**
   - Subject: **Mathematics** (or any subject)
3. **Expected**: Student list loads
4. Enter test scores for a student:
   - CA1: 8
   - CA2: 7
   - Exam: 60
5. Click "Save Grades"
6. **Expected**: Success message "✅ Grades saved successfully!"
7. **Document**: ✅ or ❌

**2025/2026 - Previous Session**
8. Change Session to: **2025/2026**
9. Keep Term: **First Term**
10. Select Subject: **English** (or any subject)
11. **Expected**: Student list loads
12. Enter test scores for a different student
13. Click "Save Grades"
14. **Expected**: Success message appears
15. **Document**: ✅ or ❌

**2024/2025 - Historical Session**
16. Change Session to: **2024/2025**
17. Keep Term: **First Term**
18. Select Subject: **History** (or any subject)
19. **Expected**: Student list loads
20. Enter test scores for a third student
21. Click "Save Grades"
22. **Expected**: Success message appears
23. **Document**: ✅ or ❌

### Pass Criteria
✅ **PASS** if you can record grades in all three sessions
❌ **FAIL** if any session throws an error or doesn't load students

---

## Test 3: Loading Existing Grades ✅

### Objective
Verify that previously recorded grades can be loaded and edited.

### Test Steps

**Reload Grades from 2026/2027**
1. Navigate to Admin → Academics → Grades
2. Select:
   - Class: **Year 9**
   - Session: **2026/2027**
   - Term: **First Term**
   - Subject: **Mathematics**
3. **Expected**: Student list loads with scores you just entered (or existing grades)
4. **Verify**: The CA1, CA2, Exam fields show populated scores
5. **Document**: ✅ or ❌

**Reload Grades from 2025/2026**
6. Change Session to: **2025/2026**
7. Keep Term: **First Term**
8. Select Subject: **English**
9. **Expected**: Student list loads with scores you entered
10. **Verify**: Scores are visible in the form
11. **Document**: ✅ or ❌

**Reload Grades from 2024/2025**
12. Change Session to: **2024/2025**
13. Keep Term: **First Term**
14. Select Subject: **History**
15. **Expected**: Student list loads with scores you entered
16. **Verify**: Scores are visible in the form
17. **Document**: ✅ or ❌

### Pass Criteria
✅ **PASS** if you can see your recorded grades when you reload
❌ **FAIL** if any grades don't persist or don't load

---

## Test 4: Edit Existing Grades ✅

### Objective
Verify that you can modify previously recorded grades.

### Test Steps

1. Navigate to Admin → Academics → Grades
2. Select:
   - Class: **Year 9**
   - Session: **2026/2027** (use whatever session has grades)
   - Term: **First Term**
   - Subject: **Mathematics**
3. **Find a student** with existing scores
4. **Change a score** (e.g., CA1 from 8 to 9)
5. Click "Save Grades"
6. **Expected**: Success message appears
7. **Reload** the same form
8. **Expected**: The score shows as 9 (not 8)
9. **Document**: ✅ or ❌

### Pass Criteria
✅ **PASS** if you can modify and persist changes
❌ **FAIL** if changes don't save or don't persist

---

## Test 5: Subject List Consistency ✅

### Objective
Verify that the same 13 subjects are available when you switch between sessions and terms.

### Test Steps

1. Navigate to Admin → Academics → Grades
2. Record which subjects appear in the dropdown for:
   - 2024/2025 First Term
   - 2025/2026 First Term
   - 2026/2027 First Term

3. **Expected**: All three lists contain exactly the same 13 subjects

4. Now check Second Terms:
   - 2024/2025 Second Term
   - 2025/2026 Second Term
   - 2026/2027 Second Term

5. **Expected**: All three lists contain exactly the same 13 subjects

6. Now check Third Terms:
   - 2024/2025 Third Term
   - 2025/2026 Third Term
   - 2026/2027 Third Term

7. **Expected**: All three lists contain exactly the same 13 subjects

### Verification Table
Fill in which subjects appear for each combination:

| Session | First Term | Second Term | Third Term |
|---------|-----------|------------|-----------|
| 2024/2025 | 13 subjects | 13 subjects | 13 subjects |
| 2025/2026 | 13 subjects | 13 subjects | 13 subjects |
| 2026/2027 | 13 subjects | 13 subjects | 13 subjects |

### Pass Criteria
✅ **PASS** if all cells show 13 subjects consistently
❌ **FAIL** if any cell shows fewer or different subjects

---

## Test 6: Admin Dashboard Navigation ✅

### Objective
Verify that you can navigate through sessions/classes/subjects in the admin interface.

### Test Steps

1. Navigate to Admin → Academics → Sessions
2. Click on **2024/2025** session
3. **Expected**: Session details page loads
4. Click "Subjects" link
5. **Expected**: Shows all subjects offered in that session
6. **Verify**: Year 9's subjects are listed (13 subjects)
7. **Document**: ✅ or ❌

8. Go back to Sessions
9. Click on **2026/2027** session
10. Click "Classes" link
11. **Expected**: Classes list loads
12. Click on **YEAR 9** class
13. **Expected**: Class detail page shows:
    - Number of enrolled students
    - Number of offered subjects (should be 13)
    - List of all subjects

14. **Document**: ✅ or ❌

### Pass Criteria
✅ **PASS** if all navigation works and shows correct subject counts
❌ **FAIL** if pages don't load or subject counts are wrong

---

## Test 7: Student Results Portal (Verification) ✅

### Objective
Verify that students can see their grades recorded through Grade Management.

### Test Steps

1. **Get a Year 9 student's credentials**
2. **Logout** from Admin Dashboard
3. Navigate to http://localhost:3000/results
4. Login as **student** with:
   - Username: Student's admission number
   - Password: Student's admission number
5. **Expected**: Student dashboard loads
6. **Select session**: 2026/2027
7. **Expected**: Can view all subjects they're enrolled in
8. **Verify**: Grades you recorded appear (if student is enrolled in those subjects)
9. **Document**: ✅ or ❌

### Pass Criteria
✅ **PASS** if student can see recorded grades in their portal
❌ **FAIL** if grades don't appear or student can't access them

---

## 📊 Final Test Report

### Summary
Fill in your results:

| Test | Result | Notes |
|------|--------|-------|
| Test 1: Subject Availability | ✅/❌ | |
| Test 2: Grade Recording | ✅/❌ | |
| Test 3: Loading Grades | ✅/❌ | |
| Test 4: Editing Grades | ✅/❌ | |
| Test 5: Consistency | ✅/❌ | |
| Test 6: Navigation | ✅/❌ | |
| Test 7: Student Portal | ✅/❌ | |

### Overall Result
**✅ ALL TESTS PASS** - Year 9 subjects and grades work across all sessions!
OR
**⚠️  SOME ISSUES FOUND** - See notes above for details

---

## 🐛 Troubleshooting

### If Test 1 Fails (Missing Subjects)
- Problem: Dropdown doesn't show all 13 subjects
- Solution:
  - Refresh the browser (Ctrl+F5)
  - Clear browser cache
  - Check that SubjectOffering records exist in database
  - Verify the fix script ran successfully

### If Test 2 Fails (Can't Record Grades)
- Problem: Getting validation error when saving
- Solution:
  - Check that at least one score is entered
  - Verify scores are in valid ranges (CA: 0-10, Exam: 0-80)
  - Check browser console for detailed error messages
  - Try refreshing page and selecting subject again

### If Test 3 Fails (Grades Don't Load)
- Problem: Subject appears but no grades load
- Solution:
  - Check that students are enrolled for that session
  - Verify grades were actually saved (check database)
  - Try refreshing and reselecting the subject

### If Test 7 Fails (Student Can't See Grades)
- Problem: Student logs in but sees no grades
- Solution:
  - Verify student is enrolled for that session/class
  - Verify student is enrolled in those subjects (StudentSubject table)
  - Try logging in as different student to test

---

## 📝 Next Steps After Testing

1. **If ALL tests pass**:
   - System is ready for production
   - Admins can manage grades across all sessions
   - Students can view historical results

2. **If SOME tests fail**:
   - Investigate issues using troubleshooting guide
   - Check database directly with Prisma Studio
   - Look at API logs in terminal

3. **Future improvements**:
   - Add UI for managing subject offerings directly
   - Add validation warning for incomplete class configurations
   - Add export/import for subject offerings across sessions
