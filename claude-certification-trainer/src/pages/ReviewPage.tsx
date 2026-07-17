import { useMemo, useRef, useState } from 'react';
import { RotateCcw, AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import type { AnswerConfidence, Question, ReviewGrade, ReviewItem } from '@/schemas';
import { useStore } from '@/hooks/store';
import { useActiveCertification } from '@/hooks/useDerived';
import { questionById, domainById } from '@/data';
import { bucketReviews, BASE_INTERVAL_DAYS } from '@/services/review';
import { isSubmittable, toggleSelection } from '@/services/scoring';
import { ConfidencePicker, ExplanationPanel, QuestionMetaRow, QuestionOptions } from '@/components/question';
import { Button, Card, EmptyState, PageHeader, StatTile, Badge } from '@/components/ui';
import { formatRelativeTime } from '@/utils/format';

const REASON_LABEL: Record<ReviewItem['reason'], string> = {
  'high-confidence-incorrect': 'Confident but wrong',
  incorrect: 'Answered incorrectly',
  'too-slow': 'Answered slowly',
  'low-confidence-correct': 'Correct but unsure',
  manual: 'Marked for review',
};

const GRADE_META: { grade: ReviewGrade; label: string; hint: string; tone: 'danger' | 'warning' | 'info' | 'success' }[] = [
  { grade: 'again', label: 'Again', hint: 'later today', tone: 'danger' },
  { grade: 'hard', label: 'Hard', hint: '1 day', tone: 'warning' },
  { grade: 'good', label: 'Good', hint: '3 days', tone: 'info' },
  { grade: 'easy', label: 'Easy', hint: '7 days', tone: 'success' },
];

export function ReviewPage() {
  const store = useStore();
  const { cert } = useActiveCertification();
  const [sessionActive, setSessionActive] = useState(false);

  const items = useMemo(
    () => Object.values(store.state.reviewItems).filter((r) => r.certificationId === cert.id),
    [store.state.reviewItems, cert.id],
  );
  const buckets = useMemo(() => bucketReviews(items, Date.now()), [items]);

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Review" description="Spaced repetition surfaces the questions you most need to revisit." />
        <EmptyState
          icon={<RotateCcw className="h-8 w-8" />}
          title="Your review queue is empty"
          description="Questions you miss, answer with low confidence, or answer slowly will appear here, scheduled with spaced repetition."
        />
      </div>
    );
  }

  if (sessionActive && buckets.dueNow.length > 0) {
    return <ReviewRunner dueItems={buckets.dueNow} onExit={() => setSessionActive(false)} />;
  }

  return (
    <div>
      <PageHeader
        title="Review"
        description="A simple, explainable spaced-repetition system. Incorrect high-confidence answers (misconceptions) get the highest priority."
        actions={
          buckets.dueNow.length > 0 ? (
            <Button variant="primary" onClick={() => setSessionActive(true)}>
              <RotateCcw className="h-4 w-4" /> Review {buckets.dueNow.length} due
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Due now" value={buckets.dueNow.length} tone={buckets.dueNow.length ? 'brand' : 'neutral'} />
        <StatTile label="Overdue" value={buckets.overdue.length} tone={buckets.overdue.length ? 'danger' : 'neutral'} />
        <StatTile label="Due today" value={buckets.dueToday.length} tone="info" />
        <StatTile label="Misconceptions" value={buckets.misconceptions.length} tone={buckets.misconceptions.length ? 'warning' : 'neutral'} />
      </div>

      {buckets.dueNow.length === 0 && (
        <Card className="mb-6 p-5 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success" />
          <p className="text-sm text-ink">Nothing due right now. Come back later for your next review.</p>
        </Card>
      )}

      {buckets.misconceptions.length > 0 && (
        <Card className="mb-6 border-warning/30 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-warning">
            <AlertTriangle className="h-4 w-4" /> High-priority misconceptions
          </h2>
          <QueueList items={buckets.misconceptions} />
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <CalendarClock className="h-4 w-4 text-brand" /> Upcoming ({buckets.upcoming.length})
          </h2>
          {buckets.upcoming.length === 0 ? (
            <p className="text-sm text-ink-muted">No upcoming reviews scheduled.</p>
          ) : (
            <QueueList items={buckets.upcoming.slice(0, 10)} showDue />
          )}
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">How scheduling works</h2>
          <ul className="space-y-1.5 text-sm text-ink-muted">
            <li>• <strong className="text-ink">Again</strong> → later today ({BASE_INTERVAL_DAYS.again} day)</li>
            <li>• <strong className="text-ink">Hard</strong> → {BASE_INTERVAL_DAYS.hard} day</li>
            <li>• <strong className="text-ink">Good</strong> → {BASE_INTERVAL_DAYS.good} days</li>
            <li>• <strong className="text-ink">Easy</strong> → {BASE_INTERVAL_DAYS.easy} days</li>
          </ul>
          <p className="mt-3 text-xs text-ink-subtle">
            Intervals grow after repeated correct grades. Incorrect high-confidence answers are surfaced first. Full details in docs/review-system.md.
          </p>
        </Card>
      </div>
    </div>
  );
}

function QueueList({ items, showDue }: { items: ReviewItem[]; showDue?: boolean }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const q = questionById[item.questionId];
        if (!q) return null;
        return (
          <li key={item.questionId} className="flex items-start justify-between gap-3 border-b border-line pb-2 text-sm last:border-0">
            <div>
              <p className="text-ink">{q.prompt}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{domainById[item.domainId]?.title ?? item.domainId}</Badge>
                <span className="text-xs text-ink-subtle">{REASON_LABEL[item.reason]}</span>
              </div>
            </div>
            {showDue && <span className="whitespace-nowrap text-xs text-ink-subtle">{formatRelativeTime(item.dueAt)}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function ReviewRunner({ dueItems, onExit }: { dueItems: ReviewItem[]; onExit: () => void }) {
  const store = useStore();
  // Freeze the queue for this session.
  const queue = useRef(dueItems.map((i) => i.questionId)).current;
  const [index, setIndex] = useState(0);
  const questionId = queue[index];
  const question = questionById[questionId] as Question | undefined;

  const [selected, setSelected] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<AnswerConfidence | null>(null);
  const [revealed, setRevealed] = useState(false);
  const startedAt = useRef(Date.now());

  if (!question) {
    return (
      <EmptyState
        title="Review complete"
        description="These items are no longer available."
        action={<Button variant="primary" onClick={onExit}>Back to review</Button>}
      />
    );
  }

  const submit = () => {
    if (!isSubmittable(question, selected)) return;
    store.recordAttempt({
      question,
      selectedAnswerIds: selected,
      confidence,
      responseTimeMs: Date.now() - startedAt.current,
      timedOut: false,
      sessionType: 'review',
    });
    setRevealed(true);
  };

  const grade = (g: ReviewGrade) => {
    store.gradeReview(questionId, g);
    if (index + 1 >= queue.length) {
      onExit();
      return;
    }
    setIndex((i) => i + 1);
    setSelected([]);
    setConfidence(null);
    setRevealed(false);
    startedAt.current = Date.now();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium tabular-nums text-ink-muted">
          Review {index + 1} of {queue.length}
        </span>
        <button onClick={onExit} className="text-sm text-ink-subtle hover:text-ink">
          End session
        </button>
      </div>

      <Card className="p-5 sm:p-6">
        <QuestionMetaRow question={question} showProvenance={store.state.settings.showProvenanceBadges} />
        <p className="mb-4 text-base font-medium text-ink">{question.prompt}</p>
        <QuestionOptions
          question={question}
          orderSeed={String(startedAt.current)}
          selected={selected}
          onToggle={(id) => setSelected((cur) => toggleSelection(question, cur, id))}
          revealed={revealed}
        />

        {!revealed ? (
          <div className="mt-5 space-y-4">
            <ConfidencePicker value={confidence} onChange={setConfidence} />
            <Button variant="primary" onClick={submit} disabled={!isSubmittable(question, selected)}>
              Show answer
            </Button>
          </div>
        ) : (
          <>
            <ExplanationPanel question={question} selected={selected} />
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-ink">How well did you know this?</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {GRADE_META.map((g) => (
                  <button
                    key={g.grade}
                    type="button"
                    onClick={() => grade(g.grade)}
                    className="flex flex-col items-center rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <span>{g.label}</span>
                    <span className="text-xs text-ink-subtle">{g.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
