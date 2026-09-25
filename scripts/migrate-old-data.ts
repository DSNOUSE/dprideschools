import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for the destination database');
const destinationPool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(destinationPool) });
type SourceConnection = mysql.Connection;

interface OldSession { SESSION_ID: number; SESSION: string; }
interface OldTerm { TERM_ID: number; TERM: string; SESSION_ID?: number | null; }
interface OldClass { CLASS_ID: number; CLASS_NAME: string; }
interface OldSubject { SUBJ_ID: number; SUBJ_CODE?: string | null; SUBJECT_NAME?: string | null; }
interface OldStudent {
  IDNO: string;
  CLASS_ID?: number | null;
  LNAME?: string | null;
  FNAME?: string | null;
  MNAME?: string | null;
  SEX?: string | null;
  BDAY?: string | Date | null;
  ADMIT_NUMBER?: string | null;
}
interface OldGrade {
  IDNO: string;
  CLASS_ID: number;
  TERM_ID: number;
  SESSION_ID: number;
  SUBJ_ID: number;
  FIRST?: number | string | null;
  SECOND?: number | string | null;
  FOURTH?: number | string | null;
  AVE?: number | string | null;
}
interface SourceData {
  sessions: OldSession[];
  terms: OldTerm[];
  classes: OldClass[];
  subjects: OldSubject[];
  students: OldStudent[];
  grades: OldGrade[];
}
interface MigrationMaps {
  sessions: Map<number, number>;
  terms: Map<string, number>;
  classes: Map<number, number>;
  subjects: Map<number, number>;
  students: Map<string, string>;
}

const sourceConfig = {
  host: process.env.OLD_DB_HOST ?? 'localhost',
  port: Number(process.env.OLD_DB_PORT ?? 3306),
  user: process.env.OLD_DB_USER ?? 'dpridein_db',
  password: process.env.OLD_DB_PASSWORD,
  database: process.env.OLD_DB_NAME ?? 'dpridein_db',
};

