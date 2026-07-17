# CLAUDE.md — Claude Certification Trainer

Guidance for Claude (and human contributors) working in this repository.

## Product objective

A polished, local-first study and exam-preparation platform for the **Claude
Certified Associate – Foundations (CCAO-F)** exam. It helps a learner understand
every verified domain, practise realistic questions, understand *why* each answer
is right or wrong, reproduce concepts in their own Claude environment (labs),
improve speed, simulate the exam, find weak areas, review misconceptions with
spaced repetition, and track progress — entirely offline after install.

It is an **independent** study tool. It must **never** imply it is official,
endorsed by Anthropic, or able to predict an exam result. The disclaimer
"Independent study application. Not affiliated with, authorised by or endorsed by
Anthropic." must remain prominent.

## Architecture overview

- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + React Router 6 + Zod +
  Vitest/RTL. Mermaid is lazy-loaded. No backend, database, accounts, auth, or API
  keys. Persistence is versioned `localStorage`.
- **Layout:** `src/data` (typed content) · `src/schemas` (Zod) · `src/services`
  (pure logic: scoring, review, readiness, analytics, mockExam, validateContent,
  storage) · `src/hooks` (store + derived) · `src/components` (UI) · `src/pages`
  (routes) · `src/app` (shell + router). See `docs/architecture.md`.
- **State:** a single `useReducer`-backed store (`src/hooks/store.tsx`) persisted
  to `localStorage` and validated on load, with migration support.

## Coding standards

- TypeScript **strict**; `noUnusedLocals`/`noUnusedParameters` on. No `any` unless
  unavoidable (lint warns).
- `npm run lint` must pass with **zero warnings**; `npm run typecheck` and
  `npm run build` must pass; `npm run test` must be green. Never claim they pass
  without running them.
- Prefer pure functions in `src/services` (unit-tested) over logic in components.
- Match the existing style; keep components small and readable.

## Component conventions

- Reuse the primitives in `src/components/ui.tsx` (Button, Card, Badge, StatTile,
  ProgressBar, EmptyState, Segmented, Toggle, PageHeader).
- Every interactive control is a real `<button>`/`<a>`/form element with an
  accessible name and visible focus ring. No colour-only status; pair icons/labels.
- Charts are custom accessible SVG in `src/components/charts.tsx` and **must**
  carry a text summary. No decorative or fake charts.

## Data-model rules

- All content is validated by `src/services/validateContent.ts`; the content test
  suite must show **zero errors**. IDs are lowercase kebab-case and unique.
- Domain weightings for a certification must sum to `1.0`.
- Single-choice questions have exactly one correct answer; multiple-response have
  at least two. Every option must have an explanation. `sourceIds` must resolve.

## Provenance rules (load-bearing)

- Every question and Flash Fire item carries a `provenance`. Only
  `official-sample`, `official-blueprint-derived`, and
  `official-documentation-derived` may be surfaced as "official"
  (`isOfficialProvenance`).
- Questions written for this trainer are `independently-authored`; questions from
  the source study guide are `repository-authored`. **Never present authored or
  community content as official**, and never claim a question appeared on the live
  exam or reproduce recalled/leaked exam questions.
- Items with `unclear` provenance must never be labelled official.

## Source requirements

- Every source lives in `src/data/sources/index.ts` with a real URL, publisher,
  `sourceType`, `confidence`, and `lastVerifiedAt`. Prioritise official Anthropic
  sources; clearly distinguish community/independent material.
- Authored questions must cite the official source(s) they are grounded in.

## Accessibility expectations

Semantic HTML, full keyboard navigation, visible focus, labelled form controls,
screen-reader labels, sufficient contrast, reduced-motion support, non-colour-only
status, accessible timer warnings (`aria-live`), chart text summaries, and a skip
link. Keep these when changing UI.

## Testing commands

```bash
npm run test       # Vitest once
npm run lint       # ESLint (zero warnings)
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

Add/extend tests for any new logic. Content changes must keep the content
validation suite green.

## Content-quality rules

- Prioritise complete, polished, tested core functionality over many shallow
  features. **No** placeholder buttons, empty screens, fake stats/charts, TODO
  labels, dead routes, or broken links.
- If a feature cannot be finished properly, omit it rather than ship a broken or
  misleading version.
- Authored questions test the underlying principle with new scenarios, one clearly
  best answer (or an explicit required count), plausible non-absurd distractors,
  an explanation for every option, a key clue, a learning objective, and cited
  sources.

## Adding certifications safely

The architecture is multi-certification-ready (all selectors filter by
`certificationId`). To add one: add the `Certification`, its `Domain`s (weightings
summing to 1.0), `TaskStatement`s, `Lesson`s, `Question`s, `Lab`s, and `Source`s —
**only** for fully-sourced content. Never invent domains, weightings, exam rules,
or questions for a certification that is not fully sourced. Keep `validateContent`
and the tests green. See `docs/adding-a-certification.md`.

## Prohibitions

- Do **not** present authored or community questions as official Anthropic content.
- Do **not** add any runtime dependency on `../source-guide` or require users to
  clone the upstream repo — all content must live in this repository.
- Do **not** fabricate statistics, charts, or exam-outcome predictions.
