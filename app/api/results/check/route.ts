import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting for demo purposes
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  
  // Remove old requests outside the window
  const validRequests = requests.filter((timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  return true;
}

// Mock data for testing without database
const mockStudents = [
  {
    id: 'student-1',
    admissionNo: 'DPS2024001',
    firstName: 'Ahmed',
    lastName: 'Muhammad',
    middleName: '',
    sex: 'M',
    classId: 4, // Primary 1
    sessionId: 1,
    photo: '/images/students/Ahmed_Muhammad.jpg', // Specific image file
    grades: [
      { 
        subjectId: 1, 
        firstScore: 85, 
        secondScore: 88, 
        fourthScore: 90, 
        average: 87.7,
        subject: { name: 'Mathematics' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 2, 
        firstScore: 92, 
        secondScore: 85, 
        fourthScore: 88, 
        average: 88.3,
        subject: { name: 'English' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 3, 
        firstScore: 78, 
        secondScore: 82, 
        fourthScore: 85, 
        average: 81.7,
        subject: { name: 'Science' },
        term: { name: 'First Term' }
      }
    ]
  },
  {
    id: 'student-2',
    admissionNo: 'SAMPLE001',
    firstName: 'Sample',
    lastName: 'Student',
    middleName: null,
    sex: null,
    classId: 1, // Primary 1
    sessionId: 1,
    photo: null,
    grades: [
      { 
        subjectId: 1, 
        firstScore: 75, 
        secondScore: 80, 
        fourthScore: 85, 
        average: 80.0,
        subject: { name: 'Mathematics' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 2, 
        firstScore: 82, 
        secondScore: 78, 
        fourthScore: 83, 
        average: 81.0,
        subject: { name: 'English' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 3, 
        firstScore: 70, 
        secondScore: 75, 
        fourthScore: 80, 
        average: 75.0,
        subject: { name: 'Science' },
        term: { name: 'First Term' }
      }
    ],
    result: { position: 5, average: 78.7, totalScore: 236.0, maxScore: 300 }
  },
  {
    id: 'student-2',
    admissionNo: 'DPS2024002',
    firstName: 'Fatima',
    lastName: 'Abubakar',
    middleName: '',
    sex: 'F',
    classId: 4, // Primary 1
    sessionId: 1,
    photo: '/images/students/DPS2024002.jpg', // Optional photo path
    grades: [
      { 
        subjectId: 1, 
        firstScore: 90, 
        secondScore: 87, 
        fourthScore: 92, 
        average: 89.7,
        subject: { name: 'Mathematics' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 2, 
        firstScore: 85, 
        secondScore: 90, 
        fourthScore: 88, 
        average: 87.7,
        subject: { name: 'English' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 3, 
        firstScore: 88, 
        secondScore: 91, 
        fourthScore: 85, 
        average: 88.0,
        subject: { name: 'Science' },
        term: { name: 'First Term' }
      }
    ],
    result: { position: 2, average: 88.4, totalScore: 265.4, maxScore: 300 }
  },
  {
    id: 'student-3',
    admissionNo: 'DPS2026012',
    firstName: 'Maryam',
    lastName: 'Amin',
    middleName: '',
    sex: 'F',
    classId: 4, // PREPARATORY (Nursery 2) - CORRECT
    sessionId: 1,
    photo: null,
    grades: [
      { 
        subjectId: 1, 
        firstScore: 88, 
        secondScore: 85, 
        fourthScore: 90, 
        average: 87.7,
        subject: { name: 'Mathematics' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 2, 
        firstScore: 92, 
        secondScore: 89, 
        fourthScore: 94, 
        average: 91.7,
        subject: { name: 'English' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 3, 
        firstScore: 85, 
        secondScore: 87, 
        fourthScore: 88, 
        average: 86.7,
        subject: { name: 'Science' },
        term: { name: 'First Term' }
      }
    ],
    result: { position: 2, average: 88.7, totalScore: 266.0, maxScore: 300 }
  },
  {
    id: 'student-4',
    admissionNo: 'DPS2026011',
    firstName: 'David',
    lastName: 'Oloruntola',
    middleName: '',
    sex: 'M',
    classId: 4, // PREPARATORY (Nursery 2) - CORRECT
    sessionId: 1,
    photo: null,
    grades: [
      { 
        subjectId: 1, 
        firstScore: 82, 
        secondScore: 80, 
        fourthScore: 85, 
        average: 82.3,
        subject: { name: 'Mathematics' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 2, 
        firstScore: 78, 
        secondScore: 81, 
        fourthScore: 83, 
        average: 80.7,
        subject: { name: 'English' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 3, 
        firstScore: 75, 
        secondScore: 77, 
        fourthScore: 79, 
        average: 77.0,
        subject: { name: 'Science' },
        term: { name: 'First Term' }
      }
    ],
    result: { position: 4, average: 80.0, totalScore: 240.0, maxScore: 300 }
  },
  {
    id: 'student-5',
    admissionNo: 'DPS2026001',
    firstName: 'Fatima',
    lastName: 'Baba',
    middleName: '',
    sex: 'F',
    classId: 2, // DISCOVERY CLASS (Pre-Nursery)
    sessionId: 1,
    photo: null,
    grades: [
      { 
        subjectId: 1, 
        firstScore: 85, 
        secondScore: 87, 
        fourthScore: 89, 
        average: 87.0,
        subject: { name: 'Mathematics' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 2, 
        firstScore: 88, 
        secondScore: 86, 
        fourthScore: 90, 
        average: 88.0,
        subject: { name: 'English' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 3, 
        firstScore: 82, 
        secondScore: 84, 
        fourthScore: 86, 
        average: 84.0,
        subject: { name: 'Science' },
        term: { name: 'First Term' }
      }
    ],
    result: { position: 3, average: 86.3, totalScore: 259.0, maxScore: 300 }
  },
  {
    id: 'student-6',
    admissionNo: 'DPS2026035',
    firstName: 'Grace',
    lastName: 'Johnson',
    middleName: '',
    sex: 'F',
    classId: 12, // Class 12 (YEAR 8)
    sessionId: 1,
    photo: null,
    grades: [
      { 
        subjectId: 1, 
        firstScore: 88, 
        secondScore: 85, 
        fourthScore: 90, 
        average: 87.7,
        subject: { name: 'Mathematics' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 2, 
        firstScore: 92, 
        secondScore: 89, 
        fourthScore: 94, 
        average: 91.7,
        subject: { name: 'English' },
        term: { name: 'First Term' }
      },
      { 
        subjectId: 3, 
        firstScore: 85, 
        secondScore: 87, 
        fourthScore: 88, 
        average: 86.7,
        subject: { name: 'Science' },
        term: { name: 'First Term' }
      }
    ],
    result: { position: 1, average: 88.7, totalScore: 266.0, maxScore: 300 }
  }
];

const mockClasses = [
  { id: 1, name: 'Nursery 1' },
  { id: 2, name: 'Nursery 2' },
  { id: 3, name: 'Nursery 3' },
  { id: 4, name: 'Primary 1' },
  { id: 5, name: 'Primary 2' },
  { id: 6, name: 'Primary 3' },
  { id: 7, name: 'Primary 4' },
  { id: 8, name: 'Primary 5' },
  { id: 9, name: 'Primary 6' },
  { id: 10, name: 'Primary 7' },
  { id: 11, name: 'Primary 8' },
  { id: 12, name: 'YEAR 8' }
];

const mockSessions = [
  { id: 1, name: '2024/2025' },
  { id: 2, name: '2025/2026' }
];

const mockTerms = [
  { id: 1, name: 'First Term' },
  { id: 2, name: 'Second Term' },
  { id: 3, name: 'Third Term' }
];

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      const text = await request.text();
      console.log('Raw request body:', text);
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { classId, sessionId, termId, studentId } = body;

    // Validate inputs first
    if (!classId || !sessionId || !termId || !studentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add rate limiting after basic validation
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Debug logging
    console.log('Received data:', { classId, sessionId, termId, studentId });

    // Find student in mock data
    const student = mockStudents.find(s => 
      s.admissionNo.toLowerCase() === studentId.toLowerCase()
    );

    console.log('Found student:', student ? 'YES' : 'NO');

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or no results available for this term/session' },
        { status: 404 }
      );
    }

    // Get class, session, and term info
    const classInfo = mockClasses.find(c => c.id === parseInt(classId));
    const sessionInfo = mockSessions.find(s => s.id === parseInt(sessionId));
    const termInfo = mockTerms.find(t => t.id === parseInt(termId));

    console.log('Found references:', { 
      class: classInfo ? 'YES' : 'NO', 
      session: sessionInfo ? 'YES' : 'NO', 
      term: termInfo ? 'YES' : 'NO' 
    });

    if (!classInfo || !sessionInfo || !termInfo) {
      return NextResponse.json(
        { error: 'Invalid class, session, or term selected' },
        { status: 400 }
      );
    }

    const responseData = {
      student: {
        admissionNo: student.admissionNo,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        sex: student.sex,
        photo: student.photo || null // Include photo path if available
      },
      class: {
        name: classInfo.name
      },
      session: {
        name: sessionInfo.name
      },
      term: {
        name: termInfo.name
      },
      grades: student.grades.map(grade => ({
        subject: {
          name: grade.subject.name
        },
        firstScore: grade.firstScore,
        secondScore: grade.secondScore,
        fourthScore: grade.fourthScore,
        average: grade.average
      })),
      result: (() => {
        const summary =
          student.result ?? {
            position: undefined,
            average: 0,
            totalScore: 0,
            maxScore: 0,
          };

        return {
          position: summary.position,
          average: summary.average,
          totalScore: summary.totalScore,
          maxScore: summary.maxScore,
        };
      })()
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error checking result:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
