import { describe, it, expect } from 'vitest';
import {
  applyGrade,
  bucketReviews,
  createReviewItem,
  reviewReasonForAttempt,
  scheduleFromAttempt,
  BASE_INTERVAL_DAYS,
} from './review';
import type { Attempt, Question, ReviewItem } from '@/schemas';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_000_000_000_000;

const q: Question = {
  id: 'q1',
  certificationId: 'ccao-f',
  domainId: 'd1',
  taskStatementId: 'ts-1-1',
  difficulty: 'easy',
  questionType: 'single-choice',
  prompt: 'p',
  answerOptions: [
    { id: 'a', text: 'A' },
    { id: 'b', text: 'B' },
    { id: 'c', text: 'C' },
  ],
  correctAnswerIds: ['a'],
  explanation: 'x',
  explanationForEachOption: { a: 'x', b: 'x', c: 'x' },
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
};

function attempt(overrides: Partial<Attempt>): Attempt {
  return {
    id: 'a1',
    questionId: 'q1',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-1',
    sessionType: 'practice',
    provenance: 'independently-authored',
    selectedAnswerIds: ['a'],
    correct: true,
    confidence: 'certain',
    responseTimeMs: 5000,
    timedOut: false,
    at: NOW,
    ...overrides,
  };
}

describe('review reason detection', () => {
  it('flags high-confidence incorrect as a misconception', () => {
    expect(reviewReasonForAttempt(q, attempt({ correct: false, confidence: 'certain' }))).toBe('high-confidence-incorrect');
  });
  it('flags low-confidence incorrect as plain incorrect', () => {
    expect(reviewReasonForAttempt(q, attempt({ correct: false, confidence: 'guess' }))).toBe('incorrect');
  });
  it('flags correct-but-unsure as low-confidence-correct', () => {
    expect(reviewReasonForAttempt(q, attempt({ correct: true, confidence: 'unsure' }))).toBe('low-confidence-correct');
  });
  it('flags very slow correct answers', () => {
    expect(reviewReasonForAttempt(q, attempt({ correct: true, confidence: 'certain', responseTimeMs: 60 * 1000 * 5 }))).toBe('too-slow');
  });
  it('does not schedule a confident, fast, correct answer', () => {
    expect(reviewReasonForAttempt(q, attempt({ correct: true, confidence: 'certain', responseTimeMs: 3000 }))).toBeNull();
  });
});

describe('scheduleFromAttempt', () => {
  it('creates a review item when warranted and none exists', () => {
    const item = scheduleFromAttempt(undefined, q, attempt({ correct: false, confidence: 'certain' }), NOW);
    expect(item).not.toBeNull();
    expect(item!.reason).toBe('high-confidence-incorrect');
    expect(item!.dueAt).toBe(NOW);
  });
  it('returns null when no review is warranted and none exists', () => {
    expect(scheduleFromAttempt(undefined, q, attempt({ correct: true, confidence: 'certain', responseTimeMs: 1000 }), NOW)).toBeNull();
  });
  it('escalates an existing item on a worse attempt and resets due date', () => {
    const existing = createReviewItem(q, 'low-confidence-correct', NOW - 5 * DAY);
    const updated = scheduleFromAttempt({ ...existing, dueAt: NOW + 5 * DAY, intervalDays: 5 }, q, attempt({ correct: false, confidence: 'certain' }), NOW);
    expect(updated!.reason).toBe('high-confidence-incorrect');
    expect(updated!.dueAt).toBe(NOW); // reset to due now after an incorrect answer
    expect(updated!.lapses).toBe(1);
  });
});

describe('applyGrade intervals', () => {
  const base = createReviewItem(q, 'incorrect', NOW);
  it('again reschedules within the day and counts a lapse', () => {
    const g = applyGrade(base, 'again', NOW);
    expect(g.intervalDays).toBe(BASE_INTERVAL_DAYS.again);
    expect(g.dueAt).toBe(NOW + BASE_INTERVAL_DAYS.again * DAY);
    expect(g.lapses).toBe(1);
    expect(g.reps).toBe(0);
  });
  it('good sets a 3-day interval on first pass', () => {
    const g = applyGrade(base, 'good', NOW);
    expect(g.intervalDays).toBe(BASE_INTERVAL_DAYS.good);
    expect(g.dueAt).toBe(NOW + 3 * DAY);
    expect(g.reps).toBe(1);
  });
  it('grows the interval on repeated good grades', () => {
    let item: ReviewItem = base;
    item = applyGrade(item, 'good', NOW); // 3
    const first = item.intervalDays;
    item = applyGrade(item, 'good', NOW); // grows
    expect(item.intervalDays).toBeGreaterThan(first);
  });
  it('caps the interval at 180 days', () => {
    let item: ReviewItem = { ...base, intervalDays: 170, reps: 10 };
    item = applyGrade(item, 'easy', NOW);
    expect(item.intervalDays).toBeLessThanOrEqual(180);
  });
});

describe('bucketReviews', () => {
  it('separates due, upcoming, and misconception items and prioritises misconceptions', () => {
    const items: ReviewItem[] = [
      { ...createReviewItem(q, 'incorrect', NOW), questionId: 'q1', dueAt: NOW - DAY },
      { ...createReviewItem(q, 'high-confidence-incorrect', NOW), questionId: 'q2', dueAt: NOW - 2 * DAY },
      { ...createReviewItem(q, 'manual', NOW), questionId: 'q3', dueAt: NOW + 3 * DAY },
    ];
    const b = bucketReviews(items, NOW);
    expect(b.dueNow.map((i) => i.questionId)).toContain('q1');
    expect(b.dueNow.map((i) => i.questionId)).toContain('q2');
    expect(b.upcoming.map((i) => i.questionId)).toEqual(['q3']);
    expect(b.misconceptions.map((i) => i.questionId)).toEqual(['q2']);
    // Highest priority (misconception) sorts first among due.
    expect(b.dueNow[0].questionId).toBe('q2');
  });
});
