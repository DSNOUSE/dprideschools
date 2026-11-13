#!/bin/bash

# API Validation Tests for Grade System Fixes
# Run these curl commands to validate API endpoints

echo "========================================="
echo "Grade System API Validation Tests"
echo "========================================="
echo ""

# Set variables
BASE_URL="http://localhost:3000"
AUTH_TOKEN="YOUR_AUTH_TOKEN_HERE"
CLASS_ID="1"
SESSION_ID="1"
TERM_ID="1"
SUBJECT_ID="1"
STUDENT_ID="STU001"

echo "❯ Test 1: FIX-001 - Subjects API Fallback"
echo "Testing: GET /api/academics/subjects with class and session"
echo "---"
curl -X GET "$BASE_URL/api/academics/subjects?classId=$CLASS_ID&sessionId=$SESSION_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

echo "❯ Test 2: FIX-003 - Students API with Subject Filter"
echo "Testing: GET /api/academics/students with subjectId parameter"
echo "---"
curl -X GET "$BASE_URL/api/academics/students?classId=$CLASS_ID&sessionId=$SESSION_ID&subjectId=$SUBJECT_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

echo "❯ Test 3: FIX-003 - Students API without Subject Filter"
echo "Testing: GET /api/academics/students (all students in class)"
echo "---"
curl -X GET "$BASE_URL/api/academics/students?classId=$CLASS_ID&sessionId=$SESSION_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

echo "❯ Test 4: FIX-004 - Validation: Valid Grades"
echo "Testing: POST /api/academics/grades with valid data"
echo "---"
curl -X POST "$BASE_URL/api/academics/grades" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"classId\": $CLASS_ID,
    \"sessionId\": $SESSION_ID,
    \"termId\": $TERM_ID,
    \"grades\": [
      {
        \"studentId\": \"$STUDENT_ID\",
        \"subjectId\": $SUBJECT_ID,
        \"firstScore\": 8,
        \"secondScore\": 9,
        \"fourthScore\": 72
      }
    ]
  }" | jq '.'
echo ""
echo ""

echo "❯ Test 5: FIX-004 - Validation: Invalid CA1 (> 10)"
echo "Testing: Should fail with validation error"
echo "---"
curl -X POST "$BASE_URL/api/academics/grades" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"classId\": $CLASS_ID,
    \"sessionId\": $SESSION_ID,
    \"termId\": $TERM_ID,
    \"grades\": [
      {
        \"studentId\": \"$STUDENT_ID\",
        \"subjectId\": $SUBJECT_ID,
        \"firstScore\": 15,
        \"secondScore\": 9,
        \"fourthScore\": 72
      }
    ]
  }" | jq '.'
echo ""
echo ""

echo "❯ Test 6: FIX-004 - Validation: Invalid Exam (> 80)"
echo "Testing: Should fail with validation error"
echo "---"
curl -X POST "$BASE_URL/api/academics/grades" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"classId\": $CLASS_ID,
    \"sessionId\": $SESSION_ID,
    \"termId\": $TERM_ID,
    \"grades\": [
      {
        \"studentId\": \"$STUDENT_ID\",
        \"subjectId\": $SUBJECT_ID,
        \"firstScore\": 8,
        \"secondScore\": 9,
        \"fourthScore\": 85
      }
    ]
  }" | jq '.'
echo ""
echo ""

echo "❯ Test 7: FIX-009 - Grades API Response with MaxScore"
echo "Testing: GET /api/academics/grades - verify maxScore calculation"
echo "---"
curl -X GET "$BASE_URL/api/academics/grades?classId=$CLASS_ID&sessionId=$SESSION_ID&termId=$TERM_ID&subjectId=$SUBJECT_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.[] | {id, firstScore, secondScore, fourthScore, average, maxScore, percentage}'
echo ""
echo ""

echo "❯ Test 8: FIX-011 - Student Results with DRAFT Status"
echo "Testing: GET /api/student-results/history - verify DRAFT grades visible"
echo "---"
curl -X GET "$BASE_URL/api/student-results/history?admissionNo=$STUDENT_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.sessions[0].terms[0] | {term, grades}'
echo ""
echo ""

echo "========================================="
echo "Manual Testing Checklist"
echo "========================================="
echo ""
echo "1. Subject Dropdown UI Test"
echo "   - Go to Admin > Academics > Grades"
echo "   - Select a class and session"
echo "   - Verify: Subject dropdown shows subject names WITHOUT '(Max: )' text"
echo ""

echo "2. Student Enrollment Filter Test"
echo "   - Select a class, session, and subject"
echo "   - Verify: Only students enrolled in that subject are shown"
echo "   - Change subject"
echo "   - Verify: Student list updates to show only those enrolled in new subject"
echo ""

echo "3. Grade Entry Validation Test"
echo "   - Try entering CA1 = 11 (should fail)"
echo "   - Try entering Exam = 85 (should fail)"
echo "   - Try entering negative scores (should fail)"
echo "   - Verify: Error messages are shown and grades not saved"
echo ""

echo "4. Assessment Breakdown Test"
echo "   - Go to Student Results portal"
echo "   - Verify: Results table shows columns for CA1 (Max 10), CA2 (Max 10), Exam (Max 80)"
echo "   - Verify: Each column shows the corresponding score or dash if not available"
echo ""

echo "5. Zero Scores Test"
echo "   - Enter grades: CA1=8, CA2=0, Exam=72"
echo "   - Verify: Average is calculated correctly including the zero"
echo "   - Verify: Term average includes this zero score"
echo ""

echo "6. Draft Grade Visibility Test"
echo "   - As admin: Create grade with status DRAFT"
echo "   - As student: Log in and check results"
echo "   - Verify: DRAFT grade is visible to student"
echo ""

echo "7. Null Score (Unranked) Test"
echo "   - Create grades for class where some students have null totalScore"
echo "   - Run position calculation"
echo "   - Verify: Null scores are not ranked (position != 1,2,3...)"
echo "   - Verify: Ranked students 1,2,3... don't skip positions"
echo ""

echo "8. Concurrent Update Test"
echo "   - Open grades page in two browser windows"
echo "   - In window 1: Edit student's grade, DON'T save yet"
echo "   - In window 2: Edit same student's grade, SAVE"
echo "   - In window 1: SAVE the grade"
echo "   - Verify: No data is lost, transaction handled correctly"
echo ""

echo "========================================="
echo "Test Results Summary"
echo "========================================="
echo ""
echo "Run these tests and verify all endpoints return valid responses"
echo "Check the student portal and admin dashboard for correct data display"
echo "Verify error messages are descriptive and helpful"
echo ""
