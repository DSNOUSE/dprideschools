/**
 * Types for the student results history feature.
 */

export interface StudentHistoryStudent {
  admissionNo: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  sex: string | null;
}

export interface SessionInfo {
  id: number;
  name: string;
}

export interface TermInfo {
  id: number;
  name: string;
}

export interface ClassInfo {
  name: string;
}

export interface GradeDTO {
  subject: { name: string };
  firstScore?: number | null;
  secondScore?: number | null;
  examScore?: number | null;
  average: number;
  grade: string;
}

export interface TermResultSummary {
  average: number;
  totalScore: number;
  maxScore: number;
  position?: number | null;
  comment?: string | null;
  commentAuthor?: {
    name: string | null;
    teacherId: string | null;
  } | null;
  promotionStatus?: string | null;
}

export interface TermHistory {
  term: TermInfo;
  class: ClassInfo;
  grades: GradeDTO[];
  result: TermResultSummary | null;
  reportStatus: string;
}

export interface SessionHistory {
  session: SessionInfo;
  terms: TermHistory[];
}

export interface StudentHistoryResponse {
  student: StudentHistoryStudent;
  sessions: SessionHistory[];
}
