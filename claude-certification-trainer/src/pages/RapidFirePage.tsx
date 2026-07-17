import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
import type { AnswerConfidence, Question } from '@/schemas';
import { useQuestionBank } from '@/hooks/useDerived';
import { useStore } from '@/hooks/store';
import { isAnswerCorrect, isSubmittable, toggleSelection } from '@/services/scoring';
import { ConfidencePicker, QuestionMetaRow, QuestionOptions } from '@/components/question';
import { Button, Card, EmptyState, PageHeader, Segmented, StatTile, ProgressBar } from '@/components/ui';
import { AccuracyBars } from '@/components/charts';
import { seededShuffle, shuffle } from '@/utils/shuffle';
import { formatDuration, formatSeconds } from '@/utils/format';
import { domainById } from '@/data';

interface RoundAnswer {
  question: Question;
  selectedIds: string[];
  confidence: AnswerConfidence | null;
  responseTimeMs: number;
  timedOut: boolean;
  correct: boolean;
}

const ROUND_OPTIONS = [5, 10, 20];
const TIMER_OPTIONS = [15, 30, 45, 0]; // 0 = untimed

export function RapidFirePage() {
  const bank = useQuestionBank();
  const { state } = useStore();
  const [phase, setPhase] = useState<'config' | 'running' | 'results'>('config');
  const [round, setRound] = useState(state.settings.rapidFireDefaultRound);
  const [timer, setTimer] = useState(state.settings.rapidFireDefaultTimer);
  const [queue, setQueue] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<RoundAnswer[]>([]);

  const start = () => {
    const picked = shuffle(bank).slice(0, Math.min(round, bank.length));
    setQueue(picked);
    setAnswers([]);
    setPhase('running');
  };

  if (bank.length === 0) {
    return <EmptyState title="No questions available" description="The question bank is empty." />;
  }

  return (
    <div>
      <PageHeader
        title="Rapid Fire"
        description="Speed drills using full exam questions. One per screen, optional timer, keyboard shortcuts. No feedback until the round ends."
      />

      {phase === 'config' && (
        <Card className="p-6">
          <div className="space-y-5">
            <div>
              <span className="mb-2 block text-sm font-medium text-ink">Round length</span>
              <Segmented
                ariaLabel="Round length"
                value={round}
                onChange={setRound}
                options={ROUND_OPTIONS.map((n) => ({ label: `${n} questions`, value: n }))}
              />
              {round > bank.length && (
                <p className="mt-2 text-xs text-warning">
                  Only {bank.length} questions available — the round will be shorter.
                </p>
              )}
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-ink">Time per question</span>
              <Segmented
                ariaLabel="Timer"
                value={timer}
                onChange={setTimer}
                options={TIMER_OPTIONS.map((n) => ({ label: n === 0 ? 'Untimed' : `${n}s`, value: n }))}
              />
            </div>
            <div className="rounded-lg border border-line bg-surface-sunken p-3 text-sm text-ink-muted">
              <div className="mb-1 flex items-center gap-2 font-medium text-ink">
                <Zap className="h-4 w-4 text-brand" /> Keyboard shortcuts
              </div>
              Press <kbd className="rounded bg-surface-raised px-1.5 py-0.5 text-xs">1</kbd>–
              <kbd className="rounded bg-surface-raised px-1.5 py-0.5 text-xs">5</kbd> to select, and{' '}
              <kbd className="rounded bg-surface-raised px-1.5 py-0.5 text-xs">Enter</kbd> to advance.
            </div>
            <Button variant="primary" onClick={start}>
              <Zap className="h-4 w-4" /> Start round
            </Button>
          </div>
        </Card>
      )}

      {phase === 'running' && (
        <RapidRound
          queue={queue}
          timerSeconds={timer}
          onFinish={(a) => {
            setAnswers(a);
            setPhase('results');
          }}
        />
      )}

      {phase === 'results' && (
        <RapidResults answers={answers} onAgain={() => setPhase('config')} />
      )}
    </div>
  );
}

