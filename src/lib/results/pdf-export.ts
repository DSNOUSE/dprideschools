export interface LegacyPdfStudent { 
  admissionNo: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
}

export interface LegacyPdfSubjectRow {
  subject: string;
  total: number;
  max: number;
  percentage?: number;
  grade: string;
  remark?: string | null;
}

export interface LegacyPdfSummary {
  average: number;
  totalScore: number;
  maxScore: number;
  position?: number | null;
}

export interface LegacyPdfPayload {
  student: LegacyPdfStudent;
  className: string;
  sessionName: string;
  termName: string;
  subjectRows: LegacyPdfSubjectRow[];
  summary: LegacyPdfSummary;
}

export interface LegacySessionPdfEntry {
  student: LegacyPdfStudent;
  className: string;
  summary: LegacyPdfSummary;
  subjectRows: LegacyPdfSubjectRow[];
}

export interface LegacySessionPdfPayload {
  sessionName: string;
  termName: string;
  students: LegacySessionPdfEntry[];
}

export function buildLegacyResultPdfHtml(payload: LegacyPdfPayload): string {
  const studentName = [payload.student.firstName, payload.student.middleName, payload.student.lastName]
    .filter(Boolean)
    .join(' ');

  const rows = payload.subjectRows.length
    ? payload.subjectRows.map((row) => `
        <tr>
          <td>${row.subject}</td>
          <td>${row.total}</td>
          <td>${row.max}</td>
          <td>${row.grade}</td>
          <td>${row.remark || '—'}</td>
        </tr>
      `).join('')
    : `
      <tr>
        <td colspan="5" style="text-align:center; padding: 16px; color:#666;">No subject result rows available.</td>
      </tr>
    `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Legacy Result PDF</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            color: #1f2937;
            background: #fff;
          }
          .page { padding: 32px; }
          .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 18px;
            margin-bottom: 24px;
          }
          .title {
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px;
            color: #0f172a;
          }
          .meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(180px, 1fr));
            gap: 10px 24px;
            font-size: 14px;
          }
          .meta strong { color: #0f172a; }
          .summary {
            display: grid;
            grid-template-columns: repeat(4, minmax(120px, 1fr));
            gap: 12px;
            margin: 24px 0;
          }
          .summary-box {
            border: 1px solid #dbe4f0;
            border-radius: 10px;
            padding: 14px 12px;
            background: #f8fafc;
          }
          .summary-box .label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #475569;
            display: block;
            margin-bottom: 8px;
          }
          .summary-box .value {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #dfe7f2;
            padding: 10px 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #e2e8f0;
            color: #0f172a;
          }
          .footer {
            margin-top: 26px;
            font-size: 12px;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1 class="title">DPRIDE International School</h1>
            <div class="meta">
              <div><strong>Student:</strong> ${studentName}</div>
              <div><strong>Admission No:</strong> ${payload.student.admissionNo}</div>
              <div><strong>Class:</strong> ${payload.className}</div>
              <div><strong>Session:</strong> ${payload.sessionName}</div>
              <div><strong>Term:</strong> ${payload.termName}</div>
              <div><strong>Position:</strong> ${payload.summary.position ?? '—'}</div>
            </div>
          </div>

          <div class="summary">
            <div class="summary-box">
              <span class="label">Average</span>
              <span class="value">${Number(payload.summary.average || 0).toFixed(1)}%</span>
            </div>
            <div class="summary-box">
              <span class="label">Total Score</span>
              <span class="value">${payload.summary.totalScore}</span>
            </div>
            <div class="summary-box">
              <span class="label">Max Score</span>
              <span class="value">${payload.summary.maxScore}</span>
            </div>
            <div class="summary-box">
              <span class="label">Position</span>
              <span class="value">${payload.summary.position ?? '—'}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Total</th>
                <th>Max</th>
                <th>Grade</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            Generated from the legacy result archive and current academic records.
          </div>
        </div>
      </body>
    </html>
  `;
}

export function buildLegacySessionPdfHtml(payload: LegacySessionPdfPayload): string {
  const rows = payload.students.map((entry) => {
    const studentName = [entry.student.firstName, entry.student.middleName, entry.student.lastName]
      .filter(Boolean)
      .join(' ');

    const subjectRows = entry.subjectRows.map((row) => {
      const percentage = row.percentage ?? (row.max ? (row.total / row.max) * 100 : 0);
      return `
        <tr>
          <td>${row.subject}</td>
          <td>${row.total}</td>
          <td>${row.max}</td>
          <td>${percentage.toFixed(1)}%</td>
          <td>${row.grade}</td>
          <td>${row.remark || '—'}</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="page-break-inside: avoid; border: 1px solid #dfe7f2; border-radius: 10px; padding: 16px; margin-bottom: 18px;">
        <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px;">
          <div>
            <div style="font-size: 18px; font-weight: 700; color:#0f172a;">${studentName}</div>
            <div style="font-size: 12px; color:#475569;">${entry.student.admissionNo} • ${entry.className}</div>
          </div>
          <div style="font-size: 12px; color:#475569; text-align: right;">
            <div>Avg: ${Number(entry.summary.average || 0).toFixed(1)}%</div>
            <div>Position: ${entry.summary.position ?? '—'}</div>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 7px; border: 1px solid #dfe7f2; background: #e2e8f0;">Subject</th>
              <th style="text-align: left; padding: 7px; border: 1px solid #dfe7f2; background: #e2e8f0;">Score</th>
              <th style="text-align: left; padding: 7px; border: 1px solid #dfe7f2; background: #e2e8f0;">Max</th>
              <th style="text-align: left; padding: 7px; border: 1px solid #dfe7f2; background: #e2e8f0;">Percentage</th>
              <th style="text-align: left; padding: 7px; border: 1px solid #dfe7f2; background: #e2e8f0;">Grade</th>
              <th style="text-align: left; padding: 7px; border: 1px solid #dfe7f2; background: #e2e8f0;">Remark</th>
            </tr>
          </thead>
          <tbody>${subjectRows}</tbody>
        </table>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Session Results Summary</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; color: #1f2937; background: #fff; }
          .page { padding: 32px; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 18px; margin-bottom: 18px; }
          .title { font-size: 28px; font-weight: 700; margin: 0 0 8px; color:#0f172a; }
          .meta { font-size: 14px; color:#475569; }
          .count { margin-top: 14px; font-size: 13px; color:#1f2937; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1 class="title">DPRIDE International School</h1>
            <div class="meta">Session Results Summary • ${payload.sessionName} • ${payload.termName}</div>
            <div class="count">${payload.students.length} student result${payload.students.length === 1 ? '' : 's'}</div>
          </div>
          ${rows}
        </div>
      </body>
    </html>
  `;
}
