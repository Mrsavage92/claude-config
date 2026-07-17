import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { PageHeader, Card, CardHeader, StatTile, EmptyState, Badge } from '@/components/ui';
import { AccuracyBars, LineChart } from '@/components/charts';
import { useStore } from '@/hooks/store';
import { useCertAttempts, useReadiness } from '@/hooks/useDerived';
import {
  accuracyOf,
  accuracyByDomain,
  accuracyOverTime,
  confidenceCalibration,
  averageResponseTimeMs,
  latestAttemptPerQuestion,
} from '@/services/analytics';
import { readinessLabel, type ReadinessBreakdown } from '@/services/readiness';
import { domainById } from '@/data';
import { formatDuration, formatPercent, formatDate } from '@/utils/format';

const COMPONENT_LABELS: Record<keyof ReadinessBreakdown['components'], string> = {
  accuracy: 'Accuracy',
  domainCoverage: 'Domain coverage',
  mockExam: 'Mock exam',
  calibration: 'Confidence calibration',
  recency: 'Recency',
  reviewBacklog: 'Review backlog',
};

const COMPONENT_EXPLANATIONS: Record<keyof ReadinessBreakdown['components'], string> = {
  accuracy: 'Accuracy on your latest attempt per question.',
  domainCoverage: 'Fraction of exam domains practised to a minimum depth.',
  mockExam: 'Best of your recent mock exams, scaled against a passing anchor.',
  calibration: 'How well your stated confidence matches whether you were actually right.',
  recency: 'Decays the longer it has been since you last practised.',
  reviewBacklog: 'Inverse of how many spaced-review items are currently overdue.',
};

