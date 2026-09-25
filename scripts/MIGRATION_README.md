# Migration Script: Old PHP Database to New Prisma Schema

## Overview

This migration script transfers data from the old PHP-based school management system to the new Prisma-based schema in the NEON database.

## Old Database Structure

The old PHP system used MySQL with the following key tables:
- `grades` - Student grades (GRADE_ID, IDNO, CLASS_ID, TERM_ID, SESSION_ID, SUBJ_ID, FIRST, SECOND, FOURTH, AVE)
- `tblstudent` - Student records (IDNO, CLASS_ID, LNAME, FNAME, MNAME, SEX, BDAY, ADMIT_NUMBER)
- `subject` - Subject information (SUBJ_ID, SUBJ_CODE, SUBJECT_NAME)
- `classes` - Class information (CLASS_ID, CLASS_NAME, DEPARTMENT_ID)
- `terms` - Term information (TERM_ID, TERM, SESSION_ID)
- `session` - Session information (SESSION_ID, SESSION)

## New Database Structure

The new system uses PostgreSQL with Prisma ORM and includes:
- `Student` - Student records with enrollment tracking
- `Subject` - Subject information with offerings
- `Class` - Class information with class levels
- `Session` - Academic sessions
- `Term` - Terms within sessions
- `SubjectResult` - Detailed subject-level results
- `TermResult` - Overall term results
- `Enrollment` - Student enrollment tracking

## Prerequisites

1. **Old MySQL Database Access**: The old MySQL database must be accessible
   - Configure `OLD_DB_HOST`, `OLD_DB_PORT`, `OLD_DB_NAME`, `OLD_DB_USER`, and `OLD_DB_PASSWORD` in the shell or local environment.
   - Do not commit the source password to this repository.

2. **New NEON Database**: The new NEON database must be configured
   - DATABASE_URL environment variable must be set

3. **Dependencies**: Install required packages
   ```bash
   npm install mysql2 tsx
   ```

## Installation

1. Install the migration dependencies:
   ```bash
   npm install mysql2 tsx
   ```

2. Ensure your environment variables are set:
   ```bash
   # Check your .env file
   DATABASE_URL=postgresql://...
   ```

## Usage

### Run the Migration

```bash
npm run migrate:old-data
```

PowerShell example:

```powershell
$env:OLD_DB_HOST = "localhost"
$env:OLD_DB_PORT = "3306"
$env:OLD_DB_NAME = "dpridein_db"
$env:OLD_DB_USER = "dpridein_db"
$env:OLD_DB_PASSWORD = "<source-password>"
npm run migrate:old-data
```

### What the Script Does

The migration process follows this order:

1. **Connects to Old Database**: Attempts to connect to the old MySQL database
   - The script stops before writing if source credentials are missing or the source cannot be read

2. **Migrates Sessions**: Transfers academic sessions from old to new system and keeps an explicit legacy-session-ID map
   - Creates sessions if they don't exist
   - Preserves session names

3. **Migrates Terms**: Transfers terms and links them to the correct legacy session, rather than matching term order globally
   - Creates terms with proper session relationships
   - Handles missing SESSION_ID gracefully

4. **Migrates Classes**: Transfers class information with stable legacy class codes
   - Maps class names to school sections (EARLY_YEARS, PRIMARY, SECONDARY)
   - Creates ClassLevel entries for organization

5. **Migrates Subjects**: Transfers subject information
   - Creates subjects with codes and descriptions
   - Preserves subject names and codes

6. **Migrates Students**: Transfers student records
   - Maps sex values (M/F to MALE/FEMALE)
   - Preserves admission numbers and personal details
   - Handles missing data gracefully

7. **Migrates Grades**: Transfers grade records using explicit student, class, subject, session, and term maps
   - Converts old grade structure to new SubjectResult format
   - Preserves the legacy `AVE` value when present; otherwise calculates a score from FIRST, SECOND, and FOURTH
   - Generates grades (A, B, C, D, F) from the imported score
   - Creates remarks based on performance

8. **Creates Enrollments**: Creates one enrollment per student/session from the classes present in that session's historical grades
9. **Builds Term Results**: Aggregates published subject results, calculates totals and averages, and recalculates class positions

## Data Mapping

### Sex Mapping
- `M` or `MALE` → `MALE`
- `F` or `FEMALE` → `FEMALE`
- Other values → `null`

### Section Mapping
- Class names containing "nursery", "pre-nursery", "discovery" → `EARLY_YEARS`
- Class names containing "primary", "year 1-6" → `PRIMARY`
- Other classes → `SECONDARY`

### Grade Calculation
- Total Score = FIRST + SECOND + FOURTH
- Percentage = (Total Score / Max Score) * 100
- Grade:
  - 80+ → A (Excellent)
  - 70-79 → B (Very Good)
  - 60-69 → C (Good)
  - 50-59 → D (Fair)
  - Below 50 → F (Fail)

## Error Handling

The script includes comprehensive error handling:

- **Database Connection**: Requires explicit source credentials and stops before destination writes if the source cannot be opened
- **Missing Records**: Logs warnings for missing students, classes, subjects, etc.
- **Duplicate Data**: Skips records that already exist in the new system
- **Type Safety**: Uses TypeScript interfaces for type safety

## Output

The script provides detailed console output:

- ✅ Success indicators for created records
- ⏭️ Skip indicators for existing records
- ⚠️ Warning indicators for missing data
- ❌ Error indicators for failures
- 📊 Summary statistics for each migration step

## Troubleshooting

### Old Database Connection Fails

If you see "Failed to connect to old MySQL database":
1. Check if MySQL is running on localhost
2. Verify the `OLD_DB_*` environment variables
3. Ensure the old database exists
4. The script will continue with NEON data only

### Missing Records

If you see warnings about missing students/classes/subjects:
1. Run the migration in the correct order (sessions → terms → classes → subjects → students → grades)
2. Check if the old database has the expected data
3. Verify the mapping logic in the script

### Type Errors

If you encounter TypeScript errors:
1. Ensure all dependencies are installed: `npm install`
2. Check that tsx is installed: `npm install -D tsx`
3. Verify the Prisma client is generated: `npx prisma generate`

## Rollback

To rollback changes:
1. Delete the migrated data from the NEON database
2. Or restore from a database backup taken before migration

## Notes

- The script is idempotent - running it multiple times won't create duplicates
- It preserves existing data in the NEON database
- The old MySQL database is not modified during migration
- All migrations are logged to the console for audit purposes

## Support

For issues or questions:
1. Check the console output for specific error messages
2. Verify the old database structure matches expectations
3. Ensure the NEON database schema is up to date
4. Review the mapping logic in the script for custom requirements
