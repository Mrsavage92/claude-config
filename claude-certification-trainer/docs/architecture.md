# Architecture

## Summary

Claude Certification Trainer is a **local-first single-page application**. There is no
backend, no database, no user accounts, and no API keys anywhere in the stack. All study
content ships as typed TypeScript data compiled into the bundle; all learner progress
(attempts, review schedule, mock results, settings) lives in the browser's
`localStorage`, versioned and migrated by hand-written code.

| Layer | Technology |
| --- | --- |
| UI | React 18 (function components + hooks) |
| Language | TypeScript (strict, project-referenced via `tsc -b`) |
| Build tool | Vite 5 (`@vitejs/plugin-react`) |
| Styling | Tailwind CSS 3, CSS custom properties for theme colors |
| Routing | React Router 6 (`react-router-dom`), client-side only |
| Validation | Zod 3 — schemas for both static content and persisted state |
| Testing | Vitest 2 + Testing Library + jsdom |
| Markdown/diagrams | `react-markdown` + `remark-gfm`, `mermaid` for diagram rendering |
| Icons | `lucide-react` |

Path alias `@` → `src/` (configured in `vite.config.ts` and the `tsconfig*.json` files).

## Folder layout

```
src/
  schemas/        Zod schemas + inferred TS types (content + persisted state + enums)
  data/            Static study content, organized per entity kind
    certifications/
    domains/       domains + task statements
    lessons/       lessons-d1..d7
    questions/     questions-d1..d7, questions-official
    flash-fire/
    labs/          labs-1, labs-2
    sources/       citation registry
    index.ts       re-exports + lookup maps + certification-scoped selectors
  services/        Pure, framework-free business logic
    readiness.ts       practice-readiness scoring
    review.ts          spaced-review scheduling
    mockExam.ts         mock exam composition
    scoring.ts          answer correctness / selection rules
    validateContent.ts  content-graph validation (referential integrity)
    analytics.ts        accuracy/calibration/time-series aggregation
    storage/            localStorage load/save, versioning, migrations, defaults
  hooks/           React state glue
    store.tsx       useReducer + Context store (the single source of learner state)
    useDerived.ts   derived selectors (active certification, readiness, question bank)
    useTheme.ts     applies theme mode to <html>, watches OS preference
  components/      Reusable presentational components (Markdown, charts, badges, question UI, ui primitives)
  pages/           One component per route (Dashboard, Learn, Practice, Mock Exam, ...)
  app/             App.tsx (route table), AppShell.tsx (layout/nav/banners), nav.ts (nav config)
  features/        Reserved, currently-empty per-feature subfolders (dashboard, learn,
                   practice, mock-exam, labs, review, progress, settings, rapid-fire,
                   flash-fire) — not populated; all logic today lives in pages/components.
  test/            Cross-cutting tests (independence guard, jsdom setup)
  utils/           Small helpers (id generation, shuffle, className merge)
  main.tsx         Entry point (mounts <App/> inside StoreProvider + BrowserRouter)
```

## Data flow

**Static content** (never mutated at runtime):

```
src/data/*/*.ts (typed literals)
  → src/data/index.ts (re-exports, id-keyed lookup maps, certification-scoped selectors)
  → pages/components (via getDomains, getQuestions, getLessons, getLabs, ...)
```

Every content object is checked against its Zod schema in `src/schemas/content.ts`, and
the whole graph is checked for referential integrity by
`src/services/validateContent.ts` (see `docs/content-model.md`). This runs in the content
test suite (`src/data/content.test.ts` and `src/services/validateContent.test.ts`), so
broken content is a failing `npm run test`, not a runtime surprise.

**Learner state** (mutated by user interaction):

```
StoreProvider (src/hooks/store.tsx)
  useReducer(reducer, loadState())        — reducer is a pure function over Action
  dispatch(...)                            — pages call typed helpers (recordAttempt, patchLesson, ...)
  useEffect(() => saveState(state), [state]) — every state change is persisted
```

