import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { useStore } from '@/hooks/store';
import { questionById } from '@/data';
import { isAnswerCorrect, toggleSelection } from '@/services/scoring';
import { Button } from '@/components/ui';
import { QuestionMetaRow } from '@/components/question';
import { formatClock } from '@/utils/format';
import { makeId } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { MockExamResult } from '@/schemas';

export function MockExamSessionPage() {
  const store = useStore();
  const navigate = useNavigate();
  const session = store.state.activeMockSession;
  const [now, setNow] = useState(Date.now());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submittedRef = useRef(false);

  const durationMs = session ? session.timeLimitMinutes * 60_000 : 0;
  const remaining = session ? Math.max(0, durationMs - (now - session.startedAt)) : 0;

  const submit = useCallback(() => {
    if (!session || submittedRef.current) return;
    submittedRef.current = true;
    const domainBreakdown: MockExamResult['domainBreakdown'] = {};
    const attemptIds: string[] = [];
    let correctCount = 0;
    const finishedAt = Date.now();

    for (const qid of session.questionIds) {
      const q = questionById[qid];
      if (!q) continue;
      const selected = session.answers[qid] ?? [];
      const attempt = store.recordAttempt({
        question: q,
        selectedAnswerIds: selected,
        confidence: null,
        responseTimeMs: 0,
        timedOut: false,
        sessionType: 'mock-exam',
      });
      attemptIds.push(attempt.id);
      const correct = isAnswerCorrect(q, selected);
      if (correct) correctCount += 1;
      const db = (domainBreakdown[q.domainId] ??= { correct: 0, total: 0 });
      db.total += 1;
      if (correct) db.correct += 1;
    }

    const total = session.questionIds.length;
    const result: MockExamResult = {
      id: makeId('mockres'),
      certificationId: session.certificationId,
      startedAt: session.startedAt,
      finishedAt,
      timeLimitMinutes: session.timeLimitMinutes,
      timeUsedMs: Math.min(finishedAt - session.startedAt, durationMs),
      totalQuestions: total,
      correctCount,
      accuracy: total ? correctCount / total : 0,
      domainBreakdown,
      attemptIds,
    };
    store.finishMock(result);
    navigate('/mock-exam/results');
  }, [session, store, navigate, durationMs]);

  // Tick the clock and auto-submit at zero.
  useEffect(() => {
    const iv = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(iv);
  }, []);

  useEffect(() => {
    if (session && remaining <= 0 && !submittedRef.current) submit();
  }, [remaining, session, submit]);

  // Warn before leaving with an exam in progress.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (session && !submittedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [session]);

  const question = session ? questionById[session.questionIds[session.currentIndex]] : undefined;
  const orderedOptions = useMemo(() => {
    if (!session || !question) return [];
    const order = session.optionOrder[question.id] ?? question.answerOptions.map((o) => o.id);
    return order.map((id) => question.answerOptions.find((o) => o.id === id)!).filter(Boolean);
  }, [session, question]);

  if (!session) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-muted">No exam in progress.</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/mock-exam')}>
          Go to mock exam setup
        </Button>
      </div>
    );
  }
  if (!question) return null;

  const selected = session.answers[question.id] ?? [];
  const isFlagged = session.flagged.includes(question.id);
  const lowTime = remaining <= 5 * 60_000;
  const answeredCount = session.questionIds.filter((id) => (session.answers[id] ?? []).length > 0).length;

  const setAnswer = (optId: string) => {
    const next = toggleSelection(question, selected, optId);
    store.patchMock({ answers: { ...session.answers, [question.id]: next } });
  };
  const toggleFlag = () => {
    const flagged = isFlagged ? session.flagged.filter((id) => id !== question.id) : [...session.flagged, question.id];
    store.patchMock({ flagged });
  };
  const goTo = (i: number) => store.patchMock({ currentIndex: Math.max(0, Math.min(i, session.questionIds.length - 1)) });

  return (
    <div className="mx-auto max-w-4xl">
      {/* Exam header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-raised px-4 py-3">
        <div className="text-sm font-medium text-ink">
          Question {session.currentIndex + 1} of {session.questionIds.length}
          <span className="ml-2 text-ink-subtle">· {answeredCount} answered</span>
        </div>
        <div
          className={cn('flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums', lowTime ? 'bg-danger/10 text-danger' : 'bg-surface-sunken text-ink')}
          role="timer"
          aria-live={lowTime ? 'assertive' : 'off'}
          aria-label={`Time remaining ${formatClock(remaining)}`}
        >
          <Clock className="h-4 w-4" /> {formatClock(remaining)}
          {lowTime && <span className="sr-only">Less than five minutes remaining</span>}
        </div>
      </div>

      {/* Nav grid */}
      <div className="mb-4 rounded-xl border border-line bg-surface-raised p-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Question navigator">
          {session.questionIds.map((id, i) => {
            const answered = (session.answers[id] ?? []).length > 0;
            const flagged = session.flagged.includes(id);
            const current = i === session.currentIndex;
            return (
              <button
                key={id}
                type="button"
                onClick={() => goTo(i)}
                aria-current={current}
                aria-label={`Question ${i + 1}${answered ? ', answered' : ', unanswered'}${flagged ? ', flagged' : ''}`}
                className={cn(
                  'relative h-8 w-8 rounded-md border text-xs font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  current
                    ? 'border-brand bg-brand text-white'
                    : answered
                      ? 'border-brand/40 bg-brand/10 text-brand'
                      : 'border-line bg-surface-raised text-ink-muted hover:bg-surface-sunken',
                )}
              >
                {i + 1}
                {flagged && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-warning" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-subtle">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-brand/40" /> Answered</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm border border-line" /> Unanswered</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-warning" /> Flagged</span>
        </div>
      </div>

      {/* Question */}
      <div className="rounded-xl border border-line bg-surface-raised p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <QuestionMetaRow question={question} showProvenance={false} />
          <button
            type="button"
            onClick={toggleFlag}
            aria-pressed={isFlagged}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
              isFlagged ? 'border-warning bg-warning/10 text-warning' : 'border-line text-ink-muted hover:text-ink',
            )}
          >
            <Flag className="h-3.5 w-3.5" /> {isFlagged ? 'Flagged' : 'Flag'}
          </button>
        </div>
        <p className="mb-4 text-base font-medium text-ink">{question.prompt}</p>

        <ul className="space-y-2" role={question.questionType === 'multiple-response' ? 'group' : 'radiogroup'}>
          {orderedOptions.map((opt, idx) => {
            const isSel = selected.includes(opt.id);
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => setAnswer(opt.id)}
                  role={question.questionType === 'multiple-response' ? 'checkbox' : 'radio'}
                  aria-checked={isSel}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                    isSel ? 'border-brand bg-brand/10' : 'border-line bg-surface-raised hover:border-brand/40',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                      isSel ? 'border-brand bg-brand text-white' : 'border-ink-subtle text-ink-subtle',
                    )}
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-ink">{opt.text}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex items-center justify-between">
          <Button variant="secondary" onClick={() => goTo(session.currentIndex - 1)} disabled={session.currentIndex === 0}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          {session.currentIndex >= session.questionIds.length - 1 ? (
            <Button variant="primary" onClick={() => (store.state.settings.confirmBeforeMockSubmit ? setConfirmOpen(true) : submit())}>
              Submit exam
            </Button>
          ) : (
            <Button variant="primary" onClick={() => goTo(session.currentIndex + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Abandon this exam? Your answers will be discarded.')) {
              store.abandonMock();
              navigate('/mock-exam');
            }
          }}
          className="text-sm text-ink-subtle hover:text-danger"
        >
          Abandon exam
        </button>
        <Button variant="secondary" onClick={() => (store.state.settings.confirmBeforeMockSubmit ? setConfirmOpen(true) : submit())}>
          Submit now
        </Button>
      </div>

      {/* Submit confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="w-full max-w-md rounded-xl border border-line bg-surface-raised p-6 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 id="confirm-title" className="text-lg font-semibold text-ink">Submit exam?</h2>
              <button onClick={() => setConfirmOpen(false)} aria-label="Close" className="rounded p-1 hover:bg-surface-sunken">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-ink-muted">
              You have answered {answeredCount} of {session.questionIds.length} questions
              {answeredCount < session.questionIds.length && <> ({session.questionIds.length - answeredCount} unanswered will be marked incorrect)</>}.
              This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Keep working</Button>
              <Button variant="primary" onClick={submit}>Submit exam</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