export function ProgressPage() {
  const attempts = useCertAttempts();
  const { state } = useStore();
  const readiness = useReadiness();

  if (attempts.length === 0) {
    return (
      <div>
        <PageHeader title="Progress" description="Your readiness estimate and practice analytics." />
        <EmptyState
          icon={<BarChart3 className="h-8 w-8" aria-hidden="true" />}
          title="No practice data yet"
          description="Answer a few questions to start building your readiness estimate and accuracy analytics."
          action={
            <Link
              to="/practice"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Start practising
            </Link>
          }
        />
      </div>
    );
  }

  const latest = latestAttemptPerQuestion(attempts);
  const overall = accuracyOf(latest);
  const avgResponseMs = averageResponseTimeMs(attempts);

  const byDomain = accuracyByDomain(attempts);
  const domainBars = Object.entries(byDomain)
    .map(([domainId, stat]) => ({
      label: domainById[domainId]?.title ?? domainId,
      value: stat.accuracy,
      count: stat.total,
    }))
    .sort((a, b) => b.value - a.value);
  const strongest = domainBars[0];
  const weakest = domainBars[domainBars.length - 1];

  const timeSeries = accuracyOverTime(attempts);
  const linePoints = timeSeries.map((p) => ({ label: p.day, value: p.accuracy }));
  const timeSummary =
    timeSeries.length === 0
      ? 'No dated attempts yet.'
      : `Accuracy across ${timeSeries.length} practice day${timeSeries.length === 1 ? '' : 's'}, from ${formatPercent(
          timeSeries[0].accuracy,
        )} on ${timeSeries[0].day} to ${formatPercent(timeSeries[timeSeries.length - 1].accuracy)} on ${
          timeSeries[timeSeries.length - 1].day
        }.`;

  const calibration = confidenceCalibration(attempts);
  const calibrationWithData = calibration.filter((row) => row.total > 0);
  const isWellCalibrated =
    calibrationWithData.length === 0
      ? null
      : calibrationWithData.every((row, i) => i === 0 || row.accuracy <= calibrationWithData[i - 1].accuracy + 0.15);

  const { label: readinessTitle, tone: readinessTone } = readinessLabel(readiness.score);
  const componentKeys = Object.keys(readiness.components) as (keyof ReadinessBreakdown['components'])[];

  return (
    <div>
      <PageHeader title="Progress" description="Your readiness estimate and practice analytics." />

      <div className="space-y-6">
        {/* Readiness ----------------------------------------------------- */}
        <Card>
          <CardHeader
            title="Practice readiness"
            subtitle="Practice readiness estimate, not an official exam score."
            action={
              <div className="flex items-center gap-3">
                <Badge tone={readinessTone}>{readinessTitle}</Badge>
                <span className="text-2xl font-semibold tabular-nums text-ink">{readiness.score}</span>
              </div>
            }
          />
          <div className="space-y-4 px-5 py-5">
            <p className="text-sm text-ink-muted">
              Readiness blends six signals: accuracy, domain coverage, mock exam performance, confidence
              calibration, recency of practice, and outstanding spaced-review backlog. Each is weighted and
              combined into a single 0-100 score.
            </p>
            <AccuracyBars
              data={componentKeys.map((key) => ({
                label: `${COMPONENT_LABELS[key]} (weight ${Math.round(readiness.weights[key] * 100)}%)`,
                value: readiness.components[key],
              }))}
            />
            <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-ink-subtle sm:grid-cols-2">
              {componentKeys.map((key) => (
                <li key={key}>
                  <span className="font-medium text-ink-muted">{COMPONENT_LABELS[key]}:</span>{' '}
                  {COMPONENT_EXPLANATIONS[key]}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Stat tiles ------------------------------------------------------ */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Total attempts" value={attempts.length} />
          <StatTile label="Overall accuracy" value={formatPercent(overall.accuracy)} />
          <StatTile label="Avg response time" value={formatDuration(avgResponseMs)} />
          <StatTile label="Mock exams taken" value={state.mockResults.length} />
        </div>

        {/* Accuracy by domain ----------------------------------------------- */}
        <Card>
          <CardHeader title="Accuracy by domain" subtitle="Latest accuracy across all attempted domains." />
          <div className="space-y-3 px-5 py-5">
            <AccuracyBars data={domainBars} />
            {strongest && weakest && (
              <p className="text-sm text-ink-muted">
                Strongest domain: <span className="font-medium text-ink">{strongest.label}</span> (
                {formatPercent(strongest.value)}). Weakest domain:{' '}
                <span className="font-medium text-ink">{weakest.label}</span> ({formatPercent(weakest.value)}).
              </p>
            )}
          </div>
        </Card>

        {/* Accuracy over time ------------------------------------------------ */}
        <Card>
          <CardHeader title="Accuracy over time" subtitle="Daily accuracy across your practice history." />
          <div className="px-5 py-5">
            <LineChart points={linePoints} summary={timeSummary} />
          </div>
        </Card>

        {/* Confidence calibration --------------------------------------------- */}
        <Card>
          <CardHeader
            title="Confidence calibration"
            subtitle="How often you were right at each stated confidence level."
          />
          <div className="space-y-3 px-5 py-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-ink-subtle">
                    <th className="py-1.5 pr-4 font-medium">Confidence</th>
                    <th className="py-1.5 pr-4 font-medium">Attempts</th>
                    <th className="py-1.5 font-medium">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {calibration.map((row) => (
                    <tr key={row.confidence} className="border-t border-line">
                      <td className="py-1.5 pr-4 capitalize text-ink">{row.confidence.replace('-', ' ')}</td>
                      <td className="py-1.5 pr-4 tabular-nums text-ink-muted">{row.total}</td>
                      <td className="py-1.5 tabular-nums text-ink-muted">
                        {row.total === 0 ? '—' : formatPercent(row.accuracy)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-ink-muted">
              {isWellCalibrated === null
                ? 'Record confidence on your answers to see a calibration read-out.'
                : isWellCalibrated
                  ? 'Your accuracy rises with your stated confidence — calibration looks healthy.'
                  : 'Accuracy does not consistently rise with stated confidence — watch for overconfidence on some answers.'}
            </p>
          </div>
        </Card>

        {/* Mock exam history --------------------------------------------------- */}
        {state.mockResults.length > 0 && (
          <Card>
            <CardHeader title="Mock exam history" subtitle="Results from completed mock exams." />
            <ul className="divide-y divide-line px-5">
              {[...state.mockResults]
                .sort((a, b) => b.finishedAt - a.finishedAt)
                .map((result) => (
                  <li key={result.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="text-ink-muted">{formatDate(result.finishedAt)}</span>
                    <span className="tabular-nums text-ink">
                      {result.correctCount}/{result.totalQuestions} correct
                    </span>
                    <span className="tabular-nums font-medium text-ink">{formatPercent(result.accuracy)}</span>
                  </li>
                ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
