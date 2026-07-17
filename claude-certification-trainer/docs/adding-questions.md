# Adding Questions

## Where a question lives

Practice questions live in `src/data/questions/`, one file per domain:

```
src/data/questions/
  questions-official.ts   # official-sample + repository-authored items (do not add here)
  questions-d1.ts         # Domain 1 — Prompting and Task Execution
  questions-d2.ts         # Domain 2 — Output Evaluation and Validation
  questions-d3.ts         # Domain 3 — Product and Model Selection
  questions-d4.ts         # Domain 4 — Workflow Integration and Solution Design
  questions-d5.ts         # Domain 5 — Configuration and Knowledge Management
  questions-d6.ts         # Domain 6 — Governance, Risk, and Responsible Use
  questions-d7.ts         # Domain 7 — Troubleshooting and Optimization
  index.ts                # concatenates all of the above into `questions: Question[]`
```

To add a new authored question for domain N (matching the current CCAO-F content), add
it to the exported array in `src/data/questions/questions-dN.ts`. `index.ts` already
spreads every per-domain array into the combined `questions` export — no wiring needed
beyond adding the object to the right array.

## The exact `Question` shape (`src/schemas/content.ts`)

```ts
export const QuestionSchema = z.object({
  id: idSchema,                                   // kebab-case, e.g. "q-d1-16"
  certificationId: idSchema,                      // "ccao-f"
  domainId: idSchema,                             // "d1".."d7"
  taskStatementId: idSchema.nullable(),            // "ts-1-2" or null
  difficulty: DifficultySchema,                    // "easy" | "moderate" | "difficult"
  questionType: QuestionTypeSchema,                // "single-choice" | "multiple-response"
  prompt: nonEmpty,
  answerOptions: z.array(AnswerOptionSchema).min(3), // [{ id, text }, ...] — at least 3
  correctAnswerIds: z.array(idSchema).min(1),
  explanation: nonEmpty,
  explanationForEachOption: z.record(z.string(), nonEmpty), // one entry per option id
  keyExamClue: nonEmpty,
  learningObjective: nonEmpty,
  relatedLessonIds: z.array(idSchema),
  relatedLabIds: z.array(idSchema),
  sourceIds: z.array(idSchema).min(1),
  provenance: ProvenanceSchema,
  verifiedAt: nonEmpty,
  tags: z.array(nonEmpty),
  estimatedTimeSeconds: z.number().int().positive(),
  enabled: z.boolean(),
});
```

## Copy-paste template

```ts
{
  id: 'q-d1-16', // next free id in this domain's sequence — check the file for the highest existing q-d1-NN
  certificationId: 'ccao-f',
  domainId: 'd1',
  taskStatementId: 'ts-1-1', // must exist in src/data/domains/index.ts, or null
  difficulty: 'moderate', // 'easy' | 'moderate' | 'difficult'
  questionType: 'single-choice', // 'single-choice' | 'multiple-response'
  prompt: 'Scenario/question text goes here.',
  answerOptions: [
    { id: 'a', text: 'First option.' },
    { id: 'b', text: 'Second option.' },
    { id: 'c', text: 'Third option.' },
    { id: 'd', text: 'Fourth option.' },
  ],
  correctAnswerIds: ['b'], // exactly 1 id for single-choice, 2+ for multiple-response
  explanation: 'Why the correct answer is correct, in exam-relevant terms.',
  explanationForEachOption: {
    a: 'Why this option is wrong (or right, if it is the correct one).',
    b: 'Why this option is correct.',
    c: 'Why this option is wrong.',
    d: 'Why this option is wrong.',
  },
  keyExamClue: 'The one-line "tell" that identifies the right answer pattern.',
  learningObjective: 'What skill/knowledge this question is testing.',
  relatedLessonIds: ['lesson-1-1'], // must exist in src/data/lessons
  relatedLabIds: [], // must exist in src/data/labs, if any
  sourceIds: ['prompt-eng-overview'], // must exist in src/data/sources — never empty for a real question
  provenance: 'independently-authored', // see Provenance rules below
  verifiedAt: '2026-07-17', // date you wrote/checked this against its source
  tags: ['golden-rule', 'prompting'],
  estimatedTimeSeconds: 50,
  enabled: true,
},
```

## Id conventions

- Question ids are kebab-case: `/^[a-z0-9][a-z0-9-]*$/`.
- Per-domain files use `q-d{N}-{seq}` (e.g. `q-d1-01`, `q-d1-02`, ... `q-d1-16`) — open
  the target file and use the next integer after the highest existing `q-dN-NN`.
  Zero-pad to two digits to match the existing style.