function text(value: unknown): string { return String(value ?? '').trim(); }
function number(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function termKey(sessionId: number, termId: number): string { return `${sessionId}:${termId}`; }
function mapSex(value: string | null | undefined): 'MALE' | 'FEMALE' | null {
  const normalized = text(value).toUpperCase();
  if (normalized === 'M' || normalized === 'MALE') return 'MALE';
  if (normalized === 'F' || normalized === 'FEMALE') return 'FEMALE';
  return null;
}
function mapSection(className: string): 'EARLY_YEARS' | 'PRIMARY' | 'SECONDARY' {
  const normalized = className.toLowerCase();
  if (/nursery|discovery/.test(normalized)) return 'EARLY_YEARS';
  if (/primary|year\s*[1-6]/.test(normalized)) return 'PRIMARY';
  return 'SECONDARY';
}
function gradeFor(score: number): string {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}
function remarkFor(grade: string): string {
  return ({ A: 'Excellent', B: 'Very Good', C: 'Good', D: 'Fair', F: 'Fail' })[grade] ?? '';
}
function sourceStudentKeys(student: OldStudent): string[] {
  return [student.IDNO, student.ADMIT_NUMBER ?? ''].map(text).filter(Boolean);
}

async function connectToSource(): Promise<SourceConnection> {
  if (!sourceConfig.password) throw new Error('OLD_DB_PASSWORD is required; source credentials must not be stored in the script');
  const connection = await mysql.createConnection(sourceConfig);
  console.log(`Connected to source MySQL database ${sourceConfig.database}`);
  return connection;
}

async function loadSourceData(connection: SourceConnection): Promise<SourceData> {
  const [sessions] = await connection.query('SELECT * FROM session');
  const [terms] = await connection.query('SELECT * FROM terms');
  const [classes] = await connection.query('SELECT * FROM classes');
  const [subjects] = await connection.query('SELECT * FROM subject');
  const [students] = await connection.query('SELECT * FROM tblstudent');
  const [grades] = await connection.query('SELECT * FROM grades');
  const data = {
    sessions: sessions as OldSession[], terms: terms as OldTerm[], classes: classes as OldClass[],
    subjects: subjects as OldSubject[], students: students as OldStudent[], grades: grades as OldGrade[],
  };
  console.log(`Source rows: ${data.sessions.length} sessions, ${data.terms.length} terms, ${data.classes.length} classes, ${data.subjects.length} subjects, ${data.students.length} students, ${data.grades.length} grades`);
  return data;
}

async function migrateSessions(data: SourceData, maps: MigrationMaps) {
  for (const source of data.sessions) {
    const name = text(source.SESSION);
    if (!name) continue;
    const record = await prisma.session.upsert({ where: { name }, update: {}, create: { name, isActive: false } });
    maps.sessions.set(number(source.SESSION_ID), record.id);
  }
}

async function migrateTerms(data: SourceData, maps: MigrationMaps) {
  for (const source of data.terms) {
    const oldSessionId = number(source.SESSION_ID, NaN);
    const sessionId = maps.sessions.get(oldSessionId);
    if (!Number.isFinite(oldSessionId) || !sessionId) continue;
    const name = text(source.TERM) || `Term ${source.TERM_ID}`;
    const record = await prisma.term.upsert({
      where: { sessionId_name: { sessionId, name } },
      update: { order: number(source.TERM_ID, 0) },
      create: { sessionId, name, order: number(source.TERM_ID, 0), isActive: false },
    });
    maps.terms.set(termKey(oldSessionId, number(source.TERM_ID)), record.id);
  }
}

async function migrateClasses(data: SourceData, maps: MigrationMaps) {
  for (const source of data.classes) {
    const legacyId = number(source.CLASS_ID);
    const code = `legacy-class-${legacyId}`;
    const name = text(source.CLASS_NAME) || `Class ${legacyId}`;
    const level = await prisma.classLevel.upsert({
      where: { code },
      update: { name, section: mapSection(name) },
      create: { code, name, section: mapSection(name), sortOrder: 10000 + legacyId, description: 'Migrated from the legacy PHP system' },
    });
    const record = await prisma.class.upsert({
      where: { levelId_name: { levelId: level.id, name } },
      update: {},
      create: { levelId: level.id, name, description: 'Migrated from the legacy PHP system' },
    });
    maps.classes.set(legacyId, record.id);
  }
}

async function migrateSubjects(data: SourceData, maps: MigrationMaps) {
  for (const source of data.subjects) {
    const code = text(source.SUBJ_CODE) || null;
    const name = text(source.SUBJECT_NAME) || code || `Subject ${source.SUBJ_ID}`;
    const existing = code
      ? await prisma.subject.findUnique({ where: { code } })
      : await prisma.subject.findUnique({ where: { name } });
    const record = existing ?? await prisma.subject.create({ data: { name, code, description: 'Migrated from the legacy PHP system', isActive: true } });
    maps.subjects.set(number(source.SUBJ_ID), record.id);
  }
}

async function migrateStudents(data: SourceData, maps: MigrationMaps) {
  for (const source of data.students) {
    const keys = sourceStudentKeys(source);
    if (keys.length === 0) continue;
    const existing = await prisma.student.findFirst({ where: { admissionNo: { in: keys } } });
    const admissionNo = text(source.ADMIT_NUMBER) || text(source.IDNO);
    const birthDate = source.BDAY ? new Date(source.BDAY) : null;
    const record = existing ?? await prisma.student.create({
      data: {
        admissionNo, firstName: text(source.FNAME) || 'Unknown', lastName: text(source.LNAME) || 'Unknown',
        middleName: text(source.MNAME) || null, sex: mapSex(source.SEX),
        birthDate: birthDate && !Number.isNaN(birthDate.getTime()) ? birthDate : null,
      },
    });
    for (const key of keys) maps.students.set(key, record.id);
  }
}

async function migrateResults(data: SourceData, maps: MigrationMaps) {
  let imported = 0;
  let skipped = 0;
  const assignments = new Map<string, { studentId: string; classId: number; sessionId: number }>();
  for (const source of data.grades) {
    const studentId = maps.students.get(text(source.IDNO));
    const classId = maps.classes.get(number(source.CLASS_ID));
    const sessionId = maps.sessions.get(number(source.SESSION_ID));
    const termId = maps.terms.get(termKey(number(source.SESSION_ID), number(source.TERM_ID)));
    const subjectId = maps.subjects.get(number(source.SUBJ_ID));
    if (!studentId || !classId || !sessionId || !termId || !subjectId) { skipped++; continue; }
    const officialAverage = number(source.AVE, NaN);
    const componentTotal = number(source.FIRST) + number(source.SECOND) + number(source.FOURTH);
    const score = Number.isFinite(officialAverage) ? officialAverage : componentTotal;
    const grade = gradeFor(score);
    await prisma.subjectResult.upsert({
      where: { studentId_subjectId_termId: { studentId, subjectId, termId } },
      update: { classId, sessionId, totalScore: new Prisma.Decimal(score), maxScore: new Prisma.Decimal(100), percentage: new Prisma.Decimal(score), grade, rating: grade, remark: remarkFor(grade), status: 'PUBLISHED', publishedAt: new Date() },
      create: { studentId, subjectId, classId, termId, sessionId, totalScore: new Prisma.Decimal(score), maxScore: new Prisma.Decimal(100), percentage: new Prisma.Decimal(score), grade, rating: grade, remark: remarkFor(grade), status: 'PUBLISHED', publishedAt: new Date() },
    });
    assignments.set(`${studentId}:${sessionId}`, { studentId, classId, sessionId });
    imported++;
  }
  console.log(`Imported or refreshed ${imported} subject results; skipped ${skipped} rows with unresolved references`);
  return assignments;
}

async function migrateEnrollments(assignments: Map<string, { studentId: string; classId: number; sessionId: number }>) {
  for (const assignment of assignments.values()) {
    await prisma.enrollment.upsert({
      where: { studentId_sessionId: { studentId: assignment.studentId, sessionId: assignment.sessionId } },
      update: { classId: assignment.classId, status: 'ACTIVE' },
      create: { studentId: assignment.studentId, sessionId: assignment.sessionId, classId: assignment.classId, status: 'ACTIVE' },
    });
  }
}

async function migrateTermResults() {
  const subjectResults = await prisma.subjectResult.findMany({ where: { status: 'PUBLISHED' }, select: { studentId: true, classId: true, termId: true, sessionId: true, totalScore: true, maxScore: true } });
  const groups = new Map<string, typeof subjectResults>();
  for (const result of subjectResults) {
    const key = `${result.studentId}:${result.termId}`;
    groups.set(key, [...(groups.get(key) ?? []), result]);
  }
  for (const results of groups.values()) {
    const first = results[0];
    const totalScore = results.reduce((sum, result) => sum + number(result.totalScore), 0);
    const maxScore = results.reduce((sum, result) => sum + number(result.maxScore, 100), 0);
    await prisma.termResult.upsert({
      where: { studentId_termId: { studentId: first.studentId, termId: first.termId } },
      update: { classId: first.classId, sessionId: first.sessionId, totalScore: new Prisma.Decimal(totalScore), maxScore: new Prisma.Decimal(maxScore), average: new Prisma.Decimal(results.length ? totalScore / results.length : 0), status: 'PUBLISHED', publishedAt: new Date() },
      create: { studentId: first.studentId, classId: first.classId, termId: first.termId, sessionId: first.sessionId, totalScore: new Prisma.Decimal(totalScore), maxScore: new Prisma.Decimal(maxScore), average: new Prisma.Decimal(results.length ? totalScore / results.length : 0), status: 'PUBLISHED', publishedAt: new Date() },
    });
  }
  const terms = await prisma.termResult.findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ classId: 'asc' }, { termId: 'asc' }, { totalScore: 'desc' }] });
  let previousGroup = '';
  let rank = 0;
  for (const result of terms) {
    const group = `${result.classId}:${result.termId}`;
    if (group !== previousGroup) { previousGroup = group; rank = 0; }
    rank++;
    await prisma.termResult.update({ where: { id: result.id }, data: { position: rank } });
  }
}

async function main() {
  const source = await connectToSource();
  try {
    const data = await loadSourceData(source);
    const maps: MigrationMaps = { sessions: new Map(), terms: new Map(), classes: new Map(), subjects: new Map(), students: new Map() };
    await migrateSessions(data, maps);
    await migrateTerms(data, maps);
    await migrateClasses(data, maps);
    await migrateSubjects(data, maps);
    await migrateStudents(data, maps);
    const assignments = await migrateResults(data, maps);
    await migrateEnrollments(assignments);
    await migrateTermResults();
    console.log('Migration completed. Existing records were preserved and matching legacy records were refreshed.');
  } finally {
    await source.end();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  const details = error instanceof Error
    ? { name: error.name, message: error.message, code: (error as Error & { code?: string }).code }
    : error;
  console.error('Migration failed:', JSON.stringify(details));
  process.exitCode = 1;
});
