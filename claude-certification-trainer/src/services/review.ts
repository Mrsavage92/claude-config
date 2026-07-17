import type { Attempt, Question, ReviewGrade, ReviewItem } from '@/schemas';

/**
 * A simple, explainable spaced-review system.
 *
 * Items enter review when answered incorrectly, answered correctly with low
 * confidence, answered too slowly, marked manually, or (highest priority)
 * answered incorrectly with high confidence — a misconception.
 *
 * Grades map to base intervals:
 *   again → later today (0.2 d) · hard → 1 d · good → 3 d · easy → 7 d
 * Repeated correct grades multiply the interval; a lapse (again) resets it.
 *
 * Full algorithm: docs/review-system.md.
 */

const DAY = 24 * 60 * 60 * 1000;

export const BASE_INTERVAL_DAYS: Record<ReviewGrade, number> = {
  again: 0.2,
  hard: 1,
  good: 3,
  easy: 7,
};

const GRADE_MULTIPLIER: Record<ReviewGrade, number> = {
  again: 0,
  hard: 1.2,
  good: 2.2,
  easy: 3.2,
};

export type ReviewReason = ReviewItem['reason'];

const REASON_PRIORITY: Record<ReviewReason, number> = {
  'high-confidence-incorrect': 100,
  incorrect: 70,
  'too-slow': 40,
  'low-confidence-correct': 30,
  manual: 20,
};

/** Decide whether an attempt should schedule a review, and why. */
export function reviewReasonForAttempt(question: Question, attempt: Attempt): ReviewReason | null {
  if (!attempt.correct) {
    if (attempt.confidence === 'certain' || attempt.confidence === 'fairly-sure') {
      return 'high-confidence-incorrect';
    }
    return 'incorrect';
  }
  // Correct answers:
  if (attempt.confidence === 'unsure' || attempt.confidence === 'guess') {
    return 'low-confidence-correct';
  }
  // Correct but far slower than the estimate → worth reinforcing.
  if (attempt.responseTimeMs > question.estimatedTimeSeconds * 1000 * 2.5) {
    return 'too-slow';
  }
  return null;
}

/** Create a fresh review item (initial scheduling: due soon). */
export function createReviewItem(
  question: Question,
  reason: ReviewReason,
  now: number,
): ReviewItem {
  return {
    questionId: question.id,
    certificationId: question.certificationId,
    domainId: question.domainId,
    reason,
    intervalDays: 0,
    dueAt: now,
    reps: 0,
    lapses: 0,
    lastGrade: null,
    priority: REASON_PRIORITY[reason],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Upsert a review item for a new attempt. Returns the updated item, or null if
 * no review is warranted and none exists yet.
 */
export function scheduleFromAttempt(
  existing: ReviewItem | undefined,
  question: Question,
  attempt: Attempt,
  now: number,
): ReviewItem | null {
  const reason = reviewReasonForAttempt(question, attempt);
  if (!existing && !reason) return null;
  if (!existing && reason) return createReviewItem(question, reason, now);
  if (existing && !reason) return existing; // leave scheduled item as-is
  // Both exist: escalate reason priority if this attempt is worse.
  const newReason = reason as ReviewReason;
  const worse = REASON_PRIORITY[newReason] > REASON_PRIORITY[existing!.reason];
  const updated: ReviewItem = {
    ...existing!,
    reason: worse ? newReason : existing!.reason,
    priority: Math.max(existing!.priority, REASON_PRIORITY[newReason]),
    // An incorrect answer resets scheduling to due-now.
    intervalDays: attempt.correct ? existing!.intervalDays : 0,
    dueAt: attempt.correct ? existing!.dueAt : now,
    lapses: attempt.correct ? existing!.lapses : existing!.lapses + 1,
    updatedAt: now,
  };
  return updated;
}

/** Apply a review grade, computing the next interval and due date. */
export function applyGrade(item: ReviewItem, grade: ReviewGrade, now: number): ReviewItem {
  if (grade === 'again') {
    return {
      ...item,
      intervalDays: BASE_INTERVAL_DAYS.again,
      dueAt: now + BASE_INTERVAL_DAYS.again * DAY,
      reps: 0,
      lapses: item.lapses + 1,
      lastGrade: 'again',
      updatedAt: now,
    };
  }
  const base = BASE_INTERVAL_DAYS[grade];
  const nextInterval =
    item.reps === 0 ? base : Math.max(base, item.intervalDays * GRADE_MULTIPLIER[grade]);
  const capped = Math.min(nextInterval, 180); // cap at 180 days
  return {
    ...item,
    intervalDays: capped,
    dueAt: now + capped * DAY,
    reps: item.reps + 1,
    lastGrade: grade,
    updatedAt: now,
  };
}

export interface ReviewBuckets {
  dueNow: ReviewItem[];
  dueToday: ReviewItem[];
  overdue: ReviewItem[];
  upcoming: ReviewItem[];
  misconceptions: ReviewItem[];
}

/** Bucket review items relative to `now` for the review dashboard. */
export function bucketReviews(items: ReviewItem[], now: number): ReviewBuckets {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = startOfDay.getTime() + DAY;

  const sorted = [...items].sort((a, b) => b.priority - a.priority || a.dueAt - b.dueAt);
  const dueNow = sorted.filter((i) => i.dueAt <= now);
  const overdue = dueNow.filter((i) => i.dueAt < startOfDay.getTime());
  const dueToday = sorted.filter((i) => i.dueAt > now && i.dueAt < endOfDay);
  const upcoming = sorted.filter((i) => i.dueAt >= endOfDay);
  const misconceptions = sorted.filter((i) => i.reason === 'high-confidence-incorrect');
  return { dueNow, dueToday, overdue, upcoming, misconceptions };
}

/** Items that are due for review right now, most urgent first. */
export function getDueReviews(items: ReviewItem[], now: number): ReviewItem[] {
  return items
    .filter((i) => i.dueAt <= now)
    .sort((a, b) => b.priority - a.priority || a.dueAt - b.dueAt);
}

export { REASON_PRIORITY };
