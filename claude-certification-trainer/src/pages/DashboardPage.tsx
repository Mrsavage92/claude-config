import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  RotateCcw,
  GraduationCap,
  BookOpen,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import { useStore } from '@/hooks/store';
import { useActiveCertification, useCertAttempts, useReadiness } from '@/hooks/useDerived';
import {
  accuracyByDomain,
  accuracyOf,
  averageResponseTimeMs,
  latestAttemptPerQuestion,
} from '@/services/analytics';
import { bucketReviews } from '@/services/review';
import { readinessLabel } from '@/services/readiness';
import { getLessons, getLabs, domainById } from '@/data';
import { Card, PageHeader, StatTile, Badge, ProgressBar } from '@/components/ui';
import { formatDuration, formatPercent, formatRelativeTime } from '@/utils/format';

export function DashboardPage() {
  const { cert, domains } = useActiveCertification();
  const { state } = useStore();
  const attempts = useCertAttempts();
  const readiness = useReadiness();

  const latest = useMemo(() => latestAttemptPerQuestion(attempts), [attempts]);
  const overall = accuracyOf(latest);
  const avgTime = averageResponseTimeMs(attempts);
  const byDomain = useMemo(() => accuracyByDomain(attempts), [attempts]);
  const reviewBuckets = useMemo(
    () => bucketReviews(Object.values(state.reviewItems).filter((r) => r.certificationId === cert.id), Date.now()),
    [state.reviewItems, cert.id],
  );

  const lessons = getLessons(cert.id);
  const labs = getLabs(cert.id);
  const lessonsDone = lessons.filter((l) => state.lessonProgress[l.id]?.completed).length;
  const labsDone = labs.filter((l) => state.labProgress[l.id]?.completed).length;

  const domainAccuracy = domains
    .map((d) => ({ domain: d, stat: byDomain[d.id] }))
    .filter((x) => x.stat && x.stat.total > 0);
  const strongest = [...domainAccuracy].sort((a, b) => b.stat.accuracy - a.stat.accuracy)[0];
  const weakest = [...domainAccuracy].sort((a, b) => a.stat.accuracy - b.stat.accuracy)[0];

  const latestMock = useMemo(
    () => [...state.mockResults].filter((m) => m.certificationId === cert.id).sort((a, b) => b.finishedAt - a.finishedAt)[0],
    [state.mockResults, cert.id],
  );

  const recent = useMemo(() => [...attempts].sort((a, b) => b.at - a.at).slice(0, 6), [attempts]);
  const { label: readyLabel, tone: readyTone } = readinessLabel(readiness.score);

  // Recommended next action.
  const recommendation = useMemo(() => {
    if (reviewBuckets.dueNow.length > 0)
      return { text: `You have ${reviewBuckets.dueNow.length} reviews due`, to: '/review', cta: 'Start review' };
    if (attempts.length === 0) return { text: 'Warm up with the fundamentals', to: '/learn', cta: 'Start learning' };
    if (weakest && weakest.stat.accuracy < 0.7)
      return { text: `Your weakest area is ${weakest.domain.title}`, to: `/practice?domain=${weakest.domain.id}`, cta: 'Practise it' };
    if (!latestMock) return { text: 'Test yourself with a full mock exam', to: '/mock-exam', cta: 'Take mock exam' };
    return { text: 'Keep your streak going with a Rapid Fire round', to: '/rapid-fire', cta: 'Rapid Fire' };
  }, [reviewBuckets.dueNow.length, attempts.length, weakest, latestMock]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`${cert.name} · Blueprint ${cert.blueprintVersion}, effective ${cert.effectiveDate}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Readiness */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink">Practice readiness</h2>
              <p className="text-xs text-ink-muted">Practice readiness estimate, not an official exam score.</p>
            </div>
            <Link to="/progress" className="text-xs text-brand hover:underline">
              How is this calculated?
            </Link>
          </div>
          <div className="mt-4 flex items-center gap-5">
            <div className="text-5xl font-semibold tabular-nums text-ink">{readiness.hasData ? readiness.score : '—'}</div>
            <div className="flex-1">
              <Badge tone={readyTone}>{readiness.hasData ? readyLabel : 'No data yet'}</Badge>
              <ProgressBar className="mt-2" value={readiness.hasData ? readiness.score / 100 : 0} tone={readyTone} label="Readiness" />
              <p className="mt-2 text-xs text-ink-muted">
                Blends accuracy, domain coverage, mock performance, calibration, recency, and review backlog.
              </p>
            </div>
          </div>
        </Card>

        {/* Recommended next action */}
        <Card className="flex flex-col justify-between border-brand/30 bg-brand/5 p-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-brand">
              <Info className="h-4 w-4" /> Recommended next
            </div>
            <p className="mt-2 text-sm text-ink">{recommendation.text}.</p>
          </div>
          <Link
            to={recommendation.to}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong"
          >
            {recommendation.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Attempted" value={latest.length} hint={`${attempts.length} total`} />
        <StatTile label="Accuracy" value={latest.length ? formatPercent(overall.accuracy) : '—'} tone={overall.accuracy >= 0.7 ? 'success' : 'warning'} />
        <StatTile label="Avg time" value={avgTime ? formatDuration(avgTime) : '—'} hint="per question" />
        <StatTile label="Due to review" value={reviewBuckets.dueNow.length} tone={reviewBuckets.dueNow.length ? 'brand' : 'neutral'} />
        <StatTile label="Lessons" value={`${lessonsDone}/${lessons.length}`} />
        <StatTile label="Labs" value={`${labsDone}/${labs.length}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Domain strengths */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">Strengths & gaps</h2>
          {domainAccuracy.length === 0 ? (
            <p className="text-sm text-ink-muted">Answer some questions to see your strongest and weakest domains.</p>
          ) : (
            <div className="space-y-3">
              {strongest && (
                <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-ink">
                    <TrendingUp className="h-4 w-4 text-success" /> Strongest: {strongest.domain.title}
                  </span>
                  <span className="tabular-nums text-success">{formatPercent(strongest.stat.accuracy)}</span>
                </div>
              )}
              {weakest && weakest.domain.id !== strongest?.domain.id && (
                <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-ink">
                    <TrendingDown className="h-4 w-4 text-warning" /> Weakest: {weakest.domain.title}
                  </span>
                  <Link to={`/practice?domain=${weakest.domain.id}`} className="text-xs text-brand hover:underline">
                    Practise →
                  </Link>
                </div>
              )}
              <Link to="/progress" className="inline-block text-xs text-brand hover:underline">
                See full analytics →
              </Link>
            </div>
          )}
        </Card>

        {/* Recent activity */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">Recent activity</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-ink-muted">No activity yet — your answered questions will appear here.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={a.correct ? 'text-success' : 'text-danger'}>{a.correct ? '✓' : '✗'}</span>
                    <span className="truncate text-ink-muted">{domainById[a.domainId]?.title ?? a.domainId}</span>
                    <Badge tone="neutral">{a.sessionType}</Badge>
                  </span>
                  <span className="whitespace-nowrap text-xs text-ink-subtle">{formatRelativeTime(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Latest mock */}
      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Latest mock exam</h2>
            {latestMock ? (
              <p className="mt-1 text-sm text-ink-muted">
                <strong className="text-ink">{formatPercent(latestMock.accuracy)}</strong> · {latestMock.correctCount}/
                {latestMock.totalQuestions} correct · {formatRelativeTime(latestMock.finishedAt)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink-muted">You haven't taken a mock exam yet.</p>
            )}
          </div>
          <div className="flex gap-2">
            {latestMock && (
              <Link to="/mock-exam/results" className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-raised px-4 py-2 text-sm font-medium hover:bg-surface-sunken">
                View results
              </Link>
            )}
            <Link to="/mock-exam" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong">
              <GraduationCap className="h-4 w-4" /> {latestMock ? 'Retake' : 'Take mock exam'}
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickLink to="/learn" icon={<BookOpen className="h-5 w-5" />} label="Learn" />
        <QuickLink to="/practice" icon={<Dumbbell className="h-5 w-5" />} label="Practice" />
        <QuickLink to="/rapid-fire" icon={<RotateCcw className="h-5 w-5" />} label="Rapid Fire" />
        <QuickLink to="/review" icon={<RotateCcw className="h-5 w-5" />} label="Review" />
      </div>
    </div>
  );
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface-raised p-4 text-sm font-medium text-ink transition-colors hover:border-brand/40 hover:text-brand"
    >
      <span className="text-ink-muted">{icon}</span>
      {label}
    </Link>
  );
}
