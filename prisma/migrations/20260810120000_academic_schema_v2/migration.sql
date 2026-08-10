-- Academic schema v2: expand -> backfill -> contract
-- Preserves users/roles/students/grades/results data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

/* =========================================================
   1. ENUMS
   ========================================================= */

DO $$ BEGIN CREATE TYPE "SchoolSection" AS ENUM ('EARLY_YEARS', 'PRIMARY', 'SECONDARY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PROMOTED', 'REPEATED', 'WITHDRAWN', 'TRANSFERRED', 'GRADUATED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AssessmentType" AS ENUM ('CA', 'TEST', 'ASSIGNMENT', 'MIDTERM', 'PRACTICAL', 'PROJECT', 'EXAM'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AssessmentValueType" AS ENUM ('NUMERIC', 'RATING', 'TEXT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ResultStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "PromotionStatus" AS ENUM ('PROMOTED', 'PROMOTED_ON_CONDITION', 'REPEATED', 'GRADUATED', 'NOT_APPLICABLE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ApprovalEntityType" AS ENUM ('SUBJECT_RESULT', 'TERM_RESULT', 'REPORT', 'ASSESSMENT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ExternalExamType" AS ENUM ('BECE', 'WASSCE', 'NECO_SSCE', 'NABTEB', 'OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* =========================================================
   2. NEW TABLES
   ========================================================= */

CREATE TABLE IF NOT EXISTS "Teacher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "staffNumber" TEXT,
    "fullName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Teacher_userId_key" ON "Teacher"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Teacher_staffNumber_key" ON "Teacher"("staffNumber");

CREATE TABLE IF NOT EXISTS "ClassLevel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "section" "SchoolSection" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "description" TEXT,
    CONSTRAINT "ClassLevel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ClassLevel_code_key" ON "ClassLevel"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "ClassLevel_section_sortOrder_key" ON "ClassLevel"("section", "sortOrder");
CREATE INDEX IF NOT EXISTS "ClassLevel_section_idx" ON "ClassLevel"("section");

CREATE TABLE IF NOT EXISTS "Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),
    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_studentId_sessionId_key" ON "Enrollment"("studentId", "sessionId");
CREATE INDEX IF NOT EXISTS "Enrollment_classId_sessionId_idx" ON "Enrollment"("classId", "sessionId");
CREATE INDEX IF NOT EXISTS "Enrollment_studentId_idx" ON "Enrollment"("studentId");
CREATE INDEX IF NOT EXISTS "Enrollment_status_idx" ON "Enrollment"("status");

CREATE TABLE IF NOT EXISTS "SubjectOffering" (
    "id" SERIAL NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "isCompulsory" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "SubjectOffering_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SubjectOffering_subjectId_classId_sessionId_key" ON "SubjectOffering"("subjectId", "classId", "sessionId");
CREATE INDEX IF NOT EXISTS "SubjectOffering_classId_sessionId_idx" ON "SubjectOffering"("classId", "sessionId");
CREATE INDEX IF NOT EXISTS "SubjectOffering_subjectId_sessionId_idx" ON "SubjectOffering"("subjectId", "sessionId");
CREATE INDEX IF NOT EXISTS "SubjectOffering_isActive_idx" ON "SubjectOffering"("isActive");

CREATE TABLE IF NOT EXISTS "TeacherSubject" (
    "id" SERIAL NOT NULL,
    "teacherId" TEXT NOT NULL,
    "offeringId" INTEGER NOT NULL,
    CONSTRAINT "TeacherSubject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TeacherSubject_teacherId_offeringId_key" ON "TeacherSubject"("teacherId", "offeringId");
CREATE INDEX IF NOT EXISTS "TeacherSubject_offeringId_idx" ON "TeacherSubject"("offeringId");

CREATE TABLE IF NOT EXISTS "StudentSubject" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "offeringId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentSubject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StudentSubject_studentId_offeringId_key" ON "StudentSubject"("studentId", "offeringId");
CREATE INDEX IF NOT EXISTS "StudentSubject_offeringId_idx" ON "StudentSubject"("offeringId");

CREATE TABLE IF NOT EXISTS "Assessment" (
    "id" TEXT NOT NULL,
    "offeringId" INTEGER NOT NULL,
    "termId" INTEGER NOT NULL,
    "teacherId" TEXT,
    "name" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "valueType" "AssessmentValueType" NOT NULL DEFAULT 'NUMERIC',
    "maxScore" DECIMAL(6,2),
    "weight" DECIMAL(6,2),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Assessment_offeringId_termId_name_key" ON "Assessment"("offeringId", "termId", "name");
CREATE INDEX IF NOT EXISTS "Assessment_offeringId_termId_idx" ON "Assessment"("offeringId", "termId");
CREATE INDEX IF NOT EXISTS "Assessment_termId_idx" ON "Assessment"("termId");
CREATE INDEX IF NOT EXISTS "Assessment_teacherId_idx" ON "Assessment"("teacherId");

CREATE TABLE IF NOT EXISTS "AssessmentScore" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "numericScore" DECIMAL(6,2),
    "rating" TEXT,
    "textValue" TEXT,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssessmentScore_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AssessmentScore_assessmentId_studentId_key" ON "AssessmentScore"("assessmentId", "studentId");
CREATE INDEX IF NOT EXISTS "AssessmentScore_studentId_idx" ON "AssessmentScore"("studentId");

CREATE TABLE IF NOT EXISTS "SubjectResult" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "termId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "totalScore" DECIMAL(8,2),
    "maxScore" DECIMAL(8,2),
    "percentage" DECIMAL(6,2),
    "grade" TEXT,
    "rating" TEXT,
    "remark" TEXT,
    "status" "ResultStatus" NOT NULL DEFAULT 'DRAFT',
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    CONSTRAINT "SubjectResult_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SubjectResult_studentId_subjectId_termId_key" ON "SubjectResult"("studentId", "subjectId", "termId");
CREATE INDEX IF NOT EXISTS "SubjectResult_classId_termId_idx" ON "SubjectResult"("classId", "termId");
CREATE INDEX IF NOT EXISTS "SubjectResult_studentId_termId_idx" ON "SubjectResult"("studentId", "termId");
CREATE INDEX IF NOT EXISTS "SubjectResult_subjectId_termId_idx" ON "SubjectResult"("subjectId", "termId");
CREATE INDEX IF NOT EXISTS "SubjectResult_sessionId_termId_idx" ON "SubjectResult"("sessionId", "termId");
CREATE INDEX IF NOT EXISTS "SubjectResult_status_idx" ON "SubjectResult"("status");
CREATE INDEX IF NOT EXISTS "SubjectResult_teacherId_idx" ON "SubjectResult"("teacherId");

CREATE TABLE IF NOT EXISTS "TermResult" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    "termId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "totalScore" DECIMAL(10,2),
    "maxScore" DECIMAL(10,2),
    "average" DECIMAL(6,2),
    "position" INTEGER,
    "status" "ResultStatus" NOT NULL DEFAULT 'DRAFT',
    "classTeacherRemark" TEXT,
    "principalRemark" TEXT,
    "promotionStatus" "PromotionStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    CONSTRAINT "TermResult_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TermResult_studentId_termId_key" ON "TermResult"("studentId", "termId");
CREATE INDEX IF NOT EXISTS "TermResult_classId_termId_idx" ON "TermResult"("classId", "termId");
CREATE INDEX IF NOT EXISTS "TermResult_sessionId_termId_idx" ON "TermResult"("sessionId", "termId");
CREATE INDEX IF NOT EXISTS "TermResult_status_idx" ON "TermResult"("status");

CREATE TABLE IF NOT EXISTS "GradingScale" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "GradingScale_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GradingScale_name_key" ON "GradingScale"("name");

CREATE TABLE IF NOT EXISTS "GradeBand" (
    "id" SERIAL NOT NULL,
    "scaleId" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "minScore" DECIMAL(6,2) NOT NULL,
    "maxScore" DECIMAL(6,2) NOT NULL,
    "remark" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "GradeBand_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GradeBand_scaleId_grade_key" ON "GradeBand"("scaleId", "grade");
CREATE INDEX IF NOT EXISTS "GradeBand_scaleId_idx" ON "GradeBand"("scaleId");

CREATE TABLE IF NOT EXISTS "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "termId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "note" TEXT,
    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AttendanceRecord_studentId_date_key" ON "AttendanceRecord"("studentId", "date");
CREATE INDEX IF NOT EXISTS "AttendanceRecord_studentId_termId_idx" ON "AttendanceRecord"("studentId", "termId");
CREATE INDEX IF NOT EXISTS "AttendanceRecord_termId_date_idx" ON "AttendanceRecord"("termId", "date");

CREATE TABLE IF NOT EXISTS "EvaluationCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "EvaluationCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EvaluationCategory_name_key" ON "EvaluationCategory"("name");

CREATE TABLE IF NOT EXISTS "StudentEvaluation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "termId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "comment" TEXT,
    CONSTRAINT "StudentEvaluation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StudentEvaluation_studentId_termId_categoryId_key" ON "StudentEvaluation"("studentId", "termId", "categoryId");
CREATE INDEX IF NOT EXISTS "StudentEvaluation_termId_idx" ON "StudentEvaluation"("termId");

CREATE TABLE IF NOT EXISTS "ExternalExam" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "ExternalExamType" NOT NULL,
    "year" INTEGER NOT NULL,
    "examinationNumber" TEXT,
    "centre" TEXT,
    CONSTRAINT "ExternalExam_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ExternalExam_studentId_year_idx" ON "ExternalExam"("studentId", "year");
CREATE INDEX IF NOT EXISTS "ExternalExam_type_year_idx" ON "ExternalExam"("type", "year");

CREATE TABLE IF NOT EXISTS "ExternalExamSubject" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "score" DECIMAL(6,2),
    CONSTRAINT "ExternalExamSubject_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ExternalExamSubject_examId_idx" ON "ExternalExamSubject"("examId");

/* =========================================================
   3. STAGING / HELPER COLUMNS
   ========================================================= */

ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "levelId" INTEGER;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "formTeacherId" TEXT;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER;

ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);

ALTER TABLE "Term" ADD COLUMN IF NOT EXISTS "sessionId" INTEGER;
ALTER TABLE "Term" ADD COLUMN IF NOT EXISTS "order" INTEGER;
ALTER TABLE "Term" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "Term" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);
ALTER TABLE "Term" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT false;

ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "sex_new" "Sex";

ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "canonicalSubjectId" INTEGER;

ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "termResultId" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "teacherRemark" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "principalRemark" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "teacherId_new" TEXT;

ALTER TABLE "result_audit_logs" ADD COLUMN IF NOT EXISTS "academicSessionId" INTEGER;
ALTER TABLE "result_audit_logs" ADD COLUMN IF NOT EXISTS "clientSessionId" TEXT;
ALTER TABLE "result_audit_logs" ADD COLUMN IF NOT EXISTS "teacherId_new" TEXT;

ALTER TABLE "teacher_activity_logs" ADD COLUMN IF NOT EXISTS "academicSessionId" INTEGER;
ALTER TABLE "teacher_activity_logs" ADD COLUMN IF NOT EXISTS "clientSessionId" TEXT;
ALTER TABLE "teacher_activity_logs" ADD COLUMN IF NOT EXISTS "teacherId_new" TEXT;

ALTER TABLE "result_approvals" ADD COLUMN IF NOT EXISTS "entityType_new" "ApprovalEntityType";
ALTER TABLE "result_approvals" ADD COLUMN IF NOT EXISTS "status_new" "ApprovalStatus";
ALTER TABLE "result_approvals" ADD COLUMN IF NOT EXISTS "sessionId" INTEGER;

/* =========================================================
   4. BACKFILL STRUCTURE
   ========================================================= */

-- Teachers from users with staff numbers or Teacher role
INSERT INTO "Teacher" ("id", "userId", "staffNumber", "fullName", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  u.id,
  NULLIF(BTRIM(u."teacherId"), ''),
  COALESCE(NULLIF(BTRIM(u.name), ''), split_part(u.email, '@', 1)),
  true,
  u."createdAt",
  u."updatedAt"
FROM "User" u
WHERE NULLIF(BTRIM(u."teacherId"), '') IS NOT NULL
   OR EXISTS (
     SELECT 1
     FROM "UserRole" ur
     JOIN "Role" r ON r.id = ur."roleId"
     WHERE ur."userId" = u.id AND lower(r.name) LIKE '%teacher%'
   )
ON CONFLICT ("userId") DO NOTHING;

-- Ensure unique staff numbers (dedupe by clearing duplicates after first)
WITH ranked AS (
  SELECT id, "staffNumber",
         ROW_NUMBER() OVER (PARTITION BY "staffNumber" ORDER BY "createdAt", id) AS rn
  FROM "Teacher"
  WHERE "staffNumber" IS NOT NULL
)
UPDATE "Teacher" t
SET "staffNumber" = t."staffNumber" || '-' || substring(t.id from 1 for 6)
FROM ranked r
WHERE t.id = r.id AND r.rn > 1;

-- Class levels
INSERT INTO "ClassLevel" ("name", "code", "section", "sortOrder", "description") VALUES
  ('Discovery Class', 'EY-DISCOVERY', 'EARLY_YEARS', 1, 'Pre-Nursery'),
  ('Explorers', 'EY-EXPLORERS', 'EARLY_YEARS', 2, 'Nursery 1'),
  ('Preparatory', 'EY-PREP', 'EARLY_YEARS', 3, 'Nursery 2'),
  ('Year 1', 'PR-Y1', 'PRIMARY', 1, NULL),
  ('Year 2', 'PR-Y2', 'PRIMARY', 2, NULL),
  ('Year 3', 'PR-Y3', 'PRIMARY', 3, NULL),
  ('Year 4', 'PR-Y4', 'PRIMARY', 4, NULL),
  ('Year 5', 'PR-Y5', 'PRIMARY', 5, NULL),
  ('Year 6', 'PR-Y6', 'PRIMARY', 6, NULL),
  ('Year 7', 'SE-Y7', 'SECONDARY', 1, NULL),
  ('Year 8', 'SE-Y8', 'SECONDARY', 2, NULL),
  ('Year 9', 'SE-Y9', 'SECONDARY', 3, NULL)
ON CONFLICT ("code") DO NOTHING;

-- Map classes to levels
UPDATE "Class" c
SET
  "levelId" = cl.id,
  "sortOrder" = COALESCE(c.sort_order, cl."sortOrder"),
  "description" = COALESCE(c.level, c."description")
FROM "ClassLevel" cl
WHERE c."levelId" IS NULL
  AND (
    (upper(c.name) LIKE '%DISCOVERY%' AND cl.code = 'EY-DISCOVERY')
    OR (upper(c.name) LIKE '%EXPLORER%' AND cl.code = 'EY-EXPLORERS')
    OR (upper(c.name) LIKE '%PREPARATORY%' AND cl.code = 'EY-PREP')
    OR (upper(c.name) ~ '(^|[^0-9])YEAR[[:space:]]*1([^0-9]|$)' AND cl.code = 'PR-Y1')
    OR (upper(c.name) ~ '(^|[^0-9])YEAR[[:space:]]*2([^0-9]|$)' AND cl.code = 'PR-Y2')
    OR (upper(c.name) ~ '(^|[^0-9])YEAR[[:space:]]*3([^0-9]|$)' AND cl.code = 'PR-Y3')
    OR (upper(c.name) ~ '(^|[^0-9])YEAR[[:space:]]*4([^0-9]|$)' AND cl.code = 'PR-Y4')
    OR (upper(c.name) ~ '(^|[^0-9])YEAR[[:space:]]*5([^0-9]|$)' AND cl.code = 'PR-Y5')
    OR (upper(c.name) ~ '(^|[^0-9])YEAR[[:space:]]*6([^0-9]|$)' AND cl.code = 'PR-Y6')
    OR (upper(c.name) ~ '(^|[^0-9])YEAR[[:space:]]*7([^0-9]|$)' AND cl.code = 'SE-Y7')
    OR (upper(c.name) ~ '(^|[^0-9])YEAR[[:space:]]*8([^0-9]|$)' AND cl.code = 'SE-Y8')
    OR (upper(c.name) ~ '(^|[^0-9])YEAR[[:space:]]*9([^0-9]|$)' AND cl.code = 'SE-Y9')
  );

-- Fallback any unmapped class by department
UPDATE "Class" c
SET "levelId" = (
  SELECT cl.id FROM "ClassLevel" cl
  JOIN "Department" d ON d.id = c."departmentId"
  WHERE (
    (lower(d.name) LIKE '%early%' AND cl.section = 'EARLY_YEARS')
    OR (lower(d.name) LIKE '%primary%' AND cl.section = 'PRIMARY')
    OR (lower(d.name) LIKE '%secondary%' AND cl.section = 'SECONDARY')
  )
  ORDER BY cl."sortOrder"
  LIMIT 1
),
"sortOrder" = COALESCE(c."sortOrder", c.sort_order, c.id)
WHERE c."levelId" IS NULL;

-- Absolute fallback
UPDATE "Class"
SET "levelId" = (SELECT id FROM "ClassLevel" ORDER BY id LIMIT 1),
    "sortOrder" = COALESCE("sortOrder", sort_order, id)
WHERE "levelId" IS NULL;

-- Terms belong to active/latest session
UPDATE "Term" t
SET
  "sessionId" = COALESCE(
    (SELECT s.id FROM "Session" s WHERE s."isActive" = true ORDER BY s.id DESC LIMIT 1),
    (SELECT s.id FROM "Session" s ORDER BY s.id DESC LIMIT 1)
  ),
  "order" = CASE
    WHEN lower(t.name) LIKE '%first%' OR t.name ~* '\\b1\\b' THEN 1
    WHEN lower(t.name) LIKE '%second%' OR t.name ~* '\\b2\\b' THEN 2
    WHEN lower(t.name) LIKE '%third%' OR t.name ~* '\\b3\\b' THEN 3
    ELSE t.id
  END,
  "isActive" = COALESCE(t."isActive", false)
WHERE t."sessionId" IS NULL;

-- Student sex enum
UPDATE "Student"
SET "sex_new" = CASE
  WHEN lower(sex) IN ('m', 'male') THEN 'MALE'::"Sex"
  WHEN lower(sex) IN ('f', 'female') THEN 'FEMALE'::"Sex"
  ELSE NULL
END;

-- Canonical subjects (keep lowest id per name)
UPDATE "Subject" s
SET "canonicalSubjectId" = c.keep_id,
    "isActive" = true
FROM (
  SELECT name, MIN(id) AS keep_id
  FROM "Subject"
  GROUP BY name
) c
WHERE s.name = c.name;

-- Subject offerings from historical grade pairs + subject.classId
INSERT INTO "SubjectOffering" ("subjectId", "classId", "sessionId", "isCompulsory", "isActive")
SELECT DISTINCT c.keep_id, x."classId", x."sessionId", true, true
FROM (
  SELECT g."subjectId", g."classId", g."sessionId"
  FROM "Grade" g
  UNION
  SELECT s.id, s."classId", COALESCE(
    (SELECT ss.id FROM "Session" ss WHERE ss."isActive" = true ORDER BY ss.id DESC LIMIT 1),
    (SELECT ss.id FROM "Session" ss ORDER BY ss.id DESC LIMIT 1)
  )
  FROM "Subject" s
  WHERE s."classId" IS NOT NULL
) x
JOIN "Subject" s ON s.id = x."subjectId"
JOIN (
  SELECT name, MIN(id) AS keep_id FROM "Subject" GROUP BY name
) c ON c.name = s.name
ON CONFLICT ("subjectId", "classId", "sessionId") DO NOTHING;

-- Enrollments
INSERT INTO "Enrollment" ("id", "studentId", "sessionId", "classId", "status", "enrolledAt")
SELECT gen_random_uuid()::text, st.id, st."sessionId", st."classId", 'ACTIVE', st."createdAt"
FROM "Student" st
ON CONFLICT ("studentId", "sessionId") DO NOTHING;

-- Teacher subject assignments from grade teacher history
INSERT INTO "TeacherSubject" ("teacherId", "offeringId")
SELECT DISTINCT t.id, so.id
FROM "Grade" g
JOIN "Teacher" t ON t."userId" = g."teacherId"
JOIN "Subject" s ON s.id = g."subjectId"
JOIN (
  SELECT name, MIN(id) AS keep_id FROM "Subject" GROUP BY name
) c ON c.name = s.name
JOIN "SubjectOffering" so
  ON so."subjectId" = c.keep_id
 AND so."classId" = g."classId"
 AND so."sessionId" = g."sessionId"
WHERE g."teacherId" IS NOT NULL
ON CONFLICT ("teacherId", "offeringId") DO NOTHING;

/* =========================================================
   5. BACKFILL ASSESSMENTS + SCORES + RESULTS
   ========================================================= */

-- Create CA1 / CA2 / Exam assessments for each offering+term seen in grades
WITH pairs AS (
  SELECT DISTINCT
    so.id AS offering_id,
    g."termId" AS term_id,
    (
      SELECT t.id
      FROM "Grade" g2
      JOIN "Teacher" t ON t."userId" = g2."teacherId"
      JOIN "Subject" s2 ON s2.id = g2."subjectId"
      JOIN (SELECT name, MIN(id) keep_id FROM "Subject" GROUP BY name) c2 ON c2.name = s2.name
      WHERE g2."classId" = g."classId"
        AND g2."sessionId" = g."sessionId"
        AND g2."termId" = g."termId"
        AND c2.keep_id = so."subjectId"
        AND g2."teacherId" IS NOT NULL
      GROUP BY t.id
      ORDER BY count(*) DESC
      LIMIT 1
    ) AS teacher_id
  FROM "Grade" g
  JOIN "Subject" s ON s.id = g."subjectId"
  JOIN (SELECT name, MIN(id) keep_id FROM "Subject" GROUP BY name) c ON c.name = s.name
  JOIN "SubjectOffering" so
    ON so."subjectId" = c.keep_id
   AND so."classId" = g."classId"
   AND so."sessionId" = g."sessionId"
),
defs AS (
  SELECT * FROM (VALUES
    ('CA 1', 'CA'::"AssessmentType", 10::numeric, 10::numeric, 1),
    ('CA 2', 'CA'::"AssessmentType", 10::numeric, 10::numeric, 2),
    ('Exam', 'EXAM'::"AssessmentType", 80::numeric, 80::numeric, 3)
  ) AS d(name, type, max_score, weight, ord)
)
INSERT INTO "Assessment" ("id", "offeringId", "termId", "teacherId", "name", "type", "valueType", "maxScore", "weight", "order", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, p.offering_id, p.term_id, p.teacher_id, d.name, d.type, 'NUMERIC', d.max_score, d.weight, d.ord, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM pairs p
CROSS JOIN defs d
ON CONFLICT ("offeringId", "termId", "name") DO NOTHING;

-- Assessment scores from grade columns
INSERT INTO "AssessmentScore" ("id", "assessmentId", "studentId", "numericScore", "enteredAt", "updatedAt")
SELECT gen_random_uuid()::text, a.id, g."studentId",
       CASE a.name
         WHEN 'CA 1' THEN g."firstScore"
         WHEN 'CA 2' THEN g."secondScore"
         WHEN 'Exam' THEN g."fourthScore"
       END,
       g."createdAt", g."updatedAt"
FROM "Grade" g
JOIN "Subject" s ON s.id = g."subjectId"
JOIN (SELECT name, MIN(id) keep_id FROM "Subject" GROUP BY name) c ON c.name = s.name
JOIN "SubjectOffering" so
  ON so."subjectId" = c.keep_id
 AND so."classId" = g."classId"
 AND so."sessionId" = g."sessionId"
JOIN "Assessment" a
  ON a."offeringId" = so.id
 AND a."termId" = g."termId"
 AND a.name IN ('CA 1', 'CA 2', 'Exam')
WHERE CASE a.name
        WHEN 'CA 1' THEN g."firstScore"
        WHEN 'CA 2' THEN g."secondScore"
        WHEN 'Exam' THEN g."fourthScore"
      END IS NOT NULL
ON CONFLICT ("assessmentId", "studentId") DO NOTHING;

-- Subject results from grades
INSERT INTO "SubjectResult" (
  "id", "studentId", "subjectId", "classId", "termId", "sessionId",
  "totalScore", "maxScore", "percentage", "grade", "status", "teacherId",
  "createdAt", "updatedAt", "publishedAt"
)
SELECT
  gen_random_uuid()::text,
  g."studentId",
  c.keep_id,
  g."classId",
  g."termId",
  g."sessionId",
  ROUND(g.average::numeric, 2),
  100,
  ROUND(g.average::numeric, 2),
  CASE
    WHEN g.average >= 70 THEN 'A'
    WHEN g.average >= 60 THEN 'B'
    WHEN g.average >= 50 THEN 'C'
    WHEN g.average >= 45 THEN 'D'
    WHEN g.average >= 40 THEN 'E'
    ELSE 'F'
  END,
  'PUBLISHED',
  t.id,
  g."createdAt",
  g."updatedAt",
  g."updatedAt"
FROM "Grade" g
JOIN "Subject" s ON s.id = g."subjectId"
JOIN (SELECT name, MIN(id) keep_id FROM "Subject" GROUP BY name) c ON c.name = s.name
LEFT JOIN "Teacher" t ON t."userId" = g."teacherId"
ON CONFLICT ("studentId", "subjectId", "termId") DO NOTHING;

-- Term results from Result table
INSERT INTO "TermResult" (
  "id", "studentId", "classId", "termId", "sessionId",
  "totalScore", "maxScore", "average", "position", "status",
  "classTeacherRemark", "promotionStatus", "createdAt", "updatedAt", "publishedAt"
)
SELECT
  gen_random_uuid()::text,
  r."studentId",
  r."classId",
  r."termId",
  r."sessionId",
  ROUND(r."totalScore"::numeric, 2),
  ROUND(r."maxScore"::numeric, 2),
  ROUND(r.average::numeric, 2),
  r.position,
  'PUBLISHED',
  NULL,
  'NOT_APPLICABLE',
  r."createdAt",
  r."updatedAt",
  r."updatedAt"
FROM "Result" r
ON CONFLICT ("studentId", "termId") DO NOTHING;

-- Also create term results from grades where Result row missing
INSERT INTO "TermResult" (
  "id", "studentId", "classId", "termId", "sessionId",
  "totalScore", "maxScore", "average", "status",
  "promotionStatus", "createdAt", "updatedAt", "publishedAt"
)
SELECT
  gen_random_uuid()::text,
  g."studentId",
  g."classId",
  g."termId",
  g."sessionId",
  ROUND(SUM(g.average)::numeric, 2),
  ROUND((COUNT(*) * 100)::numeric, 2),
  ROUND((SUM(g.average) / COUNT(*))::numeric, 2),
  'PUBLISHED',
  'NOT_APPLICABLE',
  MIN(g."createdAt"),
  MAX(g."updatedAt"),
  MAX(g."updatedAt")
FROM "Grade" g
GROUP BY g."studentId", g."classId", g."termId", g."sessionId"
ON CONFLICT ("studentId", "termId") DO NOTHING;

-- Default grading scale from GradeScale if present
INSERT INTO "GradingScale" ("name", "description", "isDefault")
SELECT 'Default', 'Migrated from GradeScale', true
WHERE NOT EXISTS (SELECT 1 FROM "GradingScale" WHERE "isDefault" = true);

INSERT INTO "GradeBand" ("scaleId", "grade", "minScore", "maxScore", "remark", "sortOrder")
SELECT gs.id, g.grade, g."minScore", g."maxScore", g.description,
       ROW_NUMBER() OVER (ORDER BY g."minScore" DESC)
FROM "GradeScale" g
CROSS JOIN (SELECT id FROM "GradingScale" WHERE "isDefault" = true ORDER BY id LIMIT 1) gs
ON CONFLICT ("scaleId", "grade") DO NOTHING;

/* =========================================================
   6. REPORTS REBUILD (one per student+term)
   ========================================================= */

CREATE TEMP TABLE report_keep ON COMMIT DROP AS
SELECT DISTINCT ON ("studentId", "termId")
  id,
  "studentId",
  "termId",
  "teacherId",
  comment,
  status,
  "createdAt",
  "updatedAt",
  "subjectId"
FROM "Report"
ORDER BY "studentId", "termId",
  CASE WHEN "subjectId" IS NULL THEN 0 ELSE 1 END,
  CASE WHEN status = 'PUBLISHED' THEN 0 ELSE 1 END,
  "updatedAt" DESC,
  id;

-- Move subject-specific comments onto subject results where possible
UPDATE "SubjectResult" sr
SET remark = COALESCE(sr.remark, r.comment)
FROM "Report" r
JOIN "Subject" s ON s.id = r."subjectId"
JOIN (SELECT name, MIN(id) keep_id FROM "Subject" GROUP BY name) c ON c.name = s.name
WHERE r."subjectId" IS NOT NULL
  AND sr."studentId" = r."studentId"
  AND sr."termId" = r."termId"
  AND sr."subjectId" = c.keep_id
  AND (sr.remark IS NULL OR BTRIM(sr.remark) = '');

-- Delete non-kept reports
DELETE FROM "Report" r
WHERE NOT EXISTS (SELECT 1 FROM report_keep k WHERE k.id = r.id);

-- Map report teacher and remarks
UPDATE "Report" r
SET
  "teacherRemark" = COALESCE(r."teacherRemark", r.comment),
  "teacherId_new" = t.id,
  "publishedAt" = CASE WHEN r.status = 'PUBLISHED' THEN r."updatedAt" ELSE r."publishedAt" END,
  "termResultId" = tr.id
FROM report_keep k
LEFT JOIN "Teacher" t ON t."userId" = k."teacherId"
LEFT JOIN "TermResult" tr ON tr."studentId" = k."studentId" AND tr."termId" = k."termId"
WHERE r.id = k.id;

-- Copy class teacher remarks onto term results when empty
UPDATE "TermResult" tr
SET "classTeacherRemark" = COALESCE(tr."classTeacherRemark", r."teacherRemark")
FROM "Report" r
WHERE r."termResultId" = tr.id
  AND r."teacherRemark" IS NOT NULL
  AND (tr."classTeacherRemark" IS NULL OR BTRIM(tr."classTeacherRemark") = '');

/* =========================================================
   7. AUDIT / ACTIVITY / APPROVAL / NOTIFICATION SHIFTS
   ========================================================= */

UPDATE result_audit_logs a
SET
  "academicSessionId" = COALESCE(a."academicSessionId", a."sessionIdAcademic"),
  "clientSessionId" = COALESCE(a."clientSessionId", a."sessionId"),
  "teacherId_new" = COALESCE(a."teacherId_new", t.id)
FROM "Teacher" t
WHERE a."teacherId" IS NOT NULL AND t."userId" = a."teacherId";

-- fallback map teacherId text staff number
UPDATE result_audit_logs a
SET "teacherId_new" = t.id
FROM "Teacher" t
WHERE a."teacherId_new" IS NULL
  AND a."teacherId" IS NOT NULL
  AND t."staffNumber" = a."teacherId";

UPDATE teacher_activity_logs a
SET
  "academicSessionId" = COALESCE(a."academicSessionId", a."sessionIdAcademic"),
  "clientSessionId" = COALESCE(a."clientSessionId", a."sessionId"),
  "teacherId_new" = COALESCE(a."teacherId_new", t.id)
FROM "Teacher" t
WHERE a."teacherId" IS NOT NULL AND t."userId" = a."teacherId";

UPDATE teacher_activity_logs a
SET "teacherId_new" = t.id
FROM "Teacher" t
WHERE a."teacherId_new" IS NULL
  AND a."teacherId" IS NOT NULL
  AND t."staffNumber" = a."teacherId";

UPDATE result_approvals
SET
  "status_new" = CASE upper(status)
    WHEN 'APPROVED' THEN 'APPROVED'::"ApprovalStatus"
    WHEN 'REJECTED' THEN 'REJECTED'::"ApprovalStatus"
    ELSE 'PENDING'::"ApprovalStatus"
  END,
  "entityType_new" = CASE upper("entityType")
    WHEN 'RESULT' THEN 'TERM_RESULT'::"ApprovalEntityType"
    WHEN 'TERMRESULT' THEN 'TERM_RESULT'::"ApprovalEntityType"
    WHEN 'TERM_RESULT' THEN 'TERM_RESULT'::"ApprovalEntityType"
    WHEN 'REPORT' THEN 'REPORT'::"ApprovalEntityType"
    WHEN 'ASSESSMENT' THEN 'ASSESSMENT'::"ApprovalEntityType"
    ELSE 'SUBJECT_RESULT'::"ApprovalEntityType"
  END,
  "sessionId" = COALESCE("sessionId", "sessionIdAcademic");

-- Notifications: map department parents to all parents
UPDATE "Notification"
SET "recipientType" = 'ALL_PARENTS'
WHERE "recipientType"::text = 'DEPARTMENT_PARENTS';

/* =========================================================
   8. REPOINT SUBJECT FKS TO CANONICAL SUBJECT IDS
   ========================================================= */

UPDATE result_audit_logs a
SET "subjectId" = s."canonicalSubjectId"
FROM "Subject" s
WHERE a."subjectId" = s.id
  AND s."canonicalSubjectId" IS NOT NULL
  AND a."subjectId" <> s."canonicalSubjectId";

/* =========================================================
   9. DROP LEGACY FKs / INDEXES / COLUMNS / TABLES
   ========================================================= */

-- Drop FKs that block structural changes
ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "Class_departmentId_fkey";
ALTER TABLE "Grade" DROP CONSTRAINT IF EXISTS "Grade_classId_fkey";
ALTER TABLE "Grade" DROP CONSTRAINT IF EXISTS "Grade_sessionId_fkey";
ALTER TABLE "Grade" DROP CONSTRAINT IF EXISTS "Grade_studentId_fkey";
ALTER TABLE "Grade" DROP CONSTRAINT IF EXISTS "Grade_subjectId_fkey";
ALTER TABLE "Grade" DROP CONSTRAINT IF EXISTS "Grade_teacherId_fkey";
ALTER TABLE "Grade" DROP CONSTRAINT IF EXISTS "Grade_termId_fkey";
ALTER TABLE "Result" DROP CONSTRAINT IF EXISTS "Result_classId_fkey";
ALTER TABLE "Result" DROP CONSTRAINT IF EXISTS "Result_sessionId_fkey";
ALTER TABLE "Result" DROP CONSTRAINT IF EXISTS "Result_studentId_fkey";
ALTER TABLE "Result" DROP CONSTRAINT IF EXISTS "Result_termId_fkey";
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_departmentId_fkey";
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_classId_fkey";
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_studentId_fkey";
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_subjectId_fkey";
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_teacherId_fkey";
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_termId_fkey";
ALTER TABLE "Student" DROP CONSTRAINT IF EXISTS "Student_classId_fkey";
ALTER TABLE "Student" DROP CONSTRAINT IF EXISTS "Student_sessionId_fkey";
ALTER TABLE "Subject" DROP CONSTRAINT IF EXISTS "Subject_classId_fkey";
ALTER TABLE "Subject" DROP CONSTRAINT IF EXISTS "Subject_departmentId_fkey";
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_classId_fkey";
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_sessionIdAcademic_fkey";
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_studentId_fkey";
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_subjectId_fkey";
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_termId_fkey";
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_userId_fkey";
ALTER TABLE "teacher_activity_logs" DROP CONSTRAINT IF EXISTS "teacher_activity_logs_classId_fkey";
ALTER TABLE "teacher_activity_logs" DROP CONSTRAINT IF EXISTS "teacher_activity_logs_userId_fkey";

DROP INDEX IF EXISTS "Class_name_departmentId_key";
DROP INDEX IF EXISTS "Subject_name_departmentId_key";
DROP INDEX IF EXISTS "Subject_name_departmentId_classId_key";
DROP INDEX IF EXISTS "Term_name_key";
DROP INDEX IF EXISTS "Report_studentId_termId_idx";
DROP INDEX IF EXISTS "Student_admissionNo_key"; -- recreated below if needed; unique constraint may remain
DROP INDEX IF EXISTS "result_approvals_submittedByTeacherId_submittedAt_idx";
DROP INDEX IF EXISTS "result_approvals_classId_status_idx";
DROP INDEX IF EXISTS "result_audit_logs_teacherId_timestamp_idx";
DROP INDEX IF EXISTS "teacher_activity_logs_teacherId_timestamp_idx";

-- Drop legacy tables now that data is migrated
DROP TABLE IF EXISTS "Grade";
DROP TABLE IF EXISTS "Result";
DROP TABLE IF EXISTS "GradeScale";
DROP TABLE IF EXISTS "Department";

-- Drop duplicate subjects (non-canonical)
DELETE FROM "Subject" s
WHERE s."canonicalSubjectId" IS NOT NULL
  AND s.id <> s."canonicalSubjectId";

/* =========================================================
   10. FINAL COLUMN SHAPING
   ========================================================= */

-- Class final shape
ALTER TABLE "Class" DROP COLUMN IF EXISTS "departmentId";
ALTER TABLE "Class" DROP COLUMN IF EXISTS "level";
ALTER TABLE "Class" DROP COLUMN IF EXISTS "sort_order";
ALTER TABLE "Class" ALTER COLUMN "levelId" SET NOT NULL;

-- Student final shape
ALTER TABLE "Student" DROP COLUMN IF EXISTS "classId";
ALTER TABLE "Student" DROP COLUMN IF EXISTS "sessionId";
ALTER TABLE "Student" DROP COLUMN IF EXISTS "sex";
ALTER TABLE "Student" RENAME COLUMN "sex_new" TO "sex";

-- Subject final shape
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "departmentId";
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "classId";
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "maxScore";
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "section";
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "canonicalSubjectId";
ALTER TABLE "Subject" ALTER COLUMN "isActive" SET DEFAULT true;
UPDATE "Subject" SET "isActive" = true WHERE "isActive" IS NULL;
ALTER TABLE "Subject" ALTER COLUMN "isActive" SET NOT NULL;

-- Term final shape
ALTER TABLE "Term" ALTER COLUMN "sessionId" SET NOT NULL;
ALTER TABLE "Term" ALTER COLUMN "order" SET NOT NULL;
ALTER TABLE "Term" ALTER COLUMN "isActive" SET DEFAULT false;
UPDATE "Term" SET "isActive" = false WHERE "isActive" IS NULL;
ALTER TABLE "Term" ALTER COLUMN "isActive" SET NOT NULL;

-- User drop legacy teacherId
ALTER TABLE "User" DROP COLUMN IF EXISTS "teacherId";

-- Notification drop department
ALTER TABLE "Notification" DROP COLUMN IF EXISTS "departmentId";

-- RecipientType remove DEPARTMENT_PARENTS
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'RecipientType' AND e.enumlabel = 'DEPARTMENT_PARENTS'
  ) THEN
    CREATE TYPE "RecipientType_new" AS ENUM ('ALL_PARENTS', 'CLASS_PARENTS', 'SPECIFIC_PARENTS');
    ALTER TABLE "Notification" ALTER COLUMN "recipientType" DROP DEFAULT;
    ALTER TABLE "Notification"
      ALTER COLUMN "recipientType" TYPE "RecipientType_new"
      USING ("recipientType"::text::"RecipientType_new");
    DROP TYPE "RecipientType";
    ALTER TYPE "RecipientType_new" RENAME TO "RecipientType";
    ALTER TABLE "Notification" ALTER COLUMN "recipientType" SET DEFAULT 'ALL_PARENTS'::"RecipientType";
  END IF;
END $$;

-- Report final shape
ALTER TABLE "Report" DROP COLUMN IF EXISTS "subjectId";
ALTER TABLE "Report" DROP COLUMN IF EXISTS "grade";
ALTER TABLE "Report" DROP COLUMN IF EXISTS "comment";
ALTER TABLE "Report" DROP COLUMN IF EXISTS "attendance";
ALTER TABLE "Report" DROP COLUMN IF EXISTS "conduct";
ALTER TABLE "Report" DROP COLUMN IF EXISTS "teacherId";
ALTER TABLE "Report" RENAME COLUMN "teacherId_new" TO "teacherId";

-- Audit logs final shape
ALTER TABLE "result_audit_logs" DROP COLUMN IF EXISTS "sessionId";
ALTER TABLE "result_audit_logs" DROP COLUMN IF EXISTS "sessionIdAcademic";
ALTER TABLE "result_audit_logs" DROP COLUMN IF EXISTS "teacherFullName";
ALTER TABLE "result_audit_logs" DROP COLUMN IF EXISTS "teacherId";
ALTER TABLE "result_audit_logs" RENAME COLUMN "teacherId_new" TO "teacherId";
ALTER TABLE "result_audit_logs" ALTER COLUMN "ipAddress" DROP NOT NULL;
ALTER TABLE "result_audit_logs" ALTER COLUMN "newValues" DROP NOT NULL;

-- Activity logs final shape
ALTER TABLE "teacher_activity_logs" DROP COLUMN IF EXISTS "sessionId";
ALTER TABLE "teacher_activity_logs" DROP COLUMN IF EXISTS "sessionIdAcademic";
ALTER TABLE "teacher_activity_logs" DROP COLUMN IF EXISTS "teacherFullName";
ALTER TABLE "teacher_activity_logs" DROP COLUMN IF EXISTS "teacherId";
ALTER TABLE "teacher_activity_logs" RENAME COLUMN "teacherId_new" TO "teacherId";
ALTER TABLE "teacher_activity_logs" ALTER COLUMN "ipAddress" DROP NOT NULL;

-- Approvals final shape
ALTER TABLE "result_approvals" DROP COLUMN IF EXISTS "entityType";
ALTER TABLE "result_approvals" DROP COLUMN IF EXISTS "entityTypeFull";
ALTER TABLE "result_approvals" DROP COLUMN IF EXISTS "status";
ALTER TABLE "result_approvals" DROP COLUMN IF EXISTS "sessionIdAcademic";
ALTER TABLE "result_approvals" DROP COLUMN IF EXISTS "approvedByTeacherId";
ALTER TABLE "result_approvals" DROP COLUMN IF EXISTS "approvedByTeacherName";
ALTER TABLE "result_approvals" DROP COLUMN IF EXISTS "rejectedByTeacherId";
ALTER TABLE "result_approvals" DROP COLUMN IF EXISTS "rejectedByTeacherName";
ALTER TABLE "result_approvals" DROP COLUMN IF EXISTS "submittedByTeacherId";
ALTER TABLE "result_approvals" DROP COLUMN IF EXISTS "submittedByTeacherName";
ALTER TABLE "result_approvals" RENAME COLUMN "entityType_new" TO "entityType";
ALTER TABLE "result_approvals" RENAME COLUMN "status_new" TO "status";
UPDATE "result_approvals" SET "entityType" = 'SUBJECT_RESULT' WHERE "entityType" IS NULL;
UPDATE "result_approvals" SET "status" = 'PENDING' WHERE "status" IS NULL;
ALTER TABLE "result_approvals" ALTER COLUMN "entityType" SET NOT NULL;
ALTER TABLE "result_approvals" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "result_approvals" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"ApprovalStatus";

/* =========================================================
   11. INDEXES + FOREIGN KEYS
   ========================================================= */

CREATE UNIQUE INDEX IF NOT EXISTS "Class_levelId_name_key" ON "Class"("levelId", "name");
CREATE INDEX IF NOT EXISTS "Class_formTeacherId_idx" ON "Class"("formTeacherId");

CREATE UNIQUE INDEX IF NOT EXISTS "Term_sessionId_name_key" ON "Term"("sessionId", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "Term_sessionId_order_key" ON "Term"("sessionId", "order");
CREATE INDEX IF NOT EXISTS "Term_sessionId_idx" ON "Term"("sessionId");
CREATE INDEX IF NOT EXISTS "Term_isActive_idx" ON "Term"("isActive");

CREATE UNIQUE INDEX IF NOT EXISTS "Subject_name_key" ON "Subject"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Subject_code_key" ON "Subject"("code");
CREATE INDEX IF NOT EXISTS "Subject_isActive_idx" ON "Subject"("isActive");

CREATE INDEX IF NOT EXISTS "Student_lastName_firstName_idx" ON "Student"("lastName", "firstName");
CREATE UNIQUE INDEX IF NOT EXISTS "Student_admissionNo_key" ON "Student"("admissionNo");

CREATE UNIQUE INDEX IF NOT EXISTS "Report_studentId_termId_key" ON "Report"("studentId", "termId");
CREATE UNIQUE INDEX IF NOT EXISTS "Report_termResultId_key" ON "Report"("termResultId");
CREATE INDEX IF NOT EXISTS "Report_termId_idx" ON "Report"("termId");
CREATE INDEX IF NOT EXISTS "Report_status_idx" ON "Report"("status");
CREATE INDEX IF NOT EXISTS "Report_teacherId_idx" ON "Report"("teacherId");

CREATE INDEX IF NOT EXISTS "Notification_sentAt_idx" ON "Notification"("sentAt");
CREATE INDEX IF NOT EXISTS "Notification_classId_idx" ON "Notification"("classId");
CREATE INDEX IF NOT EXISTS "NotificationRecipient_parentId_read_idx" ON "NotificationRecipient"("parentId", "read");
CREATE INDEX IF NOT EXISTS "StudentParent_parentId_idx" ON "StudentParent"("parentId");

CREATE INDEX IF NOT EXISTS "result_approvals_entityType_entityId_idx" ON "result_approvals"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "result_approvals_classId_status_idx" ON "result_approvals"("classId", "status");
CREATE INDEX IF NOT EXISTS "result_audit_logs_teacherId_timestamp_idx" ON "result_audit_logs"("teacherId", "timestamp");
CREATE INDEX IF NOT EXISTS "teacher_activity_logs_teacherId_timestamp_idx" ON "teacher_activity_logs"("teacherId", "timestamp");
CREATE INDEX IF NOT EXISTS "teacher_activity_logs_academicSessionId_termId_idx" ON "teacher_activity_logs"("academicSessionId", "termId");

-- Foreign keys
ALTER TABLE "Teacher" DROP CONSTRAINT IF EXISTS "Teacher_userId_fkey";
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "Class_levelId_fkey";
ALTER TABLE "Class" ADD CONSTRAINT "Class_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "ClassLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "Class_formTeacherId_fkey";
ALTER TABLE "Class" ADD CONSTRAINT "Class_formTeacherId_fkey" FOREIGN KEY ("formTeacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Term" DROP CONSTRAINT IF EXISTS "Term_sessionId_fkey";
ALTER TABLE "Term" ADD CONSTRAINT "Term_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_studentId_fkey";
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_sessionId_fkey";
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_classId_fkey";
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SubjectOffering" DROP CONSTRAINT IF EXISTS "SubjectOffering_subjectId_fkey";
ALTER TABLE "SubjectOffering" ADD CONSTRAINT "SubjectOffering_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectOffering" DROP CONSTRAINT IF EXISTS "SubjectOffering_classId_fkey";
ALTER TABLE "SubjectOffering" ADD CONSTRAINT "SubjectOffering_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectOffering" DROP CONSTRAINT IF EXISTS "SubjectOffering_sessionId_fkey";
ALTER TABLE "SubjectOffering" ADD CONSTRAINT "SubjectOffering_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeacherSubject" DROP CONSTRAINT IF EXISTS "TeacherSubject_teacherId_fkey";
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherSubject" DROP CONSTRAINT IF EXISTS "TeacherSubject_offeringId_fkey";
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "SubjectOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentSubject" DROP CONSTRAINT IF EXISTS "StudentSubject_studentId_fkey";
ALTER TABLE "StudentSubject" ADD CONSTRAINT "StudentSubject_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentSubject" DROP CONSTRAINT IF EXISTS "StudentSubject_offeringId_fkey";
ALTER TABLE "StudentSubject" ADD CONSTRAINT "StudentSubject_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "SubjectOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Assessment" DROP CONSTRAINT IF EXISTS "Assessment_offeringId_fkey";
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "SubjectOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assessment" DROP CONSTRAINT IF EXISTS "Assessment_termId_fkey";
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assessment" DROP CONSTRAINT IF EXISTS "Assessment_teacherId_fkey";
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AssessmentScore" DROP CONSTRAINT IF EXISTS "AssessmentScore_assessmentId_fkey";
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentScore" DROP CONSTRAINT IF EXISTS "AssessmentScore_studentId_fkey";
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SubjectResult" DROP CONSTRAINT IF EXISTS "SubjectResult_studentId_fkey";
ALTER TABLE "SubjectResult" ADD CONSTRAINT "SubjectResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubjectResult" DROP CONSTRAINT IF EXISTS "SubjectResult_subjectId_fkey";
ALTER TABLE "SubjectResult" ADD CONSTRAINT "SubjectResult_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectResult" DROP CONSTRAINT IF EXISTS "SubjectResult_classId_fkey";
ALTER TABLE "SubjectResult" ADD CONSTRAINT "SubjectResult_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectResult" DROP CONSTRAINT IF EXISTS "SubjectResult_termId_fkey";
ALTER TABLE "SubjectResult" ADD CONSTRAINT "SubjectResult_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubjectResult" DROP CONSTRAINT IF EXISTS "SubjectResult_sessionId_fkey";
ALTER TABLE "SubjectResult" ADD CONSTRAINT "SubjectResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubjectResult" DROP CONSTRAINT IF EXISTS "SubjectResult_teacherId_fkey";
ALTER TABLE "SubjectResult" ADD CONSTRAINT "SubjectResult_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TermResult" DROP CONSTRAINT IF EXISTS "TermResult_studentId_fkey";
ALTER TABLE "TermResult" ADD CONSTRAINT "TermResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TermResult" DROP CONSTRAINT IF EXISTS "TermResult_classId_fkey";
ALTER TABLE "TermResult" ADD CONSTRAINT "TermResult_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TermResult" DROP CONSTRAINT IF EXISTS "TermResult_termId_fkey";
ALTER TABLE "TermResult" ADD CONSTRAINT "TermResult_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TermResult" DROP CONSTRAINT IF EXISTS "TermResult_sessionId_fkey";
ALTER TABLE "TermResult" ADD CONSTRAINT "TermResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GradeBand" DROP CONSTRAINT IF EXISTS "GradeBand_scaleId_fkey";
ALTER TABLE "GradeBand" ADD CONSTRAINT "GradeBand_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "GradingScale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AttendanceRecord" DROP CONSTRAINT IF EXISTS "AttendanceRecord_studentId_fkey";
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" DROP CONSTRAINT IF EXISTS "AttendanceRecord_termId_fkey";
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentEvaluation" DROP CONSTRAINT IF EXISTS "StudentEvaluation_studentId_fkey";
ALTER TABLE "StudentEvaluation" ADD CONSTRAINT "StudentEvaluation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentEvaluation" DROP CONSTRAINT IF EXISTS "StudentEvaluation_termId_fkey";
ALTER TABLE "StudentEvaluation" ADD CONSTRAINT "StudentEvaluation_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentEvaluation" DROP CONSTRAINT IF EXISTS "StudentEvaluation_categoryId_fkey";
ALTER TABLE "StudentEvaluation" ADD CONSTRAINT "StudentEvaluation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EvaluationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_studentId_fkey";
ALTER TABLE "Report" ADD CONSTRAINT "Report_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_termId_fkey";
ALTER TABLE "Report" ADD CONSTRAINT "Report_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_termResultId_fkey";
ALTER TABLE "Report" ADD CONSTRAINT "Report_termResultId_fkey" FOREIGN KEY ("termResultId") REFERENCES "TermResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_teacherId_fkey";
ALTER TABLE "Report" ADD CONSTRAINT "Report_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ExternalExam" DROP CONSTRAINT IF EXISTS "ExternalExam_studentId_fkey";
ALTER TABLE "ExternalExam" ADD CONSTRAINT "ExternalExam_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExternalExamSubject" DROP CONSTRAINT IF EXISTS "ExternalExamSubject_examId_fkey";
ALTER TABLE "ExternalExamSubject" ADD CONSTRAINT "ExternalExamSubject_examId_fkey" FOREIGN KEY ("examId") REFERENCES "ExternalExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_classId_fkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_senderId_fkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "NotificationRecipient" DROP CONSTRAINT IF EXISTS "NotificationRecipient_notificationId_fkey";
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationRecipient" DROP CONSTRAINT IF EXISTS "NotificationRecipient_parentId_fkey";
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "result_approvals" DROP CONSTRAINT IF EXISTS "result_approvals_submittedBy_fkey";
ALTER TABLE "result_approvals" ADD CONSTRAINT "result_approvals_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "result_approvals" DROP CONSTRAINT IF EXISTS "result_approvals_approvedBy_fkey";
ALTER TABLE "result_approvals" ADD CONSTRAINT "result_approvals_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "result_approvals" DROP CONSTRAINT IF EXISTS "result_approvals_rejectedBy_fkey";
ALTER TABLE "result_approvals" ADD CONSTRAINT "result_approvals_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_userId_fkey";
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_academicSessionId_fkey";
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_classId_fkey";
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_studentId_fkey";
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_subjectId_fkey";
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_termId_fkey";
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "result_audit_logs" DROP CONSTRAINT IF EXISTS "result_audit_logs_teacherId_fkey";
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "teacher_activity_logs" DROP CONSTRAINT IF EXISTS "teacher_activity_logs_userId_fkey";
ALTER TABLE "teacher_activity_logs" ADD CONSTRAINT "teacher_activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "teacher_activity_logs" DROP CONSTRAINT IF EXISTS "teacher_activity_logs_classId_fkey";
ALTER TABLE "teacher_activity_logs" ADD CONSTRAINT "teacher_activity_logs_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "teacher_activity_logs" DROP CONSTRAINT IF EXISTS "teacher_activity_logs_academicSessionId_fkey";
ALTER TABLE "teacher_activity_logs" ADD CONSTRAINT "teacher_activity_logs_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "teacher_activity_logs" DROP CONSTRAINT IF EXISTS "teacher_activity_logs_termId_fkey";
ALTER TABLE "teacher_activity_logs" ADD CONSTRAINT "teacher_activity_logs_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "teacher_activity_logs" DROP CONSTRAINT IF EXISTS "teacher_activity_logs_teacherId_fkey";
ALTER TABLE "teacher_activity_logs" ADD CONSTRAINT "teacher_activity_logs_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
