# Spaced Review System

Implemented in `src/services/review.ts`. A simple, explainable spaced-repetition system —
not a full SM-2/FSRS implementation — designed so every scheduling decision can be
explained in one sentence.

## When an item enters review

`reviewReasonForAttempt(question, attempt)` inspects a just-recorded `Attempt` and
returns a `ReviewReason | null`:

```ts
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
```

Logic, in order:

1. **Incorrect + confident** (`certain` or `fairly-sure`) → `high-confidence-incorrect`
   — a genuine misconception (the learner believed a wrong answer was right).
2. **Incorrect + not confident** → `incorrect` (any other confidence value, including
   `null`).
3. **Correct + low confidence** (`unsure` or `guess`) → `low-confidence-correct` — got it
   right but doesn't reliably know why.
4. **Correct + confident but slow** — response time more than **2.5×** the question's
   `estimatedTimeSeconds` → `too-slow`.
5. Otherwise → `null` (no review needed; a confident, timely, correct answer).

A fifth reason, `manual`, exists only for reviews the learner explicitly adds themselves
(`addManualReview` in the store), not for anything `reviewReasonForAttempt` returns.

### Reason priorities

```ts
const REASON_PRIORITY: Record<ReviewReason, number> = {
  'high-confidence-incorrect': 100,
  incorrect: 70,
  'too-slow': 40,
  'low-confidence-correct': 30,
  manual: 20,
};
```

| Reason | Priority | Meaning |
| --- | --- | --- |
| `high-confidence-incorrect` | 100 (highest) | wrong, and thought they were right — misconception |
| `incorrect` | 70 | wrong, and knew (or weren't sure) they might be |
| `too-slow` | 40 | right, but took much longer than expected |
| `low-confidence-correct` | 30 | right, but only guessed/unsure |
| `manual` | 20 (lowest) | learner opted in manually |

Higher priority = more urgent; used both to escalate an existing review item's reason and
to sort review queues (see Buckets, below).

## Scheduling a review from an attempt

`scheduleFromAttempt(existing, question, attempt, now)` upserts a `ReviewItem`:

- No existing item, no reason → returns `null` (nothing scheduled).
- No existing item, a reason → `createReviewItem(question, reason, now)`: a fresh item
  due immediately (`dueAt: now`, `intervalDays: 0`, `reps: 0`, `lapses: 0`,
  `priority: REASON_PRIORITY[reason]`).
- Existing item, no new reason → the existing item is left untouched (a confident,
  timely correct answer doesn't cancel a pending review).
- Existing item **and** a new reason → **escalate**: the reason/priority is only
  replaced if the new reason's priority is strictly higher
  (`worse = REASON_PRIORITY[newReason] > REASON_PRIORITY[existing.reason]`), but
  `priority` itself is always set to `max(existing.priority, REASON_PRIORITY[newReason])`.
  An **incorrect** answer always resets scheduling to due-now (`intervalDays: 0,
  dueAt: now`) and increments `lapses`; a correct answer (even if it triggers
  `too-slow`/`low-confidence-correct`) leaves the existing `intervalDays`/`dueAt`/`lapses`
  as-is.

This is wired into the store: `record-attempt` in `src/hooks/store.tsx` calls
`scheduleFromAttempt` on every recorded attempt and upserts `state.reviewItems`.

## Grading a review (`applyGrade`)

When the learner reviews a due item and grades it (Again / Hard / Good / Easy),
`applyGrade(item, grade, now)` computes the next interval.

### Base intervals

```ts
export const BASE_INTERVAL_DAYS: Record<ReviewGrade, number> = {
  again: 0.2,
  hard: 1,
  good: 3,
  easy: 7,
};
```

| Grade | Base interval |
| --- | --- |
| `again` | 0.2 days (~4.8 hours — "later today") |
| `hard` | 1 day |
| `good` | 3 days |
| `easy` | 7 days |

### Lapse handling (`again`)

Grading `again` is a lapse, not a graded rep:

```ts
intervalDays: BASE_INTERVAL_DAYS.again  // 0.2
dueAt: now + 0.2 * DAY
reps: 0            // reset to zero
lapses: item.lapses + 1
lastGrade: 'again'
```

### Growth multipliers (`hard` / `good` / `easy`)

```ts
const GRADE_MULTIPLIER: Record<ReviewGrade, number> = {
  again: 0,
  hard: 1.2,
  good: 2.2,
  easy: 3.2,
};
```

| Grade | Multiplier |
| --- | --- |
| `hard` | 1.2× |
| `good` | 2.2× |
| `easy` | 3.2× |

For any non-`again` grade:

```ts
const base = BASE_INTERVAL_DAYS[grade];
const nextInterval = item.reps === 0
  ? base
  : Math.max(base, item.intervalDays * GRADE_MULTIPLIER[grade]);
const capped = Math.min(nextInterval, 180); // 180-day cap
```

- **First successful rep** (`reps === 0`, i.e. right after creation or after a lapse
  reset it to 0): the interval jumps straight to the grade's base interval.
  - Note: because a lapse also resets `reps` to `0`, the rep immediately following an
    `again` grade is treated the same as a brand-new item's first rep — it uses the
    grade's base interval rather than multiplying the tiny post-lapse `intervalDays`.
- **Subsequent reps** (`reps > 0`): the new interval is the larger of the grade's base
  interval and `previous intervalDays × grade multiplier` — so a `good` review always
  at least triples (2.2×) the previous interval, never regresses it.
- The result is capped at **180 days** regardless of grade or rep count.
- `reps` increments by 1, `lastGrade` is set to the grade given, `updatedAt: now`.

## Buckets (`bucketReviews`)

`bucketReviews(items, now)` sorts all items by `priority desc, dueAt asc` and splits them
for the Review dashboard:

```ts
export interface ReviewBuckets {
  dueNow: ReviewItem[];
  dueToday: ReviewItem[];
  overdue: ReviewItem[];
  upcoming: ReviewItem[];
  misconceptions: ReviewItem[];
}
```

| Bucket | Condition |
| --- | --- |
| `dueNow` | `dueAt <= now` |
| `overdue` | subset of `dueNow` where `dueAt` is before the start of today (midnight local time) |
| `dueToday` | `dueAt > now` and `dueAt` falls before the end of today |
| `upcoming` | `dueAt` at or after the end of today |
| `misconceptions` | any item with `reason === 'high-confidence-incorrect'`, regardless of due date |

("Start of day" / "end of day" are computed by zeroing the time on a `Date` built from
`now`, then adding 24h for the end boundary.)

A related helper, `getDueReviews(items, now)`, returns just the due items
(`dueAt <= now`) sorted the same way (`priority desc, dueAt asc`) — used where only a
flat due-queue is needed rather than the full bucket breakdown.

## Suggested schedule at a glance

| Event | Resulting due date |
| --- | --- |
| Item first enters review (any reason) | immediately (`dueAt = now`) |
| Grade `again` | ~4.8 hours later (0.2 d), `reps` reset to 0, lapse recorded |
| Grade `hard` (first rep) | 1 day later |
| Grade `hard` (later rep) | `max(1, previous interval × 1.2)` days later |
| Grade `good` (first rep) | 3 days later |
| Grade `good` (later rep) | `max(3, previous interval × 2.2)` days later |
| Grade `easy` (first rep) | 7 days later |
| Grade `easy` (later rep) | `max(7, previous interval × 3.2)` days later |
| Any computed interval | capped at 180 days |
