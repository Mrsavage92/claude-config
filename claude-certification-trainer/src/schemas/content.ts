import { z } from 'zod';
import {
  AnswerConfidenceSchema,
  CertificationStatusSchema,
  ConfidenceSchema,
  DifficultySchema,
  ProvenanceSchema,
  QuestionTypeSchema,
  SourceTypeSchema,
} from './enums';

/**
 * Zod schemas for all static study content.
 *
 * Every content object shipped with the application is validated against these
 * schemas by the content-validation test suite. Content that fails validation
 * is a build/test failure, never something that silently reaches a learner.
 */

const nonEmpty = z.string().min(1);
const idSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'ids must be lowercase kebab-case');

/* ------------------------------------------------------------------ */
/* Certification                                                       */
/* ------------------------------------------------------------------ */

export const CertificationSchema = z.object({
  id: idSchema,
  code: nonEmpty,
  name: nonEmpty,
  description: nonEmpty,
  blueprintVersion: nonEmpty,
  effectiveDate: nonEmpty,
  questionCount: z.number().int().positive(),
  timeLimitMinutes: z.number().int().positive(),
  passingScore: nonEmpty,
  scoringNotes: nonEmpty,
  status: CertificationStatusSchema,
  sourceIds: z.array(idSchema).min(1),
  lastVerifiedAt: nonEmpty,
});
export type Certification = z.infer<typeof CertificationSchema>;

/* ------------------------------------------------------------------ */
/* Task statement + Domain                                            */
/* ------------------------------------------------------------------ */

export const TaskStatementSchema = z.object({
  id: idSchema,
  domainId: idSchema,
  code: nonEmpty,
  title: nonEmpty,
});
export type TaskStatement = z.infer<typeof TaskStatementSchema>;

export const DomainSchema = z.object({
  id: idSchema,
  certificationId: idSchema,
  title: nonEmpty,
  description: nonEmpty,
  weighting: z.number().min(0).max(1),
  order: z.number().int().nonnegative(),
  taskStatementIds: z.array(idSchema).min(1),
  lessonIds: z.array(idSchema),
  sourceIds: z.array(idSchema),
});
export type Domain = z.infer<typeof DomainSchema>;

/* ------------------------------------------------------------------ */
/* Lesson                                                             */
/* ------------------------------------------------------------------ */

export const LessonSchema = z.object({
  id: idSchema,
  certificationId: idSchema,
  domainId: idSchema,
  taskStatementId: idSchema.nullable(),
  title: nonEmpty,
  summary: nonEmpty,
  content: nonEmpty,
  keyPrinciples: z.array(nonEmpty),
  decisionRules: z.array(nonEmpty),
  commonPitfalls: z.array(nonEmpty),
  sourceIds: z.array(idSchema),
  relatedQuestionIds: z.array(idSchema),
  relatedLabIds: z.array(idSchema),
  estimatedMinutes: z.number().int().positive(),
});
export type Lesson = z.infer<typeof LessonSchema>;

/* ------------------------------------------------------------------ */
/* Question                                                           */
/* ------------------------------------------------------------------ */

export const AnswerOptionSchema = z.object({
  id: idSchema,
  text: nonEmpty,
});
export type AnswerOption = z.infer<typeof AnswerOptionSchema>;

export const QuestionSchema = z.object({
  id: idSchema,
  certificationId: idSchema,
  domainId: idSchema,
  taskStatementId: idSchema.nullable(),
  difficulty: DifficultySchema,
  questionType: QuestionTypeSchema,
  prompt: nonEmpty,
  answerOptions: z.array(AnswerOptionSchema).min(3),
  correctAnswerIds: z.array(idSchema).min(1),
  explanation: nonEmpty,
  explanationForEachOption: z.record(z.string(), nonEmpty),
  keyExamClue: nonEmpty,
  learningObjective: nonEmpty,
  relatedLessonIds: z.array(idSchema),
  relatedLabIds: z.array(idSchema),
  sourceIds: z.array(idSchema).min(1),
  provenance: ProvenanceSchema,
  verifiedAt: nonEmpty,
  tags: z.array(nonEmpty),
  estimatedTimeSeconds: z.number().int().positive(),
  enabled: z.boolean(),
});
export type Question = z.infer<typeof QuestionSchema>;

/* ------------------------------------------------------------------ */
/* Flash Fire                                                         */
/* ------------------------------------------------------------------ */

export const FlashFireSchema = z.object({
  id: idSchema,
  certificationId: idSchema,
  domainId: idSchema,
  prompt: nonEmpty,
  answerOptions: z.array(AnswerOptionSchema).min(2),
  correctAnswerIds: z.array(idSchema).min(1),
  explanation: nonEmpty,
  relatedQuestionIds: z.array(idSchema),
  relatedLessonIds: z.array(idSchema),
  sourceIds: z.array(idSchema),
  provenance: ProvenanceSchema,
  estimatedTimeSeconds: z.number().int().positive(),
  enabled: z.boolean(),
});
export type FlashFire = z.infer<typeof FlashFireSchema>;

/* ------------------------------------------------------------------ */
/* Lab                                                                */
/* ------------------------------------------------------------------ */

export const LabStepSchema = z.object({
  title: nonEmpty,
  detail: nonEmpty,
});
export type LabStep = z.infer<typeof LabStepSchema>;

export const LabPromptSchema = z.object({
  label: nonEmpty,
  prompt: nonEmpty,
});
export type LabPrompt = z.infer<typeof LabPromptSchema>;

export const LabSchema = z.object({
  id: idSchema,
  certificationId: idSchema,
  domainIds: z.array(idSchema).min(1),
  title: nonEmpty,
  objective: nonEmpty,
  prerequisites: z.array(nonEmpty),
  estimatedMinutes: z.number().int().positive(),
  setup: z.array(nonEmpty),
  steps: z.array(LabStepSchema).min(1),
  prompts: z.array(LabPromptSchema),
  expectedOutcome: nonEmpty,
  whatToObserve: z.array(nonEmpty),
  whyItMatters: nonEmpty,
  troubleshooting: z.array(
    z.object({ problem: nonEmpty, fix: nonEmpty }),
  ),
  cleanup: z.array(nonEmpty),
  sourceIds: z.array(idSchema),
  relatedQuestionIds: z.array(idSchema),
  requiresPaidFeature: z.boolean(),
  paidFeatureNote: z.string(),
});
export type Lab = z.infer<typeof LabSchema>;

/* ------------------------------------------------------------------ */
/* Source                                                             */
/* ------------------------------------------------------------------ */

export const SourceSchema = z.object({
  id: idSchema,
  title: nonEmpty,
  publisher: nonEmpty,
  url: z.string().url(),
  sourceType: SourceTypeSchema,
  lastVerifiedAt: nonEmpty,
  confidence: ConfidenceSchema,
  notes: z.string(),
});
export type Source = z.infer<typeof SourceSchema>;

/* ------------------------------------------------------------------ */
/* Re-exports for convenience                                         */
/* ------------------------------------------------------------------ */

export { AnswerConfidenceSchema };
