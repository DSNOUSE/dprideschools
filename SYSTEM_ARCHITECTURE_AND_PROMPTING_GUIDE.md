# DPRIDE International School - System Architecture & Prompting Guide

## 1. Executive Summary & DNA
This document defines the core architecture, data contracts, academic progression rules, and prompting conventions for the DPRIDE International School management platform.

### Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript
- **Styling**: Tailwind CSS v4, custom CSS variables, Material UI Icons
- **Database & ORM**: PostgreSQL (Neon Database) via Prisma ORM 7.2 using Driver Adapters (`@prisma/adapter-pg` + `pg.Pool`)
- **Authentication**: NextAuth.js (Credentials Provider with role-based JWT claims: `Admin`, `Teacher`, `Student`, `Parent`)
- **Content Management**: Sanity Studio v3 mounted at `/admin/studio`
- **Testing**: Vitest (`vitest.config.ts`)

---

## 2. Directory & Component Structure
```
c:\Projects\dprideschools\
├── app/
│   ├── (public)/              # Homepage, About, News, Admissions, Contact
│   ├── results/               # Public / Parent result checker
│   ├── student-results/       # Authenticated student result portal & session selector
│   ├── signin/                # NextAuth credential login
│   ├── admin/                 # RBAC Protected Admin & Teacher Portal
│   │   ├── academics/         # Grades management, subjects, classes, sessions, terms
│   │   ├── students/          # Student registration, profile, enrollment history
│   │   └── positions/         # Position calculation & ranking
│   └── api/
│       ├── academics/         # Classes, sessions, terms, subjects, grades
│       ├── results/check/     # Public result check endpoint (Zod validated, rate-limited)
│       ├── student-results/   # Authenticated student history & results
│       └── admin/             # Position ranking, audit logs, student admin endpoints
├── src/
│   ├── components/            # Reusable UI components (Navbar, Footer, Button, Container)
│   └── lib/
│       ├── prisma.ts          # Singleton PrismaClient with @prisma/adapter-pg
│       ├── auth.ts            # NextAuth options and role callbacks
│       ├── results/           # Result service, schemas, rate limiter, calculations
│       └── audit/             # Teacher activity and result audit logging
├── prisma/
│   └── schema.prisma          # PostgreSQL relational schema
└── scripts/                   # Database maintenance, migrations, seeders, diagnostics
```

---

## 3. Database & Academic Data Models

### Academic Periods
- **`Session`**: Academic year (e.g., `2024/2025`, `2025/2026`, `2026/2027`). Exactly one session is typically marked `isActive: true`.
- **`Term`**: Term division within a session (`First Term`, `Second Term`, `Third Term`). Each term links directly to a `sessionId`.

### Classes & Levels
- **`ClassLevel`**: Grouping level (Pre-Nursery, Nursery, Lower Primary, Upper Primary, Junior Secondary).
- **`Class`**: Specific classroom (e.g., `YEAR 7`, `YEAR 8`, `YEAR 9`).
- **`Enrollment`**: Relational junction between `Student`, `Class`, and `Session`. Tracks student status (`ACTIVE`, `COMPLETED`, `PROMOTED`, etc.).

### Grade Management Hierarchy
1. **`SubjectOffering`**: Class $\leftrightarrow$ Subject $\leftrightarrow$ Session relationship.
2. **`Assessment`**: Assessment definition under a `SubjectOffering` and `Term`:
   - `CA 1`: Continuous Assessment 1 (Max Score: 10, Weight: 10)
   - `CA 2`: Continuous Assessment 2 (Max Score: 10, Weight: 10)
   - `Exam`: Terminal Examination (Max Score: 80, Weight: 80)
   - **Total**: 100 marks.
3. **`AssessmentScore`**: The student's recorded numeric score for an assessment.
4. **`SubjectResult`**: Computed per-subject outcome for a student, class, session, and term.
   - `totalScore` = $CA_1 + CA_2 + Exam$
   - `grade` = A (70-100), B (60-69), C (50-59), D (45-49), E (40-44), F (0-39)
   - `status`: `DRAFT` | `SUBMITTED` | `APPROVED` | `PUBLISHED`
5. **`TermResult`**: Class aggregate for a student:
   - `totalScore`: Sum of all subject totals
   - `averageScore`: Total score divided by number of subjects
   - `position`: Rank within the class for that session and term


---

## 4. Academic Progression Principles

1. **Session Isolation**:
   - Scores and enrollment records are strictly bound to a single `sessionId`.
   - Results for session `2025/2026` must reflect the class the student was in during `2025/2026`.

2. **Progression / Promotion Workflow**:
   - A student currently in **Year 8** during `2026/2027` (Current Session) was in **Year 7** during `2025/2026` (Last Session).
   - The student must maintain:
     - Enrollment A: `sessionId` = `2025/2026`, `classId` = `YEAR 7`
     - Enrollment B: `sessionId` = `2026/2027`, `classId` = `YEAR 8`
   - Checking results for `2025/2026` must query against Year 7. Querying against Year 8 will result in `CLASS_MISMATCH`.

---

## 5. Script & Node.js Execution Standards
When writing diagnostic or maintenance scripts in Node.js for this repository:
1. Always load environment variables using `dotenv/config` or reading `.env`.
2. Prisma 7.2 requires the `@prisma/adapter-pg` driver adapter. Never instantiate `new PrismaClient()` without `{ adapter }`.
   ```javascript
   const { PrismaClient } = require('@prisma/client');
   const { PrismaPg } = require('@prisma/adapter-pg');
   const { Pool } = require('pg');

   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   const adapter = new PrismaPg(pool);
   const prisma = new PrismaClient({ adapter });
   ```
3. Always close the pool (`await pool.end()`) and disconnect Prisma (`await prisma.$disconnect()`) on exit.

---

## 6. Prompting Guide & Templates

### Template A: Investigating or Fixing Student Results
```markdown
Context:
- Target Student: [Name / Admission Number]
- Session: [e.g. 2025/2026 or 2026/2027]
- Term: [First Term / Second Term / Third Term]
- Expected Class for this session: [e.g. YEAR 7]

Requirements:
1. Check the student's Enrollment record for the specified session.
2. Confirm that SubjectResult, AssessmentScore, and TermResult records reference the correct classId and sessionId.
3. Verify that the score breakdown equals the sum of CA1 (10) + CA2 (10) + Exam (80).
4. Run position recalculation for the affected class if scores change.
```

### Template B: Adding / Promoting Students Across Sessions
```markdown
Context:
- Source Session: [e.g. 2025/2026] in Class [e.g. YEAR 7]
- Target Session: [e.g. 2026/2027] in Class [e.g. YEAR 8]

Requirements:
1. Preserve existing Enrollment and SubjectResults in the source session.
2. Create a new Enrollment record in the target session with the promoted class.
3. Ensure no duplicate active enrollments exist within the same session.
```

### Template C: Creating or Modifying API Endpoints
```markdown
Requirements:
1. Adhere to Next.js 16 App Router conventions under `app/api/...`.
2. Validate incoming payloads with Zod schemas.
3. Check role authorization (`Administrator`, `Teacher`, etc.) via NextAuth getServerSession.
4. Log administrative and grading changes via `createAuditLog` / `logTeacherActivity`.
5. Return standardized JSON response envelopes with HTTP status codes.
```

   - `status`: `DRAFT` | `SUBMITTED` | `APPROVED` | `PUBLISHED`
