/** Formatting helpers for durations, dates, and percentages. */

export function formatPercent(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatRelativeTime(epochMs: number, now = Date.now()): string {
  const diff = now - epochMs;
  const abs = Math.abs(diff);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (abs < minute) return diff >= 0 ? 'just now' : 'soon';
  if (abs < hour) {
    const n = Math.round(abs / minute);
    return diff >= 0 ? `${n}m ago` : `in ${n}m`;
  }
  if (abs < day) {
    const n = Math.round(abs / hour);
    return diff >= 0 ? `${n}h ago` : `in ${n}h`;
  }
  const n = Math.round(abs / day);
  return diff >= 0 ? `${n}d ago` : `in ${n}d`;
}

export function formatDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Simple non-crypto id generator for local records. */
export function makeId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
