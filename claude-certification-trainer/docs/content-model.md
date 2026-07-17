# Content Model

All static study content is defined as typed TypeScript literals under `src/data/` and
validated against Zod schemas in `src/schemas/content.ts` and `src/schemas/enums.ts`.
Nothing here is fetched at runtime — it is compiled straight into the bundle.

## Id conventions

Every entity id is checked against:

```ts
const idSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'ids must be lowercase kebab-case');
```

i.e. lowercase, starting with a letter/digit, kebab-case throughout (`d1`, `ts-2-3`,
`lesson-1-1`, `q-d1-01`, `q-off-01`, `lab-prompt-structure`, `exam-guide`). In practice
each content kind uses its own prefix convention: `d{n}` for domains, `ts-{domain}-{n}`
for task statements, `lesson-{domain}-{n}` for lessons, `q-d{n}-{seq}` /
`q-off-{seq}` for questions, `ff-{seq}` for Flash Fire items, `lab-{slug}` for labs, and a
descriptive slug for sources (`exam-guide`, `prompt-eng-overview`, ...).

## Entities

### Certification (`CertificationSchema`)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | kebab-case id | e.g. `ccao-f` |
| `code` | string | e.g. `CCAO-F` |
| `name` | string | full display name |
| `description` | string | |
| `blueprintVersion` | string | e.g. `v1.0` |
| `effectiveDate` | string | |
| `questionCount` | positive int | official exam question count |
| `timeLimitMinutes` | positive int | |
| `passingScore` | string | free text, e.g. `"720 out of 1000 (scaled score)"` |
| `scoringNotes` | string | |
| `status` | `CertificationStatusSchema` | `'active' \| 'draft' \| 'archived'` |
| `sourceIds` | id[] (min 1) | must resolve in the source registry |
| `lastVerifiedAt` | string | date the metadata was last checked |

### TaskStatement (`TaskStatementSchema`)

| Field | Type |
| --- | --- |
| `id` | kebab-case id |
| `domainId` | id, must reference a `Domain` |
| `code` | string, e.g. `"1.1"` |
| `title` | string |

### Domain (`DomainSchema`)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | kebab-case id | |
| `certificationId` | id | must reference a `Certification` |
| `title`, `description` | string | |
| `weighting` | number 0–1 | blueprint weight; all domains for a certification must sum to 1.0 |
| `order` | non-negative int | display order |
| `taskStatementIds` | id[] (min 1) | |
| `lessonIds` | id[] | |
| `sourceIds` | id[] | |

### Lesson (`LessonSchema`)

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `certificationId`, `domainId` | ids | |
| `taskStatementId` | id or `null` | |
| `title`, `summary`, `content` | string | `content` is markdown |
| `keyPrinciples`, `decisionRules`, `commonPitfalls` | string[] | bullet lists |
| `sourceIds` | id[] | |
| `relatedQuestionIds`, `relatedLabIds` | id[] | |
| `estimatedMinutes` | positive int | |

### Question (`QuestionSchema`)

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `certificationId`, `domainId` | ids | |
| `taskStatementId` | id or `null` | |
| `difficulty` | `DifficultySchema` | `'easy' \| 'moderate' \| 'difficult'` |
| `questionType` | `QuestionTypeSchema` | `'single-choice' \| 'multiple-response'` |
| `prompt` | string | |
| `answerOptions` | `AnswerOption[]` (min 3) | `{ id, text }` |
| `correctAnswerIds` | id[] (min 1) | must be a subset of `answerOptions` ids |
| `explanation` | string | overall explanation |
| `explanationForEachOption` | `Record<string, string>` | every option id must have a non-empty entry |
| `keyExamClue` | string | the "tell" that identifies the right answer pattern |
| `learningObjective` | string | |
| `relatedLessonIds`, `relatedLabIds` | id[] | |
| `sourceIds` | id[] (min 1) | |
| `provenance` | `ProvenanceSchema` | see below |
| `verifiedAt` | string | date |
| `tags` | string[] | |
| `estimatedTimeSeconds` | positive int | used by the "too-slow" review-reason heuristic |
| `enabled` | boolean | disabled questions are excluded from all selectors that pass `enabledOnly` |

### AnswerOption (`AnswerOptionSchema`)

`{ id: kebab-case id, text: string }` — option ids must be unique within a question.

