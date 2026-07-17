# Readiness Model

> **Practice readiness estimate, not an official exam score.** The number described in
> this document is a local, heuristic blend of the learner's own practice history. It is
> not the certification's scaled score, does not use the exam's real psychometrics, and
> is not endorsed by, derived from, or validated against Anthropic's actual scoring
> model. Treat it as a study-planning signal only.

Implemented in `src/services/readiness.ts`. Consumed via `useReadiness()`
(`src/hooks/useDerived.ts`) and rendered in `AppShell`'s `ReadinessMini` sidebar widget
and the dashboard/progress pages.

## The formula

`computeReadiness({ attempts, domains, reviewItems, mockResults, now })` returns a
`ReadinessBreakdown`:

```ts
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
```

Each component is normalised to `[0, 1]`, then combined with fixed weights:

```ts
export const READINESS_WEIGHTS = {
  accuracy: 0.3,
  domainCoverage: 0.2,
  mockExam: 0.2,
  calibration: 0.1,
  recency: 0.1,
  reviewBacklog: 0.1,
} as const;
```

| Component | Weight |
| --- | --- |
| `accuracy` | 0.30 |
| `domainCoverage` | 0.20 |
| `mockExam` | 0.20 |
| `calibration` | 0.10 |
| `recency` | 0.10 |
| `reviewBacklog` | 0.10 |

`raw = Σ components[key] * READINESS_WEIGHTS[key]` (weights already sum to 1.0), then
`score = hasData ? round(clamp01(raw) * 100) : 0`, where
`hasData = attempts.length > 0 || mockResults.length > 0`.

**Zero-data rule:** with no attempts and no mock results at all, `hasData` is `false` and
`score` is forced to `0` regardless of what the raw components would otherwise compute
to (avoiding a misleadingly non-zero score, e.g. from `calibration`'s neutral 0.5 prior,
before the learner has done anything).

All intermediate math is clamped to `[0, 1]` via a local `clamp01(n)` helper before being
combined or reported.

## Component definitions

### `accuracy` (weight 0.30)

Uses **only the latest attempt per question** (`latestAttemptPerQuestion(attempts)` from
`services/analytics.ts`), so re-practising a previously-missed question updates the score
immediately rather than being diluted by the old wrong attempt. `accuracy = accuracyOf(latest).accuracy`
(correct / total), or `0` if there are no attempts yet.

### `domainCoverage` (weight 0.20)

`DOMAIN_COVERAGE_MIN = 3` — the minimum number of attempts in a domain before that domain
counts as "covered". Computed via `accuracyByDomain(attempts)` grouping by
`domainId`, then:

```
coveredDomains = count of domains where attempts-in-that-domain >= DOMAIN_COVERAGE_MIN
domainCoverage = coveredDomains / domains.length   (0 if there are no domains)
```

### `mockExam` (weight 0.20)

`MOCK_PASS_ANCHOR = 0.72` — the mock accuracy that maps to a **full** mock-exam component
score. Takes the **best of the 3 most recent mock results** (sorted by `finishedAt`
descending, `.slice(0, 3)`), then:

```
bestMock = max(accuracy) across those up-to-3 mocks (0 if none)
mockExam = recentMocks.length === 0 ? 0 : clamp01(bestMock / MOCK_PASS_ANCHOR)
```

So a best-of-3 mock accuracy of 72% or higher yields a full `1.0` mock component (clamped);
below that it scales linearly toward 0.

### `calibration` (weight 0.10)

Delegates to `calibrationScore(attempts)` in `services/analytics.ts`. For each attempt
with a recorded confidence, an **expected** correctness probability is assigned per
confidence level:

```ts
const expected: Record<AnswerConfidence, number> = {
  certain: 0.95,
  'fairly-sure': 0.75,
  unsure: 0.5,
  guess: 0.3,
};
```

The gap `|expected − actual|` (actual is 1 if correct, 0 if not) is averaged across all
confidence-tagged attempts, and the score is `1 − meanGap` (floored at 0). Attempts with
no confidence recorded are excluded from the mean; if there are *no* confidence-tagged
attempts at all, `calibrationScore` returns a neutral prior of `0.5` (this is the only
component with a non-zero default absent data — but it is moot when `hasData` is false,
per the zero-data rule above).

### `recency` (weight 0.10)

Full credit (`1`) if the most recent attempt (`max(attempts.map(a => a.at))`) was within
**3 days** of `now`; decaying linearly to `0` by **21 days** idle:

```ts
const idleDays = (now - last) / DAY;
if (idleDays <= 3) recency = 1;
else recency = clamp01(1 - (idleDays - 3) / 18);   // reaches 0 at idleDays = 21
```

`recency = 0` if there are no attempts at all.

### `reviewBacklog` (weight 0.10)

Inverse of outstanding due spaced-review items, saturating at 20 due items:

```ts
const dueCount = reviewItems.filter((r) => r.dueAt <= now).length;
const reviewBacklog = clamp01(1 - dueCount / 20);
```

So 0 due reviews → `1.0`; 20 or more due reviews → `0`.

## Rounding and clamping

- Every component is individually clamped to `[0, 1]` where its formula could otherwise
  exceed that range (`mockExam`, `recency`, `reviewBacklog` all call `clamp01`).
- The weighted sum `raw` is clamped to `[0, 1]` again before scaling to a 0–100 integer
  score (`Math.round(clamp01(raw) * 100)`).
- The final `score` is always an integer in `[0, 100]`, or exactly `0` when `hasData` is
  `false`.

## Readiness labels

`readinessLabel(score)` maps the 0–100 score to a label and a UI "tone":

```ts
export function readinessLabel(score: number): { label: string; tone: 'danger' | 'warning' | 'info' | 'success' } {
  if (score < 40) return { label: 'Building foundations', tone: 'danger' };
  if (score < 60) return { label: 'Developing', tone: 'warning' };
  if (score < 78) return { label: 'Approaching ready', tone: 'info' };
  return { label: 'Practice-ready', tone: 'success' };
}
```

| Score range | Label | Tone |
| --- | --- | --- |
| `< 40` | Building foundations | danger |
| `40 – 59` | Developing | warning |
| `60 – 77` | Approaching ready | info |
| `≥ 78` | Practice-ready | success |

The sidebar (`ReadinessMini` in `src/app/AppShell.tsx`) shows the score, a colored
progress bar, and the label — or an em dash / "Start practising to see your estimate"
copy when `hasData` is `false`.
