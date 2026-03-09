import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    let body;
    try {
      const text = await request.text();
      body = JSON.parse(text);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { classId, sessionId, termId, studentId } = body;

    // Validate inputs first
    if (!studentId) {
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

    const admissionNo = studentId.trim();

    const parsedClassId = classId ? parseInt(classId, 10) : undefined;
    const parsedSessionId = sessionId ? parseInt(sessionId, 10) : undefined;
    const parsedTermId = termId ? parseInt(termId, 10) : undefined;

    if ((classId && Number.isNaN(parsedClassId)) || (sessionId && Number.isNaN(parsedSessionId)) || (termId && Number.isNaN(parsedTermId))) {
      return NextResponse.json(
        { error: 'Invalid class, session, or term selected' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { admissionNo: { equals: admissionNo, mode: 'insensitive' } },
      include: { class: true, session: true }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or no results available for this term/session' },
        { status: 404 }
      );
    }

    const resolvedClassId = parsedClassId ?? student.classId;
    const resolvedSessionId = parsedSessionId ?? student.sessionId;

    if (classId && resolvedClassId !== student.classId) {
      return NextResponse.json(
        { error: 'Student is not in the selected class' },
        { status: 400 }
      );
    }

    if (sessionId && resolvedSessionId !== student.sessionId) {
      return NextResponse.json(
        { error: 'Student is not in the selected session' },
        { status: 400 }
      );
    }

    let resolvedTermId: number | null = parsedTermId ?? null;

    if (!resolvedTermId) {
      const defaultTerm = await prisma.term.findFirst({ orderBy: { id: 'asc' } });
      if (!defaultTerm) {
        return NextResponse.json(
          { error: 'No academic terms are configured' },
          { status: 400 }
        );
      }
      resolvedTermId = defaultTerm.id;
    }

    const termInfo = await prisma.term.findUnique({ where: { id: resolvedTermId } });
    if (!termInfo) {
      return NextResponse.json(
        { error: 'Invalid term selected' },
        { status: 400 }
      );
    }

    const grades = await prisma.grade.findMany({
      where: {
        studentId: student.id,
        classId: resolvedClassId,
        sessionId: resolvedSessionId,
        termId: resolvedTermId
      },
      include: {
        subject: true,
        term: true
      },
      orderBy: { subject: { name: 'asc' } }
    });

    if (grades.length === 0) {
      return NextResponse.json(
        { error: 'Student not found or no results available for this term/session' },
        { status: 404 }
      );
    }

    const result = await prisma.result.findUnique({
      where: {
        studentId_classId_termId_sessionId: {
          studentId: student.id,
          classId: resolvedClassId,
          termId: resolvedTermId,
          sessionId: resolvedSessionId
        }
      }
    });

    const totalScore = grades.reduce((sum, grade) => sum + grade.average, 0);
    const average = grades.length > 0 ? totalScore / grades.length : 0;
    const maxScore = grades.length * 100;

    let position = result?.position;
    if (position === undefined || position === null) {
      const allResults = await prisma.result.findMany({
        where: {
          classId: resolvedClassId,
          termId: resolvedTermId,
          sessionId: resolvedSessionId
        },
        orderBy: { average: 'desc' }
      });

      if (allResults.length > 0) {
        position = allResults.filter((item) => item.average > average).length + 1;
      }
    }

    return NextResponse.json({
      student: {
        admissionNo: student.admissionNo,
        firstName: student.firstName,
        middleName: student.middleName || '',
        lastName: student.lastName,
        sex: student.sex || '',
        photo: null
      },
      class: {
        name: student.class.name
      },
      session: {
        name: student.session.name
      },
      term: {
        name: termInfo.name
      },
      grades: grades.map((grade) => ({
        subject: {
          name: grade.subject.name
        },
        firstScore: grade.firstScore ?? undefined,
        secondScore: grade.secondScore ?? undefined,
        fourthScore: grade.fourthScore ?? undefined,
        average: grade.average
      })),
      result: {
        position,
        average: result?.average ?? average,
        totalScore: result?.totalScore ?? totalScore,
        maxScore: result?.maxScore ?? maxScore
      }
    });

  } catch (error) {
    console.error('Error checking result:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