function RapidRound({
  queue,
  timerSeconds,
  onFinish,
}: {
  queue: Question[];
  timerSeconds: number;
  onFinish: (answers: RoundAnswer[]) => void;
}) {
  const store = useStore();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<AnswerConfidence | null>(null);
  const [remaining, setRemaining] = useState(timerSeconds);
  const startedAt = useRef(Date.now());
  const collected = useRef<RoundAnswer[]>([]);
  const question = queue[index];

  const advance = useCallback(
    (timedOut: boolean) => {
      const q = queue[index];
      const answer: RoundAnswer = {
        question: q,
        selectedIds: selected,
        confidence,
        responseTimeMs: Date.now() - startedAt.current,
        timedOut,
        correct: isAnswerCorrect(q, selected),
      };
      collected.current = [...collected.current, answer];
      // Persist the attempt immediately.
      store.recordAttempt({
        question: q,
        selectedAnswerIds: selected,
        confidence,
        responseTimeMs: answer.responseTimeMs,
        timedOut,
        sessionType: 'rapid-fire',
      });
      if (index + 1 >= queue.length) {
        onFinish(collected.current);
        return;
      }
      setIndex((i) => i + 1);
      setSelected([]);
      setConfidence(null);
      setRemaining(timerSeconds);
      startedAt.current = Date.now();
    },
    [index, queue, selected, confidence, store, onFinish, timerSeconds],
  );

  // Countdown timer with auto-advance.
  useEffect(() => {
    if (timerSeconds === 0) return;
    setRemaining(timerSeconds);
    const iv = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(iv);
          advance(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(iv);
    // Restart timer when the question changes.
  }, [index, timerSeconds, advance]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= question.answerOptions.length) {
        e.preventDefault();
        // Map key index to the displayed (seeded) option order.
        const ordered = seededShuffle(question.answerOptions, `${question.id}:${startedAt.current}`);
        const opt = ordered[n - 1];
        if (opt) setSelected((cur) => toggleSelection(question, cur, opt.id));
      } else if (e.key === 'Enter' && isSubmittable(question, selected)) {
        e.preventDefault();
        advance(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question, selected, advance]);

  const timePct = timerSeconds === 0 ? 1 : remaining / timerSeconds;
  const lowTime = timerSeconds > 0 && remaining <= 5;

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium tabular-nums text-ink-muted">
          Question {index + 1} of {queue.length}
        </span>
        {timerSeconds > 0 && (
          <span
            className={'flex items-center gap-1.5 text-sm font-semibold tabular-nums ' + (lowTime ? 'text-danger' : 'text-ink')}
            role="timer"
            aria-live={lowTime ? 'assertive' : 'off'}
          >
            <Clock className="h-4 w-4" /> {remaining}s{lowTime ? ' — hurry' : ''}
          </span>
        )}
      </div>
      <div className="mb-4">
        <ProgressBar value={(index) / queue.length} tone="brand" label="Round progress" />
      </div>
      {timerSeconds > 0 && (
        <div className="mb-4">
          <ProgressBar value={timePct} tone={lowTime ? 'danger' : 'info'} label="Time remaining" />
        </div>
      )}

      <QuestionMetaRow question={question} showProvenance={false} />
      <p className="mb-4 text-base font-medium text-ink">{question.prompt}</p>
      <QuestionOptions
        question={question}
        orderSeed={String(startedAt.current)}
        selected={selected}
        onToggle={(id) => setSelected((cur) => toggleSelection(question, cur, id))}
        revealed={false}
      />
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <ConfidencePicker value={confidence} onChange={setConfidence} />
        <Button variant="primary" onClick={() => advance(false)} disabled={!isSubmittable(question, selected)}>
          {index + 1 >= queue.length ? 'Finish' : 'Next'} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function RapidResults({ answers, onAgain }: { answers: RoundAnswer[]; onAgain: () => void }) {
  const correct = answers.filter((a) => a.correct).length;
  const accuracy = answers.length ? correct / answers.length : 0;
  const avgTime = answers.length
    ? answers.reduce((s, a) => s + a.responseTimeMs, 0) / answers.length
    : 0;

  const byDomain = useMemo(() => {
    const groups = new Map<string, { correct: number; total: number }>();
    for (const a of answers) {
      const g = groups.get(a.question.domainId) ?? { correct: 0, total: 0 };
      g.total += 1;
      if (a.correct) g.correct += 1;
      groups.set(a.question.domainId, g);
    }
    return [...groups.entries()].map(([id, g]) => ({
      label: domainById[id]?.title ?? id,
      value: g.correct / g.total,
      count: g.total,
    }));
  }, [answers]);

  const byConfidence = useMemo(() => {
    const order: AnswerConfidence[] = ['certain', 'fairly-sure', 'unsure', 'guess'];
    return order
      .map((c) => {
        const rows = answers.filter((a) => a.confidence === c);
        return { label: c, value: rows.length ? rows.filter((a) => a.correct).length / rows.length : 0, count: rows.length };
      })
      .filter((r) => r.count > 0);
  }, [answers]);

  const incorrect = answers.filter((a) => !a.correct);
  const correctLowConf = answers.filter((a) => a.correct && (a.confidence === 'unsure' || a.confidence === 'guess'));
  const incorrectHighConf = answers.filter(
    (a) => !a.correct && (a.confidence === 'certain' || a.confidence === 'fairly-sure'),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Score" value={`${correct}/${answers.length}`} tone="brand" />
        <StatTile label="Accuracy" value={`${Math.round(accuracy * 100)}%`} tone={accuracy >= 0.7 ? 'success' : 'warning'} />
        <StatTile label="Avg time" value={formatSeconds(avgTime)} hint="per question" />
        <StatTile label="Total time" value={formatDuration(answers.reduce((s, a) => s + a.responseTimeMs, 0))} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">Accuracy by domain</h2>
          <AccuracyBars data={byDomain} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">Accuracy by confidence</h2>
          <AccuracyBars data={byConfidence} emptyLabel="No confidence recorded" />
          <p className="mt-3 text-xs text-ink-muted">
            Well-calibrated learners are accurate when "certain" and less so when they "guess".
          </p>
        </Card>
      </div>

      {incorrectHighConf.length > 0 && (
        <Card className="border-danger/30 p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-danger">
            <AlertTriangle className="h-4 w-4" /> Misconceptions ({incorrectHighConf.length})
          </h2>
          <p className="mb-3 text-sm text-ink-muted">
            You were confident but wrong on these — the highest-priority items to review.
          </p>
          <ul className="space-y-1.5 text-sm">
            {incorrectHighConf.map((a) => (
              <li key={a.question.id} className="text-ink">
                • {a.question.prompt}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <RecommendationList title={`Incorrect (${incorrect.length})`} items={incorrect.map((a) => a.question.prompt)} emptyText="Nothing incorrect — great round!" />
        <RecommendationList
          title={`Correct but unsure (${correctLowConf.length})`}
          items={correctLowConf.map((a) => a.question.prompt)}
          emptyText="No low-confidence correct answers."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={onAgain}>
          <RotateCcw className="h-4 w-4" /> New round
        </Button>
        <Link to="/review" className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-raised px-4 py-2 text-sm font-medium hover:bg-surface-sunken">
          Go to review queue
        </Link>
      </div>
    </div>
  );
}

function RecommendationList({ title, items, emptyText }: { title: string; items: string[]; emptyText: string }) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-sm font-semibold text-ink">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-1.5 text-sm text-ink-muted">
          {items.map((t, i) => (
            <li key={i}>• {t}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
