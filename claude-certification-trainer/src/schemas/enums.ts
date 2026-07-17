import { z } from 'zod';

/**
 * Shared enumerations used across the content model.
 *
 * Provenance is deliberately explicit: the application must always be able to
 * tell a learner whether a question came from an official sample, was derived
 * from official material, or was authored independently for this trainer.
 */

export const QuestionTypeSchema = z.enum(['single-choice', 'multiple-response']);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const DifficultySchema = z.enum(['easy', 'moderate', 'difficult']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const ProvenanceSchema = z.enum([
  'official-sample',
  'official-blueprint-derived',
  'official-documentation-derived',
  'repository-authored',
  'independently-authored',
  'unclear',
]);
export type Provenance = z.infer<typeof ProvenanceSchema>;

/** Provenance values that may be presented to the learner as "official". */
export const OFFICIAL_PROVENANCE: readonly Provenance[] = [
  'official-sample',
  'official-blueprint-derived',
  'official-documentation-derived',
];

/** Provenance values that must never be presented as official. */
export const NON_OFFICIAL_PROVENANCE: readonly Provenance[] = [
  'repository-authored',
  'independently-authored',
  'unclear',
];

export function isOfficialProvenance(p: Provenance): boolean {
  return OFFICIAL_PROVENANCE.includes(p);
}

export const SourceTypeSchema = z.enum([
  'official-certification-guide',
  'official-documentation',
  'official-policy',
  'official-blog',
  'community-study-guide',
  'independently-authored',
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const ConfidenceSchema = z.enum(['high', 'medium', 'low']);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const CertificationStatusSchema = z.enum(['active', 'draft', 'archived']);
export type CertificationStatus = z.infer<typeof CertificationStatusSchema>;

/** Learner-set understanding level for a lesson. */
export const UnderstandingSchema = z.enum([
  'new',
  'learning',
  'understood',
  'needs-revision',
]);
export type Understanding = z.infer<typeof UnderstandingSchema>;

/** Confidence a learner reports when answering a question. */
export const AnswerConfidenceSchema = z.enum([
  'certain',
  'fairly-sure',
  'unsure',
  'guess',
]);
export type AnswerConfidence = z.infer<typeof AnswerConfidenceSchema>;

/** Spaced-review grade a learner gives when reviewing an item. */
export const ReviewGradeSchema = z.enum(['again', 'hard', 'good', 'easy']);
export type ReviewGrade = z.infer<typeof ReviewGradeSchema>;

/** Session type that produced a question attempt (used by analytics). */
export const SessionTypeSchema = z.enum([
  'practice',
  'rapid-fire',
  'flash-fire',
  'mock-exam',
  'review',
]);
export type SessionType = z.infer<typeof SessionTypeSchema>;
