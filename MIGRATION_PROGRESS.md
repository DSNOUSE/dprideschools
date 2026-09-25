# Migration Progress: Old PHP Database to New Prisma Schema

## Date: September 21, 2026

## Objective
Set up a migration script to convert the old PHP-based school management system data structure and combine it with the current NEON database data into a unified Prisma schema.

## Completed Tasks

### 1. Analysis of Old System
- **Location**: `C:\Projects\dprideschools\backup`
- **Database Type**: MySQL
- **Database Name**: `dpridein_db`
- **Credentials**: supplied through `OLD_DB_HOST`, `OLD_DB_PORT`, `OLD_DB_NAME`, `OLD_DB_USER`, and `OLD_DB_PASSWORD` at runtime

### 2. Old Database Structure Identified

#### Key Tables:
- `grades` - Student grades (GRADE_ID, IDNO, CLASS_ID, TERM_ID, SESSION_ID, SUBJ_ID, FIRST, SECOND, FOURTH, AVE)
- `tblstudent` - Student records (IDNO, CLASS_ID, LNAME, FNAME, MNAME, SEX, BDAY, ADMIT_NUMBER)
- `subject` - Subject information (SUBJ_ID, SUBJ_CODE, SUBJECT_NAME)
- `classes` - Class information (CLASS_ID, CLASS_NAME, DEPARTMENT_ID)
- `terms` - Term information (TERM_ID, TERM, SESSION_ID)
- `session` - Session information (SESSION_ID, SESSION)

### 3. Migration Script Created

**File**: `scripts/migrate-old-data.ts`

#### Features:
- ✅ Connects to old MySQL database
- ✅ Migrates in dependency order (Sessions → Terms → Classes → Subjects → Students → Grades)
- ✅ Maps old data structures to new Prisma models
- ✅ Graceful degradation (continues with NEON data if old DB unavailable)
- ✅ Comprehensive error handling and logging
- ✅ Idempotent (can run multiple times without duplicates)
- ✅ TypeScript for type safety

#### Data Mapping Logic:
- **Sex Mapping**: M/F → MALE/FEMALE
- **Section Mapping**: 
  - Nursery/Pre-Nursery/Discovery → EARLY_YEARS
  - Primary/Year 1-6 → PRIMARY
  - Others → SECONDARY
- **Grade Calculation**:
  - Total = FIRST + SECOND + FOURTH
  - 80+ → A (Excellent)
  - 70-79 → B (Very Good)
  - 60-69 → C (Good)
  - 50-59 → D (Fair)
  - Below 50 → F (Fail)

### 4. Documentation Created

**File**: `scripts/MIGRATION_README.md`

#### Contents:
- Overview of migration process
- Old vs new database structure comparison
- Installation instructions
- Usage guide
- Data mapping rules
- Troubleshooting tips
- Rollback procedures

### 5. Package Configuration Updated

**File**: `package.json`

#### Changes:
- Added dependency: `mysql2` (for MySQL connection)
- Added dev dependency: `tsx` (for TypeScript execution)
- Added npm script: `migrate:old-data`

## Current Status

### ✅ Completed:
- Installed migration dependencies (`mysql2` and `tsx`)
- Reworked `scripts/migrate-old-data.ts` to use explicit legacy-ID maps
- Removed the hardcoded old-database password from source code
- Added historical enrollments from actual grade class/session assignments
- Added published `TermResult` aggregation and class position calculation
- Made repeated runs refresh matching migrated results without creating duplicates

### 📋 Next Steps:
1. Configure `OLD_DB_*` and `DATABASE_URL` in the execution environment
2. Run migration script: `npm run migrate:old-data`
3. Verify migrated data in NEON database
4. Test student and parent historical-result access

## Migration Workflow

```
1. Connect to Old MySQL Database
   ↓
2. Migrate Sessions
   ↓
3. Migrate Terms (linked to Sessions)
   ↓
4. Migrate Classes (with ClassLevels)
   ↓
5. Migrate Subjects
   ↓
6. Migrate Students
   ↓
7. Migrate Grades (as SubjectResults)
   ↓
8. Create historical Enrollments
   ↓
9. Build Term Results and positions
   ↓
10. Verify and Test
```

## Important Notes

- The script is designed to be safe and idempotent
- It will not modify the old MySQL database
- Existing NEON data is preserved
- The source password is required at runtime and is never stored in the script
- All operations are logged to console for audit trail

## Files Modified/Created

### Created:
- `scripts/migrate-old-data.ts` - Main migration script
- `scripts/MIGRATION_README.md` - Documentation
- `MIGRATION_PROGRESS.md` - This progress file

### Modified:
- `package.json` - Added dependencies and npm script

## Database Connection Details

### Old MySQL Database:
Configure the connection through `OLD_DB_HOST`, `OLD_DB_PORT`, `OLD_DB_NAME`, `OLD_DB_USER`, and `OLD_DB_PASSWORD`. Credentials are intentionally not documented in this repository.

### New NEON Database:
```
Connection: Configured via DATABASE_URL environment variable
Provider: PostgreSQL
ORM: Prisma
```

## Known Issues

1. **Dependency Installation**: npm install is taking longer than expected
   - Possible causes: Network issues, large dependency tree
   - Workaround: Try installing packages individually or use --force flag

## Backup Folder Structure

The backup folder contains:
- Main PHP application code
- Nursery section (`nursery/`)
- Primary section (`primary/`)
- Demo version (`demo/`)
- Additional section (`fb/`)

**Note**: The backup folder contains PHP application code only, not database dumps. The actual old data resides in the MySQL database.

## Verification Checklist

Once migration is complete:

- [ ] Verify all sessions migrated
- [ ] Verify all terms migrated with correct session links
- [ ] Verify all classes migrated with correct sections
- [ ] Verify all subjects migrated
- [ ] Verify all students migrated with correct admission numbers
- [ ] Verify all grades migrated as SubjectResults
- [ ] Verify enrollments created for all students
- [ ] Test application with migrated data
- [ ] Check for any data inconsistencies

## Rollback Plan

If issues occur after migration:
1. Delete migrated data from NEON database
2. Restore from database backup taken before migration
3. Review migration logs for specific issues
4. Fix mapping logic if needed
5. Re-run migration

## Contact Information

For issues or questions:
- Review `scripts/MIGRATION_README.md` for detailed troubleshooting
- Check console output during migration for specific errors
- Verify database credentials and connectivity

---

**Last Updated**: September 21, 2026
**Status**: Migration script ready, awaiting dependency installation completion
