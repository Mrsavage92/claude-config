import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RotateCcw, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { useStore } from '@/hooks/store';
import { domainById, questionById } from '@/data';
import { Button, Card, EmptyState, PageHeader, StatTile, Badge } from '@/components/ui';
import { AccuracyBars, Donut } from '@/components/charts';
import { formatDuration, formatDate } from '@/utils/format';
import { MOCK_PASS_ANCHOR } from '@/services/readiness';

export function MockExamResultsPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const result = useMemo(
    () => [...state.mockResults].sort((a, b) => b.finishedAt - a.finishedAt)[0],
    [state.mockResults],
  );

  const outcomes = useMemo(() => {
    if (!result) return [];
    return result.attemptIds
      .map((id) => state.attempts.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => Boolean(a));
  }, [result, state.attempts]);

  if (!result) {
    return (
      <EmptyState
        title="No mock exam results yet"
        description="Take a mock exam to see your results here."
        action={
          <Button variant="primary" onClick={() => navigate('/mock-exam')}>
            Go to mock exam
          </Button>
        }
      />
    );
  }

  const domainBars = Object.entries(result.domainBreakdown).map(([id, b]) => ({
    label: domainById[id]?.title ?? id,
    value: b.total ? b.correct / b.total : 0,
    count: b.total,
  }));

  const weakest = [...domainBars].sort((a, b) => a.value - b.value).slice(0, 2).filter((d) => d.value < 0.7);
  const incorrect = outcomes.filter((a) => !a.correct);

  return (
    <div>
      <PageHeader
        title="Mock Exam Results"
        description={`Completed ${formatDate(result.finishedAt)} · Practice mock based on the available verified question bank.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/mock-exam')}>
              <RotateCcw className="h-4 w-4" /> Retake
            </Button>
            <Link to="/review" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong">
              Review mistakes <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        }
      />

      <Card className="mb-6 p-5">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <Donut value={result.accuracy} label="Raw accuracy" tone={result.accuracy >= MOCK_PASS_ANCHOR ? 'success' : 'warning'} />
          <div className="text-sm text-ink-muted">
            <p>
              You scored <strong className="text-ink">{result.correctCount}</strong> of{' '}
              <strong className="text-ink">{result.totalQuestions}</strong>.
            </p>
            <p className="mt-1">
              {result.accuracy >= MOCK_PASS_ANCHOR ? (
                <Badge tone="success">Above the {Math.round(MOCK_PASS_ANCHOR * 100)}% practice anchor</Badge>
              ) : (
                <Badge tone="warning">Below the {Math.round(MOCK_PASS_ANCHOR * 100)}% practice anchor</Badge>
              )}
            </p>
            <p className="mt-2 text-xs text-ink-subtle">
              Raw accuracy is not the official scaled score. This trainer does not reproduce Anthropic's scoring formula.
            </p>
          </div>
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Correct" value={result.correctCount} tone="success" />
        <StatTile label="Incorrect" value={result.totalQuestions - result.correctCount} tone="danger" />
        <StatTile label="Time used" value={formatDuration(result.timeUsedMs)} hint={`of ${result.timeLimitMinutes} min`} />
        <StatTile label="Accuracy" value={`${Math.round(result.accuracy * 100)}%`} tone="brand" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">Domain breakdown</h2>
          <AccuracyBars data={domainBars} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">Recommended next study actions</h2>
          {weakest.length === 0 ? (
            <p className="text-sm text-ink-muted">Strong across all domains — keep practising to stay sharp.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {weakest.map((d) => {
                const dom = Object.values(domainById).find((x) => x.title === d.label);
                return (
                  <li key={d.label} className="flex items-center justify-between gap-2">
                    <span className="text-ink">
                      Revisit <strong>{d.label}</strong> ({Math.round(d.value * 100)}%)
                    </span>
                    {dom && (
                      <Link to={`/learn/${dom.id}`} className="whitespace-nowrap text-xs text-brand hover:underline">
                        Study →
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 text-xs text-ink-muted">
            {incorrect.length} missed question{incorrect.length === 1 ? '' : 's'} {incorrect.length ? 'were added to your review queue.' : ''}
          </p>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">Question outcomes</h2>
        <ul className="space-y-1.5">
          {outcomes.map((a, i) => {
            const q = questionById[a.questionId];
            return (
              <li key={a.id} className="flex items-start gap-2 text-sm">
                {a.correct ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" aria-hidden="true" />
                )}
                <span className="text-ink-muted">
                  <span className="tabular-nums text-ink-subtle">Q{i + 1}.</span> {q?.prompt ?? a.questionId}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
