import { z } from 'zod';
import {
  AnswerConfidenceSchema,
  ReviewGradeSchema,
  SessionTypeSchema,
  UnderstandingSchema,
} from './enums';

/**
 * Schemas for all locally-persisted learner state.
 *
 * The persisted store is versioned. When the shape changes, bump
 * CURRENT_STATE_VERSION and add a migration in services/storage.
 */

export const CURRENT_STATE_VERSION = 1;

export const ThemeModeSchema = z.enum(['light', 'dark', 'system']);
export type ThemeMode = z.infer<typeof ThemeModeSchema>;

export const SettingsSchema = z.object({
  activeCertificationId: z.string(),
  reduceMotion: z.boolean(),
  rapidFireDefaultRound: z.number().int().positive(),
  rapidFireDefaultTimer: z.number().int().nonnegative(), // 0 = untimed
  showProvenanceBadges: z.boolean(),
  confirmBeforeMockSubmit: z.boolean(),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const ThemeSchema = z.object({
  mode: ThemeModeSchema,
});
export type Theme = z.infer<typeof ThemeSchema>;

/** A single recorded attempt at a question. */
export const AttemptSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  certificationId: z.string(),
  domainId: z.string(),
  taskStatementId: z.string().nullable(),
  sessionType: SessionTypeSchema,
  provenance: z.string(),
  selectedAnswerIds: z.array(z.string()),
  correct: z.boolean(),
  confidence: AnswerConfidenceSchema.nullable(),
  responseTimeMs: z.number().nonnegative(),
  timedOut: z.boolean(),
  at: z.number(), // epoch ms
});
export type Attempt = z.infer<typeof AttemptSchema>;

export const LessonProgressSchema = z.object({
  completed: z.boolean(),
  bookmarked: z.boolean(),
  understanding: UnderstandingSchema,
  note: z.string(),
  updatedAt: z.number(),
});
export type LessonProgress = z.infer<typeof LessonProgressSchema>;

export const LabProgressSchema = z.object({
  completedStepIndices: z.array(z.number().int().nonnegative()),
  completed: z.boolean(),
  note: z.string(),
  updatedAt: z.number(),
});
export type LabProgress = z.infer<typeof LabProgressSchema>;

/** A question-level note/bookmark record (independent of attempts). */
export const QuestionMetaSchema = z.object({
  bookmarked: z.boolean(),
  note: z.string(),
  markedForReview: z.boolean(),
  updatedAt: z.number(),
});
export type QuestionMeta = z.infer<typeof QuestionMetaSchema>;

/** Spaced-review scheduling record for a question. */
export const ReviewItemSchema = z.object({
  questionId: z.string(),
  certificationId: z.string(),
  domainId: z.string(),
  reason: z.enum([
    'incorrect',
    'low-confidence-correct',
    'too-slow',
    'manual',
    'high-confidence-incorrect',
  ]),
  intervalDays: z.number().nonnegative(),
  dueAt: z.number(), // epoch ms
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  lastGrade: ReviewGradeSchema.nullable(),
  priority: z.number().int(), // higher = more urgent
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type ReviewItem = z.infer<typeof ReviewItemSchema>;

export const MockExamResultSchema = z.object({
  id: z.string(),
  certificationId: z.string(),
  startedAt: z.number(),
  finishedAt: z.number(),
  timeLimitMinutes: z.number(),
  timeUsedMs: z.number(),
  totalQuestions: z.number().int(),
  correctCount: z.number().int(),
  accuracy: z.number(), // 0..1
  domainBreakdown: z.record(
    z.string(),
    z.object({ correct: z.number().int(), total: z.number().int() }),
  ),
  attemptIds: z.array(z.string()),
});
export type MockExamResult = z.infer<typeof MockExamResultSchema>;

/** In-progress mock exam, persisted so it survives refresh. */
export const MockExamSessionSchema = z.object({
  id: z.string(),
  certificationId: z.string(),
  startedAt: z.number(),
  timeLimitMinutes: z.number(),
  questionIds: z.array(z.string()),
  // per question id: chosen option ids + flagged state
  answers: z.record(z.string(), z.array(z.string())),
  flagged: z.array(z.string()),
  currentIndex: z.number().int().nonnegative(),
  // randomised option order per question id (option id list)
  optionOrder: z.record(z.string(), z.array(z.string())),
});
export type MockExamSession = z.infer<typeof MockExamSessionSchema>;

export const PersistedStateSchema = z.object({
  version: z.number().int(),
  settings: SettingsSchema,
  theme: ThemeSchema,
  attempts: z.array(AttemptSchema),
  lessonProgress: z.record(z.string(), LessonProgressSchema),
  labProgress: z.record(z.string(), LabProgressSchema),
  questionMeta: z.record(z.string(), QuestionMetaSchema),
  reviewItems: z.record(z.string(), ReviewItemSchema),
  mockResults: z.array(MockExamResultSchema),
  activeMockSession: MockExamSessionSchema.nullable(),
});
export type PersistedState = z.infer<typeof PersistedStateSchema>;

/** The exported/imported progress envelope. */
export const ProgressExportSchema = z.object({
  app: z.literal('claude-certification-trainer'),
  exportedAt: z.number(),
  state: PersistedStateSchema,
});
export type ProgressExport = z.infer<typeof ProgressExportSchema>;
