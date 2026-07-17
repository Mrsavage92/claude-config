import { describe, it, expect } from 'vitest';
import { validateContent, errorsOnly, type ContentBundle } from './validateContent';
import {
  certifications,
  domains,
  taskStatements,
  lessons,
  questions,
  flashFire,
  labs,
  sources,
} from '@/data';
import type { Question } from '@/schemas';

const baseBundle: ContentBundle = {
  certifications,
  domains,
  taskStatements,
  lessons,
  questions,
  flashFire,
  labs,
  sources,
};

const sampleQuestion = (): Question => ({ ...questions[0], id: 'q-test', relatedLessonIds: [], relatedLabIds: [] });

describe('validateContent negative cases', () => {
  it('flags a question with no correct answer', () => {
    const bad = { ...sampleQuestion(), correctAnswerIds: [] };
    const issues = validateContent({ ...baseBundle, questions: [...questions, bad] });
    expect(errorsOnly(issues).some((i) => i.code === 'no-correct-answer')).toBe(true);
  });

  it('flags a single-choice question with more than one correct answer', () => {
    const bad = { ...sampleQuestion(), questionType: 'single-choice' as const, correctAnswerIds: ['a', 'b'] };
    const issues = validateContent({ ...baseBundle, questions: [...questions, bad] });
    expect(errorsOnly(issues).some((i) => i.code === 'single-choice-count')).toBe(true);
  });

  it('flags a multiple-response question with fewer than two correct answers', () => {
    const q = sampleQuestion();
    const bad = { ...q, questionType: 'multiple-response' as const, correctAnswerIds: [q.answerOptions[0].id] };
    const issues = validateContent({ ...baseBundle, questions: [...questions, bad] });
    expect(errorsOnly(issues).some((i) => i.code === 'multiple-response-count')).toBe(true);
  });

  it('flags a duplicate question id', () => {
    const dup = { ...sampleQuestion(), id: questions[0].id };
    const issues = validateContent({ ...baseBundle, questions: [...questions, dup] });
    expect(errorsOnly(issues).some((i) => i.code === 'duplicate-id')).toBe(true);
  });

  it('flags a broken lesson reference', () => {
    const bad = { ...sampleQuestion(), relatedLessonIds: ['lesson-does-not-exist'] };
    const issues = validateContent({ ...baseBundle, questions: [...questions, bad] });
    expect(errorsOnly(issues).some((i) => i.code === 'broken-ref')).toBe(true);
  });

  it('flags a missing source reference', () => {
    const bad = { ...sampleQuestion(), sourceIds: ['no-such-source'] };
    const issues = validateContent({ ...baseBundle, questions: [...questions, bad] });
    expect(errorsOnly(issues).some((i) => i.code === 'missing-source')).toBe(true);
  });

  it('flags a duplicated option id within a question', () => {
    const q = sampleQuestion();
    const bad = { ...q, answerOptions: [...q.answerOptions, { id: q.answerOptions[0].id, text: 'dup' }] };
    const issues = validateContent({ ...baseBundle, questions: [...questions, bad] });
    expect(errorsOnly(issues).some((i) => i.code === 'duplicate-option')).toBe(true);
  });

  it('flags a domain weighting that does not sum to 1', () => {
    const bumped = domains.map((d, i) => (i === 0 ? { ...d, weighting: d.weighting + 0.2 } : d));
    const issues = validateContent({ ...baseBundle, domains: bumped });
    expect(errorsOnly(issues).some((i) => i.code === 'weighting-sum')).toBe(true);
  });

  it('flags a flash-fire item with no correct answer', () => {
    const bad = { ...flashFire[0], id: 'ff-test', correctAnswerIds: [] };
    const issues = validateContent({ ...baseBundle, flashFire: [...flashFire, bad] });
    expect(errorsOnly(issues).some((i) => i.code === 'no-correct-answer')).toBe(true);
  });
});
