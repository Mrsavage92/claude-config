import type { AnswerConfidence, Attempt } from '@/schemas';

/** Aggregate accuracy statistics over a set of attempts. */
export interface AccuracyStat {
  total: number;
  correct: number;
  accuracy: number; // 0..1, NaN-safe → 0 when total is 0
}

export function accuracyOf(attempts: Attempt[]): AccuracyStat {
  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  return { total, correct, accuracy: total === 0 ? 0 : correct / total };
}

/** Group attempts by a key and compute accuracy per group. */
export function accuracyByKey<K extends string>(
  attempts: Attempt[],
  keyOf: (a: Attempt) => K,
): Record<K, AccuracyStat> {
  const groups = {} as Record<K, Attempt[]>;
  for (const a of attempts) {
    const k = keyOf(a);
    (groups[k] ??= []).push(a);
  }
  const out = {} as Record<K, AccuracyStat>;
  (Object.keys(groups) as K[]).forEach((k) => (out[k] = accuracyOf(groups[k])));
  return out;
}

export function accuracyByDomain(attempts: Attempt[]): Record<string, AccuracyStat> {
  return accuracyByKey(attempts, (a) => a.domainId);
}

/** Only the most recent attempt per question (for a "current mastery" view). */
export function latestAttemptPerQuestion(attempts: Attempt[]): Attempt[] {
  const byQuestion = new Map<string, Attempt>();
  for (const a of attempts) {
    const prev = byQuestion.get(a.questionId);
    if (!prev || a.at > prev.at) byQuestion.set(a.questionId, a);
  }
  return [...byQuestion.values()];
}

export function averageResponseTimeMs(attempts: Attempt[]): number {
  const timed = attempts.filter((a) => a.responseTimeMs > 0 && !a.timedOut);
  if (timed.length === 0) return 0;
  return timed.reduce((sum, a) => sum + a.responseTimeMs, 0) / timed.length;
}

/**
 * Confidence calibration: for each confidence level, how often the learner was
 * actually correct. A well-calibrated learner is right ~most of the time when
 * "certain" and less often when "guess".
 */
export interface CalibrationRow {
  confidence: AnswerConfidence;
  total: number;
  correct: number;
  accuracy: number;
}

const CONFIDENCE_ORDER: AnswerConfidence[] = ['certain', 'fairly-sure', 'unsure', 'guess'];

export function confidenceCalibration(attempts: Attempt[]): CalibrationRow[] {
  return CONFIDENCE_ORDER.map((confidence) => {
    const rows = attempts.filter((a) => a.confidence === confidence);
    const correct = rows.filter((a) => a.correct).length;
    return {
      confidence,
      total: rows.length,
      correct,
      accuracy: rows.length === 0 ? 0 : correct / rows.length,
    };
  });
}

/**
 * A single calibration score in [0,1]: rewards being right when confident and
 * appropriately uncertain when wrong. Computed as 1 − mean overconfidence gap.
 */
export function calibrationScore(attempts: Attempt[]): number {
  const withConfidence = attempts.filter((a) => a.confidence != null);
  if (withConfidence.length === 0) return 0.5; // neutral prior
  const expected: Record<AnswerConfidence, number> = {
    certain: 0.95,
    'fairly-sure': 0.75,
    unsure: 0.5,
    guess: 0.3,
  };
  let gapSum = 0;
  for (const a of withConfidence) {
    const e = expected[a.confidence as AnswerConfidence];
    const actual = a.correct ? 1 : 0;
    gapSum += Math.abs(e - actual);
  }
  const meanGap = gapSum / withConfidence.length;
  return Math.max(0, 1 - meanGap);
}

/** Daily accuracy series (for the accuracy-over-time chart). */
export interface DailyPoint {
  day: string; // YYYY-MM-DD
  total: number;
  correct: number;
  accuracy: number;
}

export function accuracyOverTime(attempts: Attempt[]): DailyPoint[] {
  const byDay = new Map<string, { total: number; correct: number }>();
  for (const a of attempts) {
    const day = new Date(a.at).toISOString().slice(0, 10);
    const rec = byDay.get(day) ?? { total: 0, correct: 0 };
    rec.total += 1;
    if (a.correct) rec.correct += 1;
    byDay.set(day, rec);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, r]) => ({ day, total: r.total, correct: r.correct, accuracy: r.correct / r.total }));
}
