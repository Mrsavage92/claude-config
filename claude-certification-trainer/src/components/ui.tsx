import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

/* Button ------------------------------------------------------------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  variant = 'secondary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const variants: Record<Variant, string> = {
    primary: 'bg-brand text-white hover:bg-brand-strong',
    secondary: 'border border-line bg-surface-raised text-ink hover:bg-surface-sunken',
    ghost: 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
    danger: 'border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

/* Card --------------------------------------------------------------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-xl border border-line bg-surface-raised', className)}>{children}</div>;
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* Badge / tones ------------------------------------------------------ */

export type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const toneClasses: Record<Tone, string> = {
  brand: 'bg-brand/10 text-brand ring-brand/20',
  success: 'bg-success/10 text-success ring-success/20',
  warning: 'bg-warning/10 text-warning ring-warning/20',
  danger: 'bg-danger/10 text-danger ring-danger/20',
  info: 'bg-info/10 text-info ring-info/20',
  neutral: 'bg-surface-sunken text-ink-muted ring-line',
};

export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* Progress bar ------------------------------------------------------- */

export function ProgressBar({
  value,
  tone = 'brand',
  className,
  label,
}: {
  value: number; // 0..1
  tone?: Tone;
  className?: string;
  label?: string;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const barTone: Record<Tone, string> = {
    brand: 'bg-brand',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    neutral: 'bg-ink-subtle',
  };
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-sunken', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500', barTone[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* Stat tile ---------------------------------------------------------- */

export function StatTile({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
}) {
  const accent: Record<Tone, string> = {
    brand: 'text-brand',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
    neutral: 'text-ink',
  };
  return (
    <div className="rounded-xl border border-line bg-surface-raised p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{label}</div>
      <div className={cn('mt-1 text-2xl font-semibold tabular-nums', accent[tone])}>{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-muted">{hint}</div>}
    </div>
  );
}

/* Empty state -------------------------------------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-raised px-6 py-12 text-center">
      {icon && <div className="mb-3 text-ink-subtle">{icon}</div>}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* Segmented control -------------------------------------------------- */

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { label: ReactNode; value: T }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-line bg-surface-sunken p-1" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={o.value === value}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            o.value === value ? 'bg-surface-raised text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* Toggle switch ------------------------------------------------------ */

export function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        checked ? 'bg-brand' : 'bg-ink-subtle/40',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

/* Section heading ---------------------------------------------------- */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
