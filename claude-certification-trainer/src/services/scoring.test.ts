import { describe, it, expect } from 'vitest';
import { isAnswerCorrect, isSubmittable, requiredSelections, toggleSelection } from './scoring';
import type { Question } from '@/schemas';

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-1',
    difficulty: 'easy',
    questionType: 'single-choice',
    prompt: 'Test?',
    answerOptions: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
      { id: 'c', text: 'C' },
      { id: 'd', text: 'D' },
    ],
    correctAnswerIds: ['b'],
    explanation: 'x',
    explanationForEachOption: { a: 'x', b: 'x', c: 'x', d: 'x' },
    keyExamClue: 'x',
    learningObjective: 'x',
    relatedLessonIds: [],
    relatedLabIds: [],
    sourceIds: ['exam-guide'],
    provenance: 'independently-authored',
    verifiedAt: '2026-07-17',
    tags: [],
    estimatedTimeSeconds: 60,
    enabled: true,
    ...overrides,
  };
}

describe('single-choice scoring', () => {
  const q = makeQuestion();
  it('marks the exact correct option correct', () => {
    expect(isAnswerCorrect(q, ['b'])).toBe(true);
  });
  it('marks a wrong option incorrect', () => {
    expect(isAnswerCorrect(q, ['a'])).toBe(false);
  });
  it('marks an empty selection incorrect', () => {
    expect(isAnswerCorrect(q, [])).toBe(false);
  });
  it('requires exactly one selection to submit', () => {
    expect(isSubmittable(q, [])).toBe(false);
    expect(isSubmittable(q, ['a'])).toBe(true);
    expect(isSubmittable(q, ['a', 'b'])).toBe(false);
  });
  it('single-choice toggle replaces the selection', () => {
    expect(toggleSelection(q, ['a'], 'b')).toEqual(['b']);
    expect(toggleSelection(q, ['a'], 'a')).toEqual([]);
  });
});

describe('multiple-response scoring', () => {
  const q = makeQuestion({ questionType: 'multiple-response', correctAnswerIds: ['a', 'c'] });
  it('requires the exact set', () => {
    expect(isAnswerCorrect(q, ['a', 'c'])).toBe(true);
    expect(isAnswerCorrect(q, ['c', 'a'])).toBe(true); // order-independent
  });
  it('rejects partial or superset selections', () => {
    expect(isAnswerCorrect(q, ['a'])).toBe(false);
    expect(isAnswerCorrect(q, ['a', 'c', 'b'])).toBe(false);
  });
  it('requires the correct count to be submittable', () => {
    expect(requiredSelections(q)).toBe(2);
    expect(isSubmittable(q, ['a'])).toBe(false);
    expect(isSubmittable(q, ['a', 'c'])).toBe(true);
  });
  it('caps selection at the required count (replaces oldest)', () => {
    const afterTwo = toggleSelection(q, ['a', 'c'], 'b');
    expect(afterTwo).toHaveLength(2);
    expect(afterTwo).toContain('b');
    expect(afterTwo).not.toContain('a'); // oldest dropped
  });
  it('toggling an existing option removes it', () => {
    expect(toggleSelection(q, ['a', 'c'], 'a')).toEqual(['c']);
  });
});
