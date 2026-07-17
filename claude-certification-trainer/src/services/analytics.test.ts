import { describe, it, expect } from 'vitest';
import { accuracyOf, accuracyByDomain, latestAttemptPerQuestion, confidenceCalibration, calibrationScore } from './analytics';
import type { Attempt } from '@/schemas';

function att(overrides: Partial<Attempt>): Attempt {
  return {
    id: Math.random().toString(),
    questionId: 'q',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: null,
    sessionType: 'practice',
    provenance: 'independently-authored',
    selectedAnswerIds: [],
    correct: true,
    confidence: 'certain',
    responseTimeMs: 1000,
    timedOut: false,
    at: 1,
    ...overrides,
  };
}

describe('accuracy', () => {
  it('is 0 for no attempts (NaN-safe)', () => {
    expect(accuracyOf([]).accuracy).toBe(0);
  });
  it('computes correct/total', () => {
    const stat = accuracyOf([att({ correct: true }), att({ correct: false }), att({ correct: true })]);
    expect(stat.total).toBe(3);
    expect(stat.correct).toBe(2);
    expect(stat.accuracy).toBeCloseTo(2 / 3);
  });
  it('groups by domain', () => {
    const by = accuracyByDomain([att({ domainId: 'd1', correct: true }), att({ domainId: 'd2', correct: false })]);
    expect(by.d1.accuracy).toBe(1);
    expect(by.d2.accuracy).toBe(0);
  });
});

describe('latestAttemptPerQuestion', () => {
  it('keeps only the newest attempt per question', () => {
    const latest = latestAttemptPerQuestion([
      att({ questionId: 'q1', correct: false, at: 1 }),
      att({ questionId: 'q1', correct: true, at: 2 }),
    ]);
    expect(latest).toHaveLength(1);
    expect(latest[0].correct).toBe(true);
  });
});

describe('confidence calibration', () => {
  it('rewards being right when certain and wrong when guessing', () => {
    const wellCalibrated = [
      att({ confidence: 'certain', correct: true }),
      att({ confidence: 'certain', correct: true }),
      att({ confidence: 'guess', correct: false }),
    ];
    const poorlyCalibrated = [
      att({ confidence: 'certain', correct: false }),
      att({ confidence: 'certain', correct: false }),
      att({ confidence: 'guess', correct: true }),
    ];
    expect(calibrationScore(wellCalibrated)).toBeGreaterThan(calibrationScore(poorlyCalibrated));
  });

  it('returns one row per confidence level', () => {
    const rows = confidenceCalibration([att({ confidence: 'certain' })]);
    expect(rows).toHaveLength(4);
  });
});
