const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      const unquoted = value.replace(/^"|"$/g, '');
      if (!process.env[key]) process.env[key] = unquoted;
    });
  }
} catch (err) {}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(2);
  }

  console.log('Searching for Hafsat Bint Abubakar in remote database...\n');

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log('Connected to remote database\n');

    console.log('='.repeat(70));
    console.log('SEARCHING FOR: Hafsat Bint Abubakar');
    console.log('='.repeat(70));
    console.log('');

    console.log('1. Querying by firstName Hafsat...');
    const byFirstName = await prisma.student.findFirst({
      where: {
        firstName: {
          equals: 'Hafsat',
          mode: 'insensitive'
        }
      },
      include: {
        enrollments: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            class: {
              include: {
                level: true
              }
            },
            session: true,
            term: true
          }
        },
        subjectResults: {
          include: {
            subject: true,
            term: true,
            session: true
          },
          take: 10
        },
        termResults: {
          include: {
            term: true,
            session: true
          },
          take: 5
        },
        reports: {
          include: {
            term: true,
            session: true
          },
          take: 5
        }
      }
    });

    if (byFirstName) {
      console.log('   FOUND STUDENT RECORD\n');
      console.log('   BASIC INFORMATION');
      console.log('   ' + '-'.repeat(65));
      console.log('   Student ID:        ' + byFirstName.id);
      console.log('   Full Name:         ' + byFirstName.firstName + ' ' + (byFirstName.middleName || '') + ' ' + byFirstName.lastName);
      console.log('   Admission Number:  ' + (byFirstName.admissionNo || 'N/A'));
      console.log('   Gender:            ' + (byFirstName.sex || 'N/A'));
      console.log('   Registration No:   ' + (byFirstName.regNumber || 'N/A'));
      console.log('');

      console.log('   CLASS INFORMATION');
      console.log('   ' + '-'.repeat(65));
      if (byFirstName.enrollments && byFirstName.enrollments.length > 0) {
        byFirstName.enrollments.forEach((enrollment, idx) => {
          console.log('   Enrollment ' + (idx + 1) + ':');
          console.log('     Class:       ' + (enrollment.class?.name || 'N/A'));
          console.log('     Level:       ' + (enrollment.class?.level?.name || 'N/A'));
          console.log('     Section:     ' + (enrollment.class?.level?.section || 'N/A'));
          console.log('     Session:     ' + (enrollment.session?.name || 'N/A'));
          console.log('     Term:        ' + (enrollment.term?.name || 'N/A'));
          console.log('     Status:      ' + enrollment.status);
          console.log('     Enrolled:    ' + enrollment.enrolledAt);
        });
      } else {
        console.log('   No active enrollments found');
      }
      console.log('');

      console.log('   TIMESTAMPS');
      console.log('   ' + '-'.repeat(65));
      console.log('   Created:           ' + byFirstName.createdAt);
      console.log('   Last Updated:      ' + byFirstName.updatedAt);
      console.log('');

      console.log('2. Checking for academic results...');
      
      if (byFirstName.subjectResults && byFirstName.subjectResults.length > 0) {
        console.log('   Found ' + byFirstName.subjectResults.length + ' subject result(s)\n');
        console.log('   SUBJECT RESULTS');
        console.log('   ' + '-'.repeat(65));
        byFirstName.subjectResults.forEach((result, idx) => {
          console.log('   ' + (idx + 1) + '. ' + (result.subject?.name || 'Unknown Subject'));
          console.log('      Term: ' + (result.term?.name || 'N/A') + ', Session: ' + (result.session?.name || 'N/A'));
          console.log('      Score: ' + (result.numericScore || 'N/A') + ', Grade: ' + (result.grade || 'N/A'));
          console.log('      Status: ' + (result.status || 'N/A'));
        });
        console.log('');
      } else {
        console.log('   No subject results found\n');
      }

      if (byFirstName.termResults && byFirstName.termResults.length > 0) {
        console.log('   Found ' + byFirstName.termResults.length + ' term result(s)\n');
        console.log('   TERM RESULTS');
        console.log('   ' + '-'.repeat(65));
        byFirstName.termResults.forEach((result, idx) => {
          console.log('   ' + (idx + 1) + '. ' + (result.term?.name || 'N/A') + ' - ' + (result.session?.name || 'N/A'));
          console.log('      Average: ' + (result.averageScore || 'N/A') + ', Position: ' + (result.position || 'N/A'));
          console.log('      Status: ' + (result.status || 'N/A'));
        });
        console.log('');
      } else {
        console.log('   No term results found\n');
      }

      if (byFirstName.reports && byFirstName.reports.length > 0) {
        console.log('   Found ' + byFirstName.reports.length + ' report(s)\n');
        console.log('   REPORTS');
        console.log('   ' + '-'.repeat(65));
        byFirstName.reports.forEach((report, idx) => {
          console.log('   ' + (idx + 1) + '. ' + (report.session?.name || 'N/A') + ' - ' + (report.term?.name || 'N/A'));
          console.log('      Status: ' + (report.status || 'N/A') + ', Published: ' + (report.publishedAt ? 'Yes' : 'No'));
        });
        console.log('');
      } else {
        console.log('   No reports found\n');
      }

      console.log('='.repeat(70));
      console.log('SEARCH COMPLETE - HAFSAT BINT ABUBAKAR FOUND');
      console.log('='.repeat(70));
      console.log('');
      console.log('SUMMARY:');
      console.log('   • Student ID:        ' + byFirstName.id);
      console.log('   • Full Name:         ' + byFirstName.firstName + ' ' + (byFirstName.middleName || '') + ' ' + byFirstName.lastName);
      console.log('   • Admission Number:  ' + (byFirstName.admissionNo || 'N/A'));
      console.log('   • Gender:            ' + (byFirstName.sex || 'N/A'));
      console.log('   • Subject Results:   ' + (byFirstName.subjectResults ? byFirstName.subjectResults.length : 0));
      console.log('   • Term Results:      ' + (byFirstName.termResults ? byFirstName.termResults.length : 0));
      console.log('   • Reports:           ' + (byFirstName.reports ? byFirstName.reports.length : 0));
      console.log('');

    } else {
      console.log('   STUDENT NOT FOUND\n');
      console.log('   Possible reasons:');
      console.log('   • Student record does not exist in database');
      console.log('   • Name spelling is different');
      console.log('   • Student was not enrolled');
      console.log('');
    }

  } catch (error) {
    console.error('Error querying database:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
