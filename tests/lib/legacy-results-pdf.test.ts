import { describe, it, expect } from 'vitest';
import { buildLegacyResultPdfHtml, buildLegacySessionPdfHtml } from '@/lib/results/pdf-export';

describe('buildLegacyResultPdfHtml', () => {
  it('renders student result summary data in a printable PDF format', () => {
    const html = buildLegacyResultPdfHtml({
      student: {
        admissionNo: 'DPS2024001',
        firstName: 'Aisha',
        middleName: 'Kemi',
        lastName: 'Bello',
      },
      className: 'JSS 2 Gold',
      sessionName: '2024/2025',
      termName: 'First Term',
      subjectRows: [
        { subject: 'Mathematics', total: 88, max: 100, grade: 'A', remark: 'Excellent' },
        { subject: 'English', total: 74, max: 100, grade: 'B', remark: 'Good' },
      ],
      summary: {
        average: 81,
        totalScore: 162,
        maxScore: 200,
        position: 2,
      },
    });

    expect(html).toContain('Aisha Kemi Bello');
    expect(html).toContain('DPS2024001');
    expect(html).toContain('Mathematics');
    expect(html).toContain('81.0%');
    expect(html).toContain('First Term');
  });

  it('renders a combined PDF for all students in a session', () => {
    const html = buildLegacySessionPdfHtml({
      sessionName: '2024/2025',
      termName: 'First Term',
      students: [
        {
          student: {
            admissionNo: 'DPS2024001',
            firstName: 'Aisha',
            lastName: 'Bello',
          },
          className: 'JSS 2 Gold',
          summary: { average: 81, totalScore: 162, maxScore: 200, position: 2 },
          subjectRows: [{ subject: 'Mathematics', total: 88, max: 100, grade: 'A', remark: 'Excellent' }],
        },
        {
          student: {
            admissionNo: 'DPS2024002',
            firstName: 'Musa',
            lastName: 'Ali',
          },
          className: 'JSS 2 Gold',
          summary: { average: 76, totalScore: 152, maxScore: 200, position: 4 },
          subjectRows: [{ subject: 'English', total: 76, max: 100, grade: 'B', remark: 'Good' }],
        },
      ],
    });

    expect(html).toContain('2024/2025');
    expect(html).toContain('Aisha Bello');
    expect(html).toContain('Musa Ali');
    expect(html).toContain('Session Results Summary');
    expect(html).toContain('Percentage');
    expect(html).toContain('88.0%');
    expect(html).toContain('Excellent');
  });
});
