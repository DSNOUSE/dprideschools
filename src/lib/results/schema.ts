/**
 * Zod schema for POST /api/results/check request body.
 */
import { z } from 'zod';

export const checkResultSchema = z.object({
  studentId: z
    .string({ error: 'studentId is required' })
    .min(1, 'studentId must not be empty'),
  classId: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v !== undefined && v !== null && v !== '' ? Number(v) : undefined))
    .refine((v) => v === undefined || (!Number.isNaN(v) && Number.isInteger(v) && v > 0), {
      message: 'classId must be a positive integer',
    }),
  sessionId: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v !== undefined && v !== null && v !== '' ? Number(v) : undefined))
    .refine((v) => v === undefined || (!Number.isNaN(v) && Number.isInteger(v) && v > 0), {
      message: 'sessionId must be a positive integer',
    }),
  termId: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v !== undefined && v !== null && v !== '' ? Number(v) : undefined))
    .refine((v) => v === undefined || (!Number.isNaN(v) && Number.isInteger(v) && v > 0), {
      message: 'termId must be a positive integer',
    }),
});

export type CheckResultInput = z.infer<typeof checkResultSchema>;
