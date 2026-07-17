import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Check, X, ArrowRight, RotateCcw, BookOpen } from 'lucide-react';
import type { FlashFire } from '@/schemas';
import { getFlashFire, lessonById } from '@/data';
import { useActiveCertification } from '@/hooks/useDerived';
import { isAnswerCorrect } from '@/services/scoring';
import { Button, Card, EmptyState, PageHeader, Segmented, StatTile, ProgressBar } from '@/components/ui';
import { seededShuffle, shuffle } from '@/utils/shuffle';
import { cn } from '@/utils/cn';

const COUNT_OPTIONS = [10, 15, 20];

export function FlashFirePage() {
  const { cert, domains } = useActiveCertification();
  const all = useMemo(() => getFlashFire(cert.id), [cert.id]);
  const [phase, setPhase] = useState<'config' | 'running' | 'results'>('config');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [count, setCount] = useState(15);
  const [queue, setQueue] = useState<FlashFire[]>([]);
  const [results, setResults] = useState<{ item: FlashFire; correct: boolean }[]>([]);

  const start = () => {
    const pool = domainFilter === 'all' ? all : all.filter((f) => f.domainId === domainFilter);
    setQueue(shuffle(pool).slice(0, Math.min(count, pool.length)));
    setResults([]);
    setPhase('running');
  };

  if (all.length === 0) {
    return <EmptyState title="No Flash Fire items" description="There are no Flash Fire items for this certification." />;
  }

  return (
    <div>
      <PageHeader
        title="Flash Fire"
        description="Short, fast-recognition drills. One clear concept each, with instant feedback — build reflexes, then dive into the linked lessons."
      />

      {phase === 'config' && (
        <Card className="p-6">
          <div className="space-y-5">
            <div>
              <span className="mb-2 block text-sm font-medium text-ink">Domain</span>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={domainFilter === 'all'} onClick={() => setDomainFilter('all')}>
                  All
                </FilterChip>
                {domains.map((d) => (
                  <FilterChip key={d.id} active={domainFilter === d.id} onClick={() => setDomainFilter(d.id)}>
                    {d.title}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-ink">Number of cards</span>
              <Segmented
                ariaLabel="Card count"
                value={count}
                onChange={setCount}
                options={COUNT_OPTIONS.map((n) => ({ label: `${n}`, value: n }))}
              />
            </div>
            <Button variant="primary" onClick={start}>
              <Flame className="h-4 w-4" /> Start Flash Fire
            </Button>
          </div>
        </Card>
      )}

      {phase === 'running' && (
        <FlashRound
          queue={queue}
          onFinish={(r) => {
            setResults(r);
            setPhase('results');
          }}
        />
      )}

      {phase === 'results' && <FlashResults results={results} onAgain={() => setPhase('config')} />}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        active ? 'border-brand bg-brand/10 text-brand' : 'border-line bg-surface-raised text-ink-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function FlashRound({ queue, onFinish }: { queue: FlashFire[]; onFinish: (r: { item: FlashFire; correct: boolean }[]) => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [collected, setCollected] = useState<{ item: FlashFire; correct: boolean }[]>([]);
  const item = queue[index];
  const ordered = useMemo(() => seededShuffle(item.answerOptions, `${item.id}:${index}`), [item, index]);
  const correctSet = new Set(item.correctAnswerIds);

  const choose = (optId: string) => {
    if (picked) return;
    setPicked(optId);
  };

  const next = () => {
    const correct = picked ? isAnswerCorrect(item as unknown as Parameters<typeof isAnswerCorrect>[0], [picked]) : false;
    const nextCollected = [...collected, { item, correct }];
    if (index + 1 >= queue.length) {
      onFinish(nextCollected);
      return;
    }
    setCollected(nextCollected);
    setIndex((i) => i + 1);
    setPicked(null);
  };

  const answered = picked !== null;

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between text-sm text-ink-muted">
        <span className="flex items-center gap-1.5 font-medium">
          <Flame className="h-4 w-4 text-brand" /> {index + 1} of {queue.length}
        </span>
        <span className="tabular-nums">{collected.filter((c) => c.correct).length} correct</span>
      </div>
      <ProgressBar value={index / queue.length} className="mb-5" />

      <p className="mb-4 text-lg font-semibold text-ink">{item.prompt}</p>
      <ul className="space-y-2" role="radiogroup" aria-label="Options">
        {ordered.map((opt) => {
          const isCorrect = correctSet.has(opt.id);
          const isPicked = picked === opt.id;
          let cls = 'border-line bg-surface-raised hover:border-brand/40';
          if (answered) {
            if (isCorrect) cls = 'border-success/50 bg-success/10';
            else if (isPicked) cls = 'border-danger/50 bg-danger/10';
            else cls = 'border-line opacity-70';
          }
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => choose(opt.id)}
                disabled={answered}
                role="radio"
                aria-checked={isPicked}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  cls,
                )}
              >
                {answered && isCorrect && <Check className="h-4 w-4 flex-shrink-0 text-success" />}
                {answered && isPicked && !isCorrect && <X className="h-4 w-4 flex-shrink-0 text-danger" />}
                <span className="text-ink">{opt.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div className="mt-4 animate-fade-in rounded-lg border border-line bg-surface-sunken p-4">
          <p className="text-sm text-ink-muted">{item.explanation}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {item.relatedLessonIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {item.relatedLessonIds.map((id) => {
                  const lesson = lessonById[id];
                  if (!lesson) return null;
                  return (
                    <Link
                      key={id}
                      to={`/learn/${lesson.domainId}#${lesson.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-2.5 py-1 text-xs text-ink-muted hover:border-brand/40 hover:text-brand"
                    >
                      <BookOpen className="h-3 w-3" /> {lesson.title}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <span />
            )}
            <Button variant="primary" onClick={next}>
              {index + 1 >= queue.length ? 'See results' : 'Next'} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function FlashResults({ results, onAgain }: { results: { item: FlashFire; correct: boolean }[]; onAgain: () => void }) {
  const correct = results.filter((r) => r.correct).length;
  const missed = results.filter((r) => !r.correct);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Score" value={`${correct}/${results.length}`} tone="brand" />
        <StatTile
          label="Accuracy"
          value={`${results.length ? Math.round((correct / results.length) * 100) : 0}%`}
          tone={correct / results.length >= 0.7 ? 'success' : 'warning'}
        />
        <StatTile label="To revisit" value={missed.length} tone={missed.length ? 'warning' : 'success'} />
      </div>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">Cards to revisit</h2>
        {missed.length === 0 ? (
          <p className="text-sm text-ink-muted">Perfect round — nothing to revisit.</p>
        ) : (
          <ul className="space-y-2">
            {missed.map((r) => {
              const lesson = r.item.relatedLessonIds.map((id) => lessonById[id]).find(Boolean);
              return (
                <li key={r.item.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2 text-sm">
                  <span className="text-ink">{r.item.prompt}</span>
                  {lesson && (
                    <Link to={`/learn/${lesson.domainId}#${lesson.id}`} className="text-xs text-brand hover:underline">
                      Study {lesson.title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Button variant="primary" onClick={onAgain}>
        <RotateCcw className="h-4 w-4" /> New round
      </Button>
    </div>
  );
}
