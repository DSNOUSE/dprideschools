/**
 * Shared types/DTOs for the results feature area.
 */

/** Shape of a single grade returned from results API. */
export interface GradeDTO {
  subjectId?: number;
  subject: { name: string };
  firstScore?: number;
  secondScore?: number;
  examScore?: number;
  average: number;
  teacher?: {
    name: string | null;
    teacherId: string | null;
  } | null;
}

/** Teacher attribution for a published result comment (from `Report.teacher`). */
export interface CommentAuthorDTO {
  name: string | null;
  teacherId: string | null;
}

/** Shape of the result summary returned from the results API. */
export interface ResultSummaryDTO {
  position?: number;
  average: number;
  totalScore: number;
  maxScore: number;
  comment?: string;
  /** Present when a published general report comment exists; names come from `User`. */
  commentAuthor?: CommentAuthorDTO;
}

/** Full result payload returned by POST /api/results/check. */
export interface ResultData {
  hasResults?: boolean;
  message?: string;
  student: {
    admissionNo: string;
    firstName: string;
    lastName: string;
    middleName: string;
    sex: string;
    photo: string | null;
  };
  class: { name: string };
  session: { name: string };
  term: { name: string };
  grades: GradeDTO[];
  result: ResultSummaryDTO | null;
}

/** Standardized API error response. */
export interface ResultsErrorResponse {
  error: string;
  code: string;
  timestamp: string;
  details?: unknown;
}

/** Options for the select dropdowns (class, session, term). */
export interface SelectOption {
  id: number;
  name: string;
}
