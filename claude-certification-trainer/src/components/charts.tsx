import { cn } from '@/utils/cn';
import { formatPercent } from '@/utils/format';

/**
 * Lightweight, accessible SVG charts. Every chart carries a visually-hidden or
 * visible text summary so the data is available without relying on colour.
 */

export interface BarDatum {
  label: string;
  value: number; // 0..1 for accuracy bars
  count?: number;
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
}

const TONE_FILL: Record<NonNullable<BarDatum['tone']>, string> = {
  brand: 'fill-brand',
  success: 'fill-success',
  warning: 'fill-warning',
  danger: 'fill-danger',
  info: 'fill-info',
};

/** Horizontal accuracy bars with inline value labels. */
export function AccuracyBars({ data, emptyLabel = 'No data yet' }: { data: BarDatum[]; emptyLabel?: string }) {
  if (data.length === 0) return <p className="text-sm text-ink-muted">{emptyLabel}</p>;
  return (
    <ul className="space-y-3">
      {data.map((d) => {
        const pct = Math.round(Math.max(0, Math.min(1, d.value)) * 100);
        const tone = d.tone ?? (d.value >= 0.75 ? 'success' : d.value >= 0.5 ? 'info' : 'warning');
        return (
          <li key={d.label}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="text-ink">{d.label}</span>
              <span className="tabular-nums text-ink-muted">
                {formatPercent(d.value)}
                {d.count != null && <span className="ml-1 text-ink-subtle">({d.count})</span>}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className={cn('h-full rounded-full', {
                  'bg-success': tone === 'success',
                  'bg-info': tone === 'info',
                  'bg-warning': tone === 'warning',
                  'bg-danger': tone === 'danger',
                  'bg-brand': tone === 'brand',
                })}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Simple line chart for accuracy over time, with a text summary. */
export function LineChart({
  points,
  summary,
  height = 140,
}: {
  points: { label: string; value: number }[];
  summary: string;
  height?: number;
}) {
  if (points.length === 0) return <p className="text-sm text-ink-muted">{summary}</p>;
  const width = 320;
  const pad = 8;
  const n = points.length;
  const x = (i: number) => (n === 1 ? width / 2 : pad + (i * (width - 2 * pad)) / (n - 1));
  const y = (v: number) => height - pad - v * (height - 2 * pad);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  return (
    <figure>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={summary} preserveAspectRatio="none">
        <line x1={pad} y1={y(0.5)} x2={width - pad} y2={y(0.5)} className="stroke-line" strokeDasharray="3 3" />
        <path d={path} className="fill-none stroke-brand" strokeWidth={2} />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r={2.5} className="fill-brand" />
        ))}
      </svg>
      <figcaption className="mt-1 text-xs text-ink-muted">{summary}</figcaption>
    </figure>
  );
}

/** Accessible donut for a single 0..1 ratio. */
export function Donut({ value, label, tone = 'brand' }: { value: number; label: string; tone?: BarDatum['tone'] }) {
  const pct = Math.max(0, Math.min(1, value));
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" role="img" aria-label={`${label}: ${formatPercent(value)}`}>
        <circle cx="40" cy="40" r={r} className="fill-none stroke-surface-sunken" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          className={cn('fill-none', TONE_FILL[tone ?? 'brand'].replace('fill-', 'stroke-'))}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(c * pct).toFixed(1)} ${c.toFixed(1)}`}
        />
      </svg>
      <div>
        <div className="text-xl font-semibold tabular-nums text-ink">{formatPercent(value)}</div>
        <div className="text-xs text-ink-muted">{label}</div>
      </div>
    </div>
  );
}