### FlashFire (`FlashFireSchema`)

Short, single-screen drill items. Same option/correct-answer shape as `Question` but
with `answerOptions` min **2** (not 3), no `difficulty`/`taskStatementId`/explanation-per-option,
just a single `explanation`, plus `relatedQuestionIds`, `relatedLessonIds`, `sourceIds`,
`provenance`, `estimatedTimeSeconds`, `enabled`.

### Lab (`LabSchema`)

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `certificationId` | ids | |
| `domainIds` | id[] (min 1) | a lab can span multiple domains |
| `title`, `objective` | string | |
| `prerequisites` | string[] | |
| `estimatedMinutes` | positive int | |
| `setup` | string[] | |
| `steps` | `LabStep[]` (min 1) | `{ title, detail }` |
| `prompts` | `LabPrompt[]` | `{ label, prompt }` — copy-paste prompts for claude.ai |
| `expectedOutcome` | string | |
| `whatToObserve` | string[] | |
| `whyItMatters` | string | |
| `troubleshooting` | `{ problem, fix }[]` | |
| `cleanup` | string[] | |
| `sourceIds` | id[] | |
| `relatedQuestionIds` | id[] | |
| `requiresPaidFeature` | boolean | |
| `paidFeatureNote` | string | shown when `requiresPaidFeature` is true |

### Source (`SourceSchema`)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | kebab-case id | |
| `title`, `publisher` | string | |
| `url` | valid URL | |
| `sourceType` | `SourceTypeSchema` | see below |
| `lastVerifiedAt` | string | date the citation was transcribed/checked |
| `confidence` | `ConfidenceSchema` | `'high' \| 'medium' \| 'low'` |
| `notes` | string | may be empty |

## Enumerations (`src/schemas/enums.ts`)

- `QuestionTypeSchema`: `single-choice \| multiple-response`
- `DifficultySchema`: `easy \| moderate \| difficult`
- `SourceTypeSchema`: `official-certification-guide \| official-documentation \| official-policy \| official-blog \| community-study-guide \| independently-authored`
- `ConfidenceSchema`: `high \| medium \| low`
- `CertificationStatusSchema`: `active \| draft \| archived`
- `UnderstandingSchema` (learner-set, progress side): `new \| learning \| understood \| needs-revision`
- `AnswerConfidenceSchema` (learner-set, progress side): `certain \| fairly-sure \| unsure \| guess`
- `ReviewGradeSchema` (progress side): `again \| hard \| good \| easy`
- `SessionTypeSchema` (progress side): `practice \| rapid-fire \| flash-fire \| mock-exam \| review`

### Provenance (`ProvenanceSchema`)

```ts
export const ProvenanceSchema = z.enum([
  'official-sample',
  'official-blueprint-derived',
  'official-documentation-derived',
  'repository-authored',
  'independently-authored',
  'unclear',
]);
```

```ts
export const OFFICIAL_PROVENANCE: readonly Provenance[] = [
  'official-sample',
  'official-blueprint-derived',
  'official-documentation-derived',
];

export const NON_OFFICIAL_PROVENANCE: readonly Provenance[] = [
  'repository-authored',
  'independently-authored',
  'unclear',
];

export function isOfficialProvenance(p: Provenance): boolean {
  return OFFICIAL_PROVENANCE.includes(p);
}
```

Only `official-sample`, `official-blueprint-derived`, and `official-documentation-derived`
may ever be surfaced to the learner as "official". `repository-authored`,
`independently-authored`, and `unclear` must never be labelled official. The UI enforces
this directly: `src/components/ProvenanceBadge.tsx`'s `PROVENANCE_META` map assigns each
provenance value a label, badge tone, and an `official: boolean` flag consistent with the
two lists above (e.g. `official-sample` → "Official sample" / `official: true`;
`independently-authored` → "Independently authored" / `official: false`).

