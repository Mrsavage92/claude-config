import { describe, it, expect } from 'vitest';
import { computeReadiness, readinessLabel, READINESS_WEIGHTS } from './readiness';
import type { Attempt, Domain, MockExamResult } from '@/schemas';

const NOW = 1_700_000_000_000;

function domain(id: string, weighting: number): Domain {
  return {
    id,
    certificationId: 'ccao-f',
    title: id,
    description: 'd',
    weighting,
    order: 1,
    taskStatementIds: ['ts-1-1'],
    lessonIds: [],
    sourceIds: [],
  };
}

function attempt(id: string, domainId: string, correct: boolean, at: number): Attempt {
  return {
    id,
    questionId: id,
    certificationId: 'ccao-f',
    domainId,
    taskStatementId: null,
    sessionType: 'practice',
    provenance: 'independently-authored',
    selectedAnswerIds: [],
    correct,
    confidence: 'certain',
    responseTimeMs: 3000,
    timedOut: false,
    at,
  };
}

const domains = [domain('d1', 0.5), domain('d2', 0.5)];

describe('computeReadiness', () => {
  it('is 0 with no data', () => {
    const r = computeReadiness({ attempts: [], domains, reviewItems: [], mockResults: [], now: NOW });
    expect(r.score).toBe(0);
    expect(r.hasData).toBe(false);
  });

  it('weights sum to 1', () => {
    const sum = Object.values(READINESS_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
  });

  it('rewards accurate, recent, well-covered practice', () => {
    const attempts: Attempt[] = [];
    for (let i = 0; i < 4; i++) attempts.push(attempt(`d1-${i}`, 'd1', true, NOW - 1000));
    for (let i = 0; i < 4; i++) attempts.push(attempt(`d2-${i}`, 'd2', true, NOW - 1000));
    const mock: MockExamResult = {
      id: 'm1',
      certificationId: 'ccao-f',
      startedAt: NOW - 10000,
      finishedAt: NOW - 5000,
      timeLimitMinutes: 120,
      timeUsedMs: 5000,
      totalQuestions: 10,
      correctCount: 9,
      accuracy: 0.9,
      domainBreakdown: {},
      attemptIds: [],
    };
    const r = computeReadiness({ attempts, domains, reviewItems: [], mockResults: [mock], now: NOW });
    expect(r.score).toBeGreaterThan(70);
    expect(r.components.accuracy).toBe(1);
    expect(r.components.domainCoverage).toBe(1);
    expect(r.components.recency).toBe(1);
  });

  it('penalises stale, low-accuracy practice', () => {
    const stale = 25 * 24 * 60 * 60 * 1000;
    const attempts = [attempt('x', 'd1', false, NOW - stale)];
    const r = computeReadiness({ attempts, domains, reviewItems: [], mockResults: [], now: NOW });
    expect(r.components.recency).toBe(0);
    expect(r.components.accuracy).toBe(0);
    expect(r.score).toBeLessThan(40);
  });

  it('uses the latest attempt per question for accuracy', () => {
    const attempts = [attempt('q', 'd1', false, NOW - 2000), attempt('q', 'd1', true, NOW - 1000)];
    const r = computeReadiness({ attempts, domains, reviewItems: [], mockResults: [], now: NOW });
    // Latest attempt for q is correct → accuracy component 1.
    expect(r.components.accuracy).toBe(1);
  });
});

describe('readinessLabel', () => {
  it('maps score ranges to labels', () => {
    expect(readinessLabel(10).tone).toBe('danger');
    expect(readinessLabel(50).tone).toBe('warning');
    expect(readinessLabel(70).tone).toBe('info');
    expect(readinessLabel(90).tone).toBe('success');
  });
});
