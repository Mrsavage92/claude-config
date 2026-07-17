import type { Attempt, Domain, MockExamResult, ReviewItem } from '@/schemas';
import {
  accuracyByDomain,
  accuracyOf,
  calibrationScore,
  latestAttemptPerQuestion,
} from './analytics';

/**
 * Practice readiness estimate — NOT an official exam score.
 *
 * Readiness is a weighted blend of six signals, each normalised to [0,1]:
 *   accuracy          0.30  recent-weighted accuracy on latest attempt/question
 *   domainCoverage    0.20  fraction of domains practised to a minimum depth
 *   mockExam          0.20  best-of-recent mock accuracy vs a 0.72 pass anchor
 *   calibration       0.10  confidence calibration score
 *   recency           0.10  decays if you have not practised recently
 *   reviewBacklog     0.10  inverse of outstanding due reviews
 *
 * Full documentation: docs/readiness-model.md.
 */

export interface ReadinessBreakdown {
  score: number; // 0..100
  components: {
    accuracy: number;
    domainCoverage: number;
    mockExam: number;
    calibration: number;
    recency: number;
    reviewBacklog: number;
  };
  weights: Record<keyof ReadinessBreakdown['components'], number>;
  hasData: boolean;
}

export const READINESS_WEIGHTS = {
  accuracy: 0.3,
  domainCoverage: 0.2,
  mockExam: 0.2,
  calibration: 0.1,
  recency: 0.1,
  reviewBacklog: 0.1,
} as const;

/** Minimum attempts in a domain before it counts as "covered". */
export const DOMAIN_COVERAGE_MIN = 3;
/** Mock accuracy that maps to a full mock component score (the pass anchor). */
export const MOCK_PASS_ANCHOR = 0.72;
const DAY = 24 * 60 * 60 * 1000;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function computeReadiness(params: {
  attempts: Attempt[];
  domains: Domain[];
  reviewItems: ReviewItem[];
  mockResults: MockExamResult[];
  now: number;
}): ReadinessBreakdown {
  const { attempts, domains, reviewItems, mockResults, now } = params;
  const hasData = attempts.length > 0 || mockResults.length > 0;

  // Accuracy: use the latest attempt per question so re-practising a weak item
  // updates the score rather than being diluted by old wrong attempts.
  const latest = latestAttemptPerQuestion(attempts);
  const accuracy = latest.length === 0 ? 0 : accuracyOf(latest).accuracy;

  // Domain coverage: fraction of domains with >= DOMAIN_COVERAGE_MIN attempts.
  const byDomain = accuracyByDomain(attempts);
  const coveredDomains = domains.filter(
    (d) => (byDomain[d.id]?.total ?? 0) >= DOMAIN_COVERAGE_MIN,
  ).length;
  const domainCoverage = domains.length === 0 ? 0 : coveredDomains / domains.length;

  // Mock: best accuracy among the three most recent mocks, scaled to the anchor.
  const recentMocks = [...mockResults].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 3);
  const bestMock = recentMocks.reduce((max, m) => Math.max(max, m.accuracy), 0);
  const mockExam = recentMocks.length === 0 ? 0 : clamp01(bestMock / MOCK_PASS_ANCHOR);

  // Calibration score in [0,1].
  const calibration = calibrationScore(attempts);

  // Recency: full credit within 3 days, decaying to 0 by 21 days idle.
  let recency = 0;
  if (attempts.length > 0) {
    const last = Math.max(...attempts.map((a) => a.at));
    const idleDays = (now - last) / DAY;
    if (idleDays <= 3) recency = 1;
    else recency = clamp01(1 - (idleDays - 3) / 18);
  }

  // Review backlog: 1 when no reviews are due; decays as due items accumulate.
  const dueCount = reviewItems.filter((r) => r.dueAt <= now).length;
  const reviewBacklog = clamp01(1 - dueCount / 20);

  const components = {
    accuracy,
    domainCoverage,
    mockExam,
    calibration,
    recency,
    reviewBacklog,
  };

  const raw = (Object.keys(components) as (keyof typeof components)[]).reduce(
    (sum, key) => sum + components[key] * READINESS_WEIGHTS[key],
    0,
  );

  return {
    // With no practice or mock data at all, readiness is undefined → report 0.
    score: hasData ? Math.round(clamp01(raw) * 100) : 0,
    components,
    weights: READINESS_WEIGHTS,
    hasData,
  };
}

export function readinessLabel(score: number): { label: string; tone: 'danger' | 'warning' | 'info' | 'success' } {
  if (score < 40) return { label: 'Building foundations', tone: 'danger' };
  if (score < 60) return { label: 'Developing', tone: 'warning' };
  if (score < 78) return { label: 'Approaching ready', tone: 'info' };
  return { label: 'Practice-ready', tone: 'success' };
}