In the shipped question bank, `q-off-01`–`q-off-03` are `official-sample` (reproduced
from the CCAO-F Exam Guide's own sample questions), `q-off-04`–`q-off-15` are
`repository-authored` (written by the community study guide this trainer adapts from,
grounded in cited official sources but not official exam items), and the bulk of the
per-domain bank (`questions-d1..d7`) is `independently-authored`.

## Relationship graph

```
Certification (1) ──< Domain (many)
Domain (1) ──< TaskStatement (many)
Domain (1) ──< Lesson (many)          Lesson.taskStatementId → TaskStatement (nullable)
Domain (1) ──< Question (many)        Question.taskStatementId → TaskStatement (nullable)
Domain (1) ──< FlashFire (many)
Lab (many) ──< Domain (many)          Lab.domainIds is many-to-many with Domain

Lesson ──< relatedQuestionIds >── Question
Lesson ──< relatedLabIds >── Lab
Question ──< relatedLessonIds >── Lesson
Question ──< relatedLabIds >── Lab
FlashFire ──< relatedQuestionIds >── Question
FlashFire ──< relatedLessonIds >── Lesson
Lab ──< relatedQuestionIds >── Question

Certification / Domain / Lesson / Question / FlashFire / Lab
        └── sourceIds >── Source (many-to-many; every reference must resolve)
```

All of the `>──` links above are **id references**, not object references — they are
plain strings that must resolve inside the same content bundle. That resolution is what
`validateContent.ts` checks (below), and `src/data/index.ts` provides the lookup maps
(`lessonById`, `questionById`, `flashFireById`, `labById`, `sourceById`,
`certificationById`) and certification/domain-scoped selectors (`getDomains`,
`getQuestions`, `getLessonsForDomain`, `getLabsForDomain`, `getRelatedQuestions`, ...)
that pages use instead of walking these links by hand.

## Validation rules enforced by `validateContent.ts`

`validateContent(bundle)` returns a list of `{ severity: 'error' | 'warning', code,
entity, message }` issues; the content test suite asserts there are **zero errors**.
Checks performed:

- **Schema validation** — every certification, domain, task statement, lesson, question,
  flash-fire item, lab, and source is parsed against its Zod schema (`code: 'schema'`).
- **Duplicate ids** — no two entities of the same kind share an id
  (`code: 'duplicate-id'`); additionally lessons, questions, flash-fire items, and labs
  share one combined id namespace and must not collide across kinds
  (`code: 'duplicate-id'` on `content:*`).
- **Domain weighting sum** — for each certification, its domains' `weighting` values
  must sum to 1.0 within `0.001` tolerance (`code: 'weighting-sum'`).
- **Referential integrity** — every reference must resolve within the bundle:
  domain → certification (`missing-cert`), domain weighting range (`invalid-weighting`),
  domain → task statement / lesson / source (`missing-task`, `missing-lesson`,
  `missing-source`), task statement → domain (`missing-domain`), lesson → domain / task
  statement / source (`missing-domain`, `missing-task`, `missing-source`), lesson →
  related question/lab existence (`broken-ref`), question → domain / task statement
  (`missing-domain`, `missing-task`), question → related lesson/lab existence
  (`broken-ref`), question/flash-fire/lab → source existence (`missing-source`),
  flash-fire → domain (`missing-domain`), flash-fire → related question/lesson existence
  (`broken-ref`), lab → each of its domains (`missing-domain`), lab → related question
  existence (`broken-ref`), certification → source existence (`missing-source`).
- **Question option integrity** — option ids unique within a question
  (`duplicate-option`); at least one correct answer (`no-correct-answer`); every
  `correctAnswerIds` entry must be one of the option ids
  (`correct-not-an-option`); single-choice questions must have exactly 1 correct answer
  (`single-choice-count`); multiple-response questions must have at least 2
  (`multiple-response-count`); every option id must have a non-empty entry in
  `explanationForEachOption` (`missing-option-explanation`); `provenance` must be one of
  the enum values (`bad-provenance`).
- **Flash Fire option integrity** — same duplicate-option / no-correct-answer /
  correct-not-an-option checks as questions.
- **Source presence (warning)** — a question with an empty `sourceIds` array produces a
  warning, not an error (`code: 'no-source'`).
- **Official-provenance sanity** — an `enabled` question with `provenance: 'unclear'`
  produces a warning (`code: 'unclear-enabled'`); any question whose provenance is one of
  the official values (`isOfficialProvenance`) but has zero `sourceIds` is an **error**
  (`code: 'official-without-source'`) — official-labelled content must always be
  traceable to a source.

`errorsOnly(issues)` filters the list down to `severity === 'error'` entries for use in
assertions.