- Ids must be unique not just within the file but across the **entire** content bundle —
  lessons, questions, flash-fire items, and labs all share one id namespace check in
  `validateContent.ts` (`duplicate-id` on the combined `content:*` set).

## Provenance rules

`provenance` must be one of the `ProvenanceSchema` values (`src/schemas/enums.ts`).
**When you author a new question yourself, always use `'independently-authored'`.**

- Never use `'official-sample'`, `'official-blueprint-derived'`, or
  `'official-documentation-derived'` for anything you wrote — those are reserved for
  content that is genuinely reproduced from or directly derived from Anthropic's own
  official materials (the exam guide's own sample questions, the blueprint text, or
  official documentation), and the UI (`ProvenanceBadge`) will label it "official" to
  the learner.
- `'repository-authored'` is reserved for items carried over from the community study
  guide this trainer adapts from (`questions-official.ts`) — do not use it for new
  content you write.
- `'unclear'` means provenance could not be confirmed; an enabled question with
  `'unclear'` provenance produces a validation **warning**, not an error, but should be
  avoided for anything new.
- Any question whose provenance claims official status but has an empty `sourceIds` is a
  hard validation **error** (`official-without-source`) — so official-provenance content
  must always cite a source; this doesn't apply to `independently-authored`, but
  `sourceIds` is `min(1)` in the schema regardless, so every question needs at least one
  source either way.

## Answer options and explanations

- `answerOptions` needs **at least 3** entries, each `{ id, text }` with a unique `id`
  within the question (letters `a`, `b`, `c`, ... is the existing convention).
- `correctAnswerIds` must be a non-empty subset of the option ids.
  - `single-choice` questions must have **exactly 1** correct answer id
    (`single-choice-count` error otherwise).
  - `multiple-response` questions must have **at least 2** correct answer ids
    (`multiple-response-count` error otherwise).
- `explanationForEachOption` must have a non-empty string entry for **every** option id
  — a missing or blank entry for any option is a validation error
  (`missing-option-explanation`). Write a real sentence for every option, including the
  wrong ones — this is what powers the per-option feedback in the question UI.

## `sourceIds` must exist in the registry

Every id in `sourceIds` must resolve to an entry in `src/data/sources/index.ts`
(`missing-source` error otherwise). If you need to cite something not already in the
registry, add a `Source` entry there first (see its schema in `docs/content-model.md`),
then reference its id.

## Running the validation suite

```bash
npm run test
```

This runs the full Vitest suite, which includes:

- `src/data/content.test.ts` and `src/services/validateContent.test.ts` — run
  `validateContent()` over the entire shipped content bundle and assert `errorsOnly(...)`
  is empty. Any typo in an id reference, a missing option explanation, a bad
  single/multiple-response answer count, an unbalanced domain weighting, etc. fails here.
- `src/schemas/*` are exercised indirectly through the same validation (every entity is
  schema-parsed first).

Also run `npm run typecheck` (or `npm run build`, which runs `tsc -b` first) to catch
plain TypeScript shape mistakes (e.g. a missing field) before the content-validation
suite even runs. There is no separate "add a question" script — editing the array and
running the test suite is the whole workflow.

## Adding a Flash Fire item

Flash Fire items (`src/data/flash-fire/index.ts`) are short, single-screen drills built
with a small local helper, `ff(id, domainId, prompt, options, correct, explanation, extra?)`:

```ts
ff('ff-16', 'd3',
  'Short scenario/prompt text?',
  ['Correct-sounding option', 'Distractor one', 'Distractor two'],
  ['a'], // correctAnswerIds — index 0 becomes option id 'a', index 1 'b', etc.
  'One-sentence explanation of the correct answer.',
  { relatedLessonIds: ['lesson-3-1'], relatedQuestionIds: ['q-off-09'], sourceIds: ['code-execution-tool'] },
),
```

The helper fills in the rest of the `FlashFireSchema` shape for you:
`certificationId: 'ccao-f'`, `provenance: 'independently-authored'`,
`estimatedTimeSeconds: 15`, `enabled: true`, and empty
`relatedQuestionIds`/`relatedLessonIds`/`sourceIds` unless overridden via the `extra`
argument. `answerOptions` needs a **minimum of 2** entries (lower than the 3-option
minimum for full `Question`s). Use the next free `ff-{seq}` id (zero-padded, two digits,
matching the existing sequence), then run `npm run test` the same way as for questions —
Flash Fire items go through the same `validateContent` checks (domain existence, option
integrity, correct-answer-is-an-option, related-id existence, source existence).
