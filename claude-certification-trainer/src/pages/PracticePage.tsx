import { useMemo, useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Flag, ArrowRight, RotateCcw, Filter, StickyNote } from 'lucide-react';
import type { AnswerConfidence, Attempt, Difficulty, Provenance, Question } from '@/schemas';
import { useQuestionBank, useActiveCertification } from '@/hooks/useDerived';
import { useStore } from '@/hooks/store';
import { getTaskStatements } from '@/data';
import { isSubmittable, toggleSelection } from '@/services/scoring';
import {
  ConfidencePicker,
  ExplanationPanel,
  QuestionMetaRow,
  QuestionOptions,
} from '@/components/question';
import { Button, Card, EmptyState, PageHeader, Segmented, Badge } from '@/components/ui';
import { shuffle } from '@/utils/shuffle';

type SpecialFilter = 'unseen' | 'incorrect' | 'bookmarked' | 'low-confidence' | 'due-review';

const DIFFICULTIES: (Difficulty | 'all')[] = ['all', 'easy', 'moderate', 'difficult'];

export function PracticePage() {
  const [searchParams] = useSearchParams();
  const bank = useQuestionBank();
  const { domains } = useActiveCertification();
  const store = useStore();
  const { state } = store;
  const { attempts, questionMeta, reviewItems } = state;

  const [domainId, setDomainId] = useState<string>(searchParams.get('domain') ?? 'all');
  const [taskId, setTaskId] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [qType, setQType] = useState<'all' | 'single-choice' | 'multiple-response'>('all');
  const [provenance, setProvenance] = useState<Provenance | 'all'>('all');
  const [specials, setSpecials] = useState<Set<SpecialFilter>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Map of last attempt per question.
  const lastAttempt = useMemo(() => {
    const m = new Map<string, Attempt>();
    for (const a of attempts) {
      const prev = m.get(a.questionId);
      if (!prev || a.at > prev.at) m.set(a.questionId, a);
    }
    return m;
  }, [attempts]);

  const toggleSpecial = (f: SpecialFilter) => {
    setSpecials((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const pool = useMemo(() => {
    const now = Date.now();
    return bank.filter((q) => {
      if (domainId !== 'all' && q.domainId !== domainId) return false;
      if (taskId !== 'all' && q.taskStatementId !== taskId) return false;
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
      if (qType !== 'all' && q.questionType !== qType) return false;
      if (provenance !== 'all' && q.provenance !== provenance) return false;
      const la = lastAttempt.get(q.id);
      const meta = questionMeta[q.id];
      const review = reviewItems[q.id];
      if (specials.has('unseen') && la) return false;
      if (specials.has('incorrect') && (!la || la.correct)) return false;
      if (specials.has('bookmarked') && !meta?.bookmarked) return false;
      if (specials.has('low-confidence') && !(la && (la.confidence === 'unsure' || la.confidence === 'guess'))) return false;
      if (specials.has('due-review') && !(review && review.dueAt <= now)) return false;
      return true;
    });
  }, [bank, domainId, taskId, difficulty, qType, provenance, specials, lastAttempt, questionMeta, reviewItems]);

  // The working queue: reshuffled whenever the pool identity changes.
  const [queue, setQueue] = useState<Question[]>([]);
  const [cursor, setCursor] = useState(0);
  const poolKey = pool.map((q) => q.id).join(',');
  useEffect(() => {
    setQueue(shuffle(pool));
    setCursor(0);
  }, [poolKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = queue[cursor];

  if (bank.length === 0) {
    return <EmptyState title="No questions available" description="The question bank is empty for this certification." />;
  }

  return (
    <div>
      <PageHeader
        title="Practice"
        description="Answer questions with full explanations. Filter by domain, difficulty, provenance, and your own history."
        actions={
          <Button variant="secondary" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
            <Filter className="h-4 w-4" /> Filters
          </Button>
        }
      />

      {showFilters && (
        <Card className="mb-6 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-ink">Domain</span>
              <select
                className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm"
                value={domainId}
                onChange={(e) => {
                  setDomainId(e.target.value);
                  setTaskId('all');
                }}
              >
                <option value="all">All domains</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-ink">Task statement</span>
              <select
                className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm disabled:opacity-50"
                value={taskId}
                disabled={domainId === 'all'}
                onChange={(e) => setTaskId(e.target.value)}
              >
                <option value="all">All task statements</option>
                {domainId !== 'all' &&
                  getTaskStatements(domainId).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} — {t.title}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Difficulty</span>
              <Segmented
                ariaLabel="Difficulty"
                value={difficulty}
                onChange={setDifficulty}
                options={DIFFICULTIES.map((d) => ({ label: d === 'all' ? 'All' : d[0].toUpperCase() + d.slice(1), value: d }))}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Question type</span>
              <Segmented
                ariaLabel="Question type"
                value={qType}
                onChange={setQType}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Single', value: 'single-choice' },
                  { label: 'Multiple', value: 'multiple-response' },
                ]}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Provenance</span>
              <Segmented
                ariaLabel="Provenance"
                value={provenance}
                onChange={setProvenance}
                options={[
                  { label: 'All', value: 'all' as const },
                  { label: 'Official', value: 'official-sample' as const },
                  { label: 'Study guide', value: 'repository-authored' as const },
                  { label: 'Authored', value: 'independently-authored' as const },
                ]}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Focus on</span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['unseen', 'Unseen'],
                    ['incorrect', 'Previously incorrect'],
                    ['bookmarked', 'Bookmarked'],
                    ['low-confidence', 'Low confidence'],
                    ['due-review', 'Due for review'],
                  ] as [SpecialFilter, string][]
                ).map(([f, label]) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={specials.has(f)}
                    onClick={() => toggleSpecial(f)}
                    className={
                      'rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ' +
                      (specials.has(f)
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-line bg-surface-raised text-ink-muted hover:text-ink')
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-4 flex items-center justify-between text-sm text-ink-muted">
        <span>
          {pool.length} question{pool.length === 1 ? '' : 's'} match
        </span>
        {current && (
          <span className="tabular-nums">
            {cursor + 1} / {queue.length}
          </span>
        )}
      </div>

      {!current ? (
        <EmptyState
          title="No questions match your filters"
          description="Loosen the filters to see more questions."
          action={
            <Button
              variant="primary"
              onClick={() => {
                setDomainId('all');
                setTaskId('all');
                setDifficulty('all');
                setQType('all');
                setProvenance('all');
                setSpecials(new Set());
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <PracticeQuestion
          key={current.id + cursor}
          question={current}
          isLast={cursor >= queue.length - 1}
          onNext={() => setCursor((c) => Math.min(c + 1, queue.length))}
          onRestart={() => {
            setQueue(shuffle(pool));
            setCursor(0);
          }}
        />
      )}
    </div>
  );
}

function PracticeQuestion({
  question,
  isLast,
  onNext,
  onRestart,
}: {
  question: Question;
  isLast: boolean;
  onNext: () => void;
  onRestart: () => void;
}) {
  const store = useStore();
  const meta = store.state.questionMeta[question.id];
  const [selected, setSelected] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<AnswerConfidence | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const startedAt = useRef(Date.now());

  const submit = () => {
    if (!isSubmittable(question, selected)) return;
    store.recordAttempt({
      question,
      selectedAnswerIds: selected,
      confidence,
      responseTimeMs: Date.now() - startedAt.current,
      timedOut: false,
      sessionType: 'practice',
    });
    setRevealed(true);
  };

  return (
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

      {!revealed && (
        <div className="mt-5 space-y-4">
          <ConfidencePicker value={confidence} onChange={setConfidence} />
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={submit} disabled={!isSubmittable(question, selected)}>
              Submit answer
            </Button>
            {!isSubmittable(question, selected) && (
              <span className="text-xs text-ink-subtle">
                {question.questionType === 'multiple-response'
                  ? `Select ${question.correctAnswerIds.length} answers`
                  : 'Select an answer'}
              </span>
            )}
          </div>
        </div>
      )}

      {revealed && (
        <>
          <ExplanationPanel question={question} selected={selected} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant={meta?.bookmarked ? 'primary' : 'secondary'}
              onClick={() => store.patchQuestionMeta(question.id, { bookmarked: !meta?.bookmarked })}
            >
              {meta?.bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {meta?.bookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
            <Button variant="secondary" onClick={() => store.addManualReview(question)}>
              <Flag className="h-4 w-4" /> Add to review
            </Button>
            <Button variant="ghost" onClick={() => setNoteOpen((o) => !o)} aria-expanded={noteOpen}>
              <StickyNote className="h-4 w-4" /> Note
            </Button>
            <div className="ml-auto flex gap-2">
              {isLast ? (
                <Button variant="primary" onClick={onRestart}>
                  <RotateCcw className="h-4 w-4" /> Restart set
                </Button>
              ) : (
                <Button variant="primary" onClick={onNext}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {noteOpen && (
            <div className="mt-3">
              <label htmlFor={`note-${question.id}`} className="mb-1 block text-sm font-medium text-ink">
                Personal note
              </label>
              <textarea
                id={`note-${question.id}`}
                className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm"
                rows={3}
                value={meta?.note ?? ''}
                onChange={(e) => store.patchQuestionMeta(question.id, { note: e.target.value })}
                placeholder="Why did you miss this? What's the key idea?"
              />
            </div>
          )}
          {meta?.markedForReview && (
            <Badge tone="info" className="mt-2">
              In review queue
            </Badge>
          )}
        </>
      )}
    </Card>
  );
}