`loadState()` / `saveState()` (`src/services/storage/storage.ts`) read/write a single
`localStorage` key (`STORAGE_KEY = 'cct.state.v1'`), JSON-encoded. On load, the raw JSON
is passed through `migrate()` (`src/services/storage/migrations.ts`) to bring older
shapes up to `CURRENT_STATE_VERSION`, then validated against `PersistedStateSchema`. If
parsing, migration, or validation fails at any step, `loadState()` falls back to
`makeDefaultState()` and reports `recovered: true` with a reason, which `AppShell`
surfaces as a dismissible banner.

Export/import (Settings page) wraps `PersistedState` in a `ProgressExport` envelope
(`{ app, exportedAt, state }`) via `buildExport` / `parseImport`, running the same
migrate-then-validate path so an imported file from an older app version is upgraded
rather than rejected.

`src/hooks/useDerived.ts` sits between the store and the pages: `useActiveCertification`,
`useCertAttempts`, `useReadiness`, and `useQuestionBank` combine store state with content
selectors and the `services/` pure functions (`computeReadiness`, `getQuestions`, ...) so
pages consume ready-made view data rather than re-deriving it.

## Rendering pipeline

- `main.tsx` mounts `<StoreProvider><BrowserRouter><App /></BrowserRouter></StoreProvider>`.
- `App.tsx` calls `useThemeEffect()` once (applies theme class to `<html>`) and renders
  `AppShell` wrapping an `ErrorBoundary` around the `<Routes>` table.
- `AppShell.tsx` renders the disclaimer banner, the recovery-notice banner, a
  desktop sidebar / mobile drawer (`NavList`, `CertHeader`, `ReadinessMini`), and the
  themed toggle, then the routed page content in a scrollable `<main>`.
- Pages call `useStore()` for state/actions and `useDerived` hooks / `src/data` selectors
  for content, and render `components/` (question UI, charts, markdown, badges) to
  display it.

## Theme system

Colors are CSS custom properties defined on `:root` (light) and overridden under `.dark`
in `src/index.css` (`--surface`, `--ink`, `--brand`, `--success`, `--warning`, `--danger`,
`--info`, etc., as `R G B` triples consumed via `rgb(var(--x))`). Tailwind's config maps
utility classes (e.g. `bg-surface`, `text-ink`, `bg-brand`) onto these variables, so
`dark:` variants are unnecessary — toggling the `.dark` class on `<html>` (done by
`useThemeEffect`) repaints the whole app. `ThemeMode` is `'light' | 'dark' | 'system'`;
in `'system'` mode a `matchMedia('(prefers-color-scheme: dark)')` listener keeps the
class in sync with the OS setting. A separate `reduce-motion` class is toggled from the
`reduceMotion` setting.

## Routing table

Defined in `src/app/App.tsx` (all client-side, no data loaders):

| Path | Page |
| --- | --- |
| `/` | `DashboardPage` |
| `/learn` | `LearnPage` |
| `/learn/:domainId` | `LearnDomainPage` |
| `/practice` | `PracticePage` |
| `/rapid-fire` | `RapidFirePage` |
| `/flash-fire` | `FlashFirePage` |
| `/mock-exam` | `MockExamConfigPage` |
| `/mock-exam/session` | `MockExamSessionPage` |
| `/mock-exam/results` | `MockExamResultsPage` |
| `/labs` | `LabsPage` |
| `/labs/:labId` | `LabDetailPage` |
| `/review` | `ReviewPage` |
| `/progress` | `ProgressPage` |
| `/sources` | `SourcesPage` |
| `/settings` | `SettingsPage` |
| `/404` | `NotFoundPage` |
| `*` | redirects to `/404` |

The sidebar nav (`src/app/nav.ts`) groups these into three sections — `study` (Dashboard,
Learn, Labs), `practice` (Practice, Rapid Fire, Flash Fire, Mock Exam, Review), and
`insights` (Progress, Sources, Settings) — rendered by `AppShell`'s `NavList`.

## No backend, by design

There is no server component, no network call for content or progress, and no
authentication. The `package.json` dependency list contains no HTTP client, no ORM, and
no auth library. `src/services/storage/storage.ts`'s `safeLocalStorage()` probes for
`localStorage` availability and degrades gracefully (in-memory defaults, no persistence)
in environments where it is unavailable (e.g. strict private-browsing modes).
