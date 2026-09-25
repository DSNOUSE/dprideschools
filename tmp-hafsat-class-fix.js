const { Pool } = require('pg');
require('dotenv').config({ quiet: true });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const student = (
    await pool.query(
      `SELECT s.id, s."admissionNo", s."firstName", s."middleName", s."lastName",
              e."classId" AS enroll_class_id, c.name AS enroll_class, e."sessionId"
       FROM "Student" s
       LEFT JOIN "Enrollment" e ON e."studentId" = s.id AND e.status = 'ACTIVE'
       LEFT JOIN "Class" c ON c.id = e."classId"
       WHERE s."admissionNo" = 'DPS48925'`
    )
  ).rows[0];
  console.log('STUDENT', student);

  const classes = (
    await pool.query(`SELECT id, name FROM "Class" ORDER BY id`)
  ).rows;
  console.log('CLASSES', classes);

  const terms = (
    await pool.query(
      `SELECT id, name, "order", "sessionId" FROM "Term" ORDER BY "sessionId", "order"`
    )
  ).rows;
  console.log('TERMS', terms);

  const termResults = (
    await pool.query(
      `SELECT tr.id, tr."classId", c.name AS class_name, tr."termId", t.name AS term_name,
              tr."sessionId", tr."totalScore", tr.average, tr.position, tr.status::text
       FROM "TermResult" tr
       JOIN "Class" c ON c.id = tr."classId"
       JOIN "Term" t ON t.id = tr."termId"
       WHERE tr."studentId" = $1
       ORDER BY t."order"`,
      [student.id]
    )
  ).rows;
  console.log('TERM_RESULTS', termResults);

  const subjectResults = (
    await pool.query(
      `SELECT sr.id, sr."classId", c.name AS class_name, sr."termId", t.name AS term_name,
              sub.name AS subject_name, sr."totalScore", sr.percentage, sr.grade, sr.status::text
       FROM "SubjectResult" sr
       JOIN "Class" c ON c.id = sr."classId"
       JOIN "Term" t ON t.id = sr."termId"
       JOIN "Subject" sub ON sub.id = sr."subjectId"
       WHERE sr."studentId" = $1
       ORDER BY t."order", sub.name`,
      [student.id]
    )
  ).rows;
  console.log('SUBJECT_RESULTS_BY_CLASS');
  console.table(
    subjectResults.map((r) => ({
      term: r.term_name,
      class: r.class_name,
      classId: r.class_id || r.classId,
      subject: r.subject_name,
      score: r.totalScore,
      status: r.status,
    }))
  );

  // counts by class
  const byClass = (
    await pool.query(
      `SELECT c.name, count(*)::int AS n
       FROM "SubjectResult" sr
       JOIN "Class" c ON c.id = sr."classId"
       WHERE sr."studentId" = $1
       GROUP BY c.name
       ORDER BY c.name`,
      [student.id]
    )
  ).rows;
  console.log('SUBJECT_RESULT_COUNTS_BY_CLASS', byClass);

  const assessments = (
    await pool.query(
      `SELECT t.name AS term_name, c.name AS class_name, so."classId", count(*)::int AS scores
       FROM "AssessmentScore" sc
       JOIN "Assessment" a ON a.id = sc."assessmentId"
       JOIN "SubjectOffering" so ON so.id = a."offeringId"
       JOIN "Class" c ON c.id = so."classId"
       JOIN "Term" t ON t.id = a."termId"
       WHERE sc."studentId" = $1
       GROUP BY t.name, c.name, so."classId"
       ORDER BY t.name, c.name`,
      [student.id]
    )
  ).rows;
  console.log('ASSESSMENT_SCORES_BY_CLASS', assessments);

  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
