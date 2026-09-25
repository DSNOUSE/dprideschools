import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildLegacyResultPdfHtml, buildLegacySessionPdfHtml } from '@/lib/results/pdf-export';

export const dynamic = 'force-dynamic';

const WINDOWS_CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function getBrowserLaunchOptions() {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
    || (process.platform === 'win32' && existsSync(WINDOWS_CHROME_PATH) ? WINDOWS_CHROME_PATH : undefined);

  return {
    headless: true as const,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(executablePath ? { executablePath } : {}),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const roles = (session?.user as any)?.roles as string[] | undefined;

    if (!session || !roles?.includes('Administrator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const termId = searchParams.get('termId') ? Number(searchParams.get('termId')) : undefined;
    const sessionId = searchParams.get('sessionId') ? Number(searchParams.get('sessionId')) : undefined;
    const allSessionResults = searchParams.get('all') === 'true';

    if (!studentId && !allSessionResults) {
      return NextResponse.json({ error: 'studentId or all=true is required' }, { status: 400 });
    }

    const activeSession = sessionId
      ? await prisma.session.findUnique({ where: { id: sessionId } })
      : await prisma.session.findFirst({ where: { isActive: true }, orderBy: { id: 'desc' } });

    if (!activeSession) {
      return NextResponse.json({ error: 'No session available' }, { status: 400 });
    }

    const activeTerm = termId
      ? await prisma.term.findUnique({ where: { id: termId } })
      : await prisma.term.findFirst({
          where: { sessionId: activeSession.id },
          orderBy: [{ isActive: 'desc' }, { order: 'asc' }, { id: 'asc' }],
        });

    if (allSessionResults) {
      const students = await prisma.student.findMany({
        where: {
          subjectResults: {
            some: {
              sessionId: activeSession.id,
              termId: activeTerm?.id ?? 0,
            },
          },
        },
        include: {
          enrollments: {
            where: { sessionId: activeSession.id },
            include: { class: true },
            orderBy: { enrolledAt: 'desc' },
          },
          subjectResults: {
            where: {
              sessionId: activeSession.id,
              termId: activeTerm?.id ?? 0,
            },
            include: { subject: true },
            orderBy: { subject: { name: 'asc' } },
          },
          termResults: {
            where: {
              sessionId: activeSession.id,
              termId: activeTerm?.id ?? 0,
            },
            take: 1,
          },
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      });

      const studentEntries = students.map((student) => {
        const enrollment = student.enrollments[0] ?? null;
        const subjectRows = student.subjectResults;
        const termResult = student.termResults[0] ?? null;

        return {
          student: {
            admissionNo: student.admissionNo,
            firstName: student.firstName,
            middleName: student.middleName,
            lastName: student.lastName,
          },
          className: enrollment?.class?.name ?? 'Unassigned',
          summary: {
            average: Number(termResult?.average ?? (subjectRows.length ? subjectRows.reduce((sum, item) => sum + Number(item.totalScore ?? item.percentage ?? 0), 0) / subjectRows.length : 0)),
            totalScore: Number(termResult?.totalScore ?? subjectRows.reduce((sum, item) => sum + Number(item.totalScore ?? item.percentage ?? 0), 0)),
            maxScore: Number(termResult?.maxScore ?? subjectRows.reduce((sum, item) => sum + Number(item.maxScore ?? 100), 0)),
            position: termResult?.position ?? null,
          },
          subjectRows: subjectRows.map((item) => ({
            subject: item.subject.name,
            total: Number(item.totalScore ?? item.percentage ?? 0),
            max: Number(item.maxScore ?? 100),
            percentage: Number(item.percentage ?? (item.maxScore ? (Number(item.totalScore ?? 0) / Number(item.maxScore)) * 100 : 0)),
            grade: item.grade ?? '—',
            remark: item.remark,
          })),
        };
      });

      const html = buildLegacySessionPdfHtml({
        sessionName: activeSession.name,
        termName: activeTerm?.name ?? 'Latest Term',
        students: studentEntries,
      });

      const browser = await puppeteer.launch(getBrowserLaunchOptions());

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' },
      });
      await browser.close();

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="legacy-session-results-${activeSession.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`,
        },
      });
    }

    const student = await prisma.student.findFirst({
      where: { admissionNo: { equals: studentId!, mode: 'insensitive' } },
      include: {
        enrollments: {
          where: sessionId ? { sessionId } : undefined,
          include: { class: true, session: true },
          orderBy: { enrolledAt: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const enrollment = student.enrollments[0] ?? null;
    const subjectRows = await prisma.subjectResult.findMany({
      where: {
        studentId: student.id,
        sessionId: activeSession.id,
        termId: activeTerm?.id ?? 0,
      },
      include: { subject: true },
      orderBy: { subject: { name: 'asc' } },
    });

    const termResult = await prisma.termResult.findFirst({
      where: {
        studentId: student.id,
        sessionId: activeSession.id,
        termId: activeTerm?.id ?? 0,
      },
    });

    const html = buildLegacyResultPdfHtml({
      student: {
        admissionNo: student.admissionNo,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
      },
      className: enrollment?.class?.name ?? 'Unassigned',
      sessionName: enrollment?.session?.name ?? activeSession.name,
      termName: activeTerm?.name ?? 'Unknown Term',
      subjectRows: subjectRows.map((item) => ({
        subject: item.subject.name,
        total: Number(item.totalScore ?? item.percentage ?? 0),
        max: Number(item.maxScore ?? 100),
        percentage: Number(item.percentage ?? (item.maxScore ? (Number(item.totalScore ?? 0) / Number(item.maxScore)) * 100 : 0)),
        grade: item.grade ?? '—',
        remark: item.remark,
      })),
      summary: {
        average: Number(termResult?.average ?? (subjectRows.length ? subjectRows.reduce((sum, item) => sum + Number(item.totalScore ?? item.percentage ?? 0), 0) / subjectRows.length : 0)),
        totalScore: Number(termResult?.totalScore ?? subjectRows.reduce((sum, item) => sum + Number(item.totalScore ?? item.percentage ?? 0), 0)),
        maxScore: Number(termResult?.maxScore ?? subjectRows.reduce((sum, item) => sum + Number(item.maxScore ?? 100), 0)),
        position: termResult?.position ?? null,
      },
    });

    const browser = await puppeteer.launch(getBrowserLaunchOptions());

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });
    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="legacy-results-${student.admissionNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Legacy results PDF generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
