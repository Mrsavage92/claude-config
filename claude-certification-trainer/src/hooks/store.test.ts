import { describe, it, expect } from 'vitest';
import { _storeReducer } from './store';
import { makeDefaultState } from '@/services/storage/defaults';
import type { Attempt, MockExamSession, PersistedState, Question } from '@/schemas';

const question: Question = {
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
    id: 'att1',
    questionId: 'q1',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-1',
    sessionType: 'practice',
    provenance: 'independently-authored',
    selectedAnswerIds: ['b'],
    correct: false,
    confidence: 'certain',
    responseTimeMs: 2000,
    timedOut: false,
    at: 1000,
    ...overrides,
  };
}

describe('store reducer', () => {
  let state: PersistedState;
  beforeEach(() => {
    state = makeDefaultState();
  });

  it('records an attempt and schedules a review for a confident wrong answer', () => {
    const next = _storeReducer(state, { type: 'record-attempt', attempt: attempt({}), question });
    expect(next.attempts).toHaveLength(1);
    expect(next.reviewItems['q1']).toBeDefined();
    expect(next.reviewItems['q1'].reason).toBe('high-confidence-incorrect');
  });

  it('does not schedule a review for a confident correct answer', () => {
    const next = _storeReducer(state, {
      type: 'record-attempt',
      attempt: attempt({ correct: true, selectedAnswerIds: ['a'], responseTimeMs: 1000 }),
      question,
    });
    expect(next.reviewItems['q1']).toBeUndefined();
  });

  it('grades a review to push its due date into the future', () => {
    let next = _storeReducer(state, { type: 'record-attempt', attempt: attempt({}), question });
    next = _storeReducer(next, { type: 'grade-review', questionId: 'q1', grade: 'good', now: 5000 });
    expect(next.reviewItems['q1'].dueAt).toBeGreaterThan(5000);
    expect(next.reviewItems['q1'].reps).toBe(1);
  });

  it('adds and removes manual reviews', () => {
    let next = _storeReducer(state, { type: 'add-manual-review', question, now: 100 });
    expect(next.reviewItems['q1'].reason).toBe('manual');
    next = _storeReducer(next, { type: 'remove-review', questionId: 'q1' });
    expect(next.reviewItems['q1']).toBeUndefined();
  });

  it('persists a mock session across start/patch and clears it on finish', () => {
    const session: MockExamSession = {
      id: 'm1',
      certificationId: 'ccao-f',
      startedAt: 0,
      timeLimitMinutes: 120,
      questionIds: ['q1', 'q2'],
      answers: {},
      flagged: [],
      currentIndex: 0,
      optionOrder: {},
    };
    let next = _storeReducer(state, { type: 'start-mock', session });
    expect(next.activeMockSession?.id).toBe('m1');

    next = _storeReducer(next, { type: 'patch-mock', patch: { answers: { q1: ['a'] }, currentIndex: 1 } });
    expect(next.activeMockSession?.answers.q1).toEqual(['a']);
    expect(next.activeMockSession?.currentIndex).toBe(1);

    next = _storeReducer(next, {
      type: 'finish-mock',
      result: {
        id: 'r1',
        certificationId: 'ccao-f',
        startedAt: 0,
        finishedAt: 1,
        timeLimitMinutes: 120,
        timeUsedMs: 1,
        totalQuestions: 2,
        correctCount: 1,
        accuracy: 0.5,
        domainBreakdown: {},
        attemptIds: [],
      },
    });
    expect(next.activeMockSession).toBeNull();
    expect(next.mockResults).toHaveLength(1);
  });

  it('updates settings and theme, and resets to defaults', () => {
    let next = _storeReducer(state, { type: 'update-settings', patch: { reduceMotion: true } });
    expect(next.settings.reduceMotion).toBe(true);
    next = _storeReducer(next, { type: 'set-theme', mode: 'dark' });
    expect(next.theme.mode).toBe('dark');
    next = _storeReducer(next, { type: 'reset' });
    expect(next.settings.reduceMotion).toBe(false);
    expect(next.theme.mode).toBe('system');
  });
});
