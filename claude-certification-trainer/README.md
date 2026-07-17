# Claude Certification Trainer

A polished, **local-first** study and exam-preparation platform for the
**Claude Certified Associate – Foundations (CCAO-F)** exam.

> **Independent study application. Not affiliated with, authorised by or endorsed
> by Anthropic.** It does not predict or guarantee an exam result. "Claude",
> "Anthropic", and the Claude Certification Program are trademarks of Anthropic PBC.

Everything runs in your browser. There is **no backend, no database, no account,
no login, and no API key** — your progress is stored locally and never leaves
your machine.

---

## Features

- **Dashboard** — real, stored metrics: practice-readiness estimate, accuracy,
  average response time, reviews due, lessons/labs completed, strongest/weakest
  domain, recent activity, latest mock score, and a recommended next action.
- **Learn** — all seven verified CCAO-F domains as prose lessons with key
  principles, decision rules, common pitfalls, tables, a Mermaid domain diagram,
  sources, and per-lesson progress (complete / bookmark / understanding / note).
- **Practice** — filterable question bank with confidence rating, hidden answers
  until submission, and full per-option explanations, key exam clue, learning
  objective, related lessons/labs, and sources.
- **Rapid Fire** — timed speed rounds (5/10/20 questions; 15/30/45s or untimed)
  with keyboard shortcuts and end-of-round analytics.
- **Flash Fire** — short, fast-recognition drills with instant feedback.
- **Mock Exam** — a timed, blueprint-weighted practice exam with a question
  navigator, flagging, refresh-safe persistence, and a detailed results report.
- **Labs** — hands-on exercises to reproduce concepts in your own Claude
  environment, with copyable prompts (safe fictional data only).
- **Review** — an explainable spaced-repetition queue that prioritises
  misconceptions (confident-but-wrong answers).
- **Progress** — accuracy over time, by domain, confidence calibration, and mock
  history — every chart paired with a text summary.
- **Sources & attribution** — every source with provenance and confidence, and a
  clear official-vs-community distinction.
- **Settings** — theme, reduce-motion, defaults, and JSON export/import/reset.

Light & dark mode, responsive layout, full keyboard navigation, and WCAG-minded
accessibility throughout.

---

## Prerequisites

- **Node.js 18+** (developed and tested on Node 22)
- **npm 9+**

No other services or credentials are required.

## Installation & running

```bash
npm install
npm run dev
```

Then open the printed local URL (default <http://localhost:5173>).

### All commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint (zero warnings allowed) |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Type-check without emitting |

A fresh clone can be installed and run with only `npm install` and `npm run dev`.

---

## Local progress storage

All learner state lives in your browser's `localStorage` under the key
`cct.state.v1`. This includes settings, theme, question attempts, lesson and lab
progress, notes and bookmarks, the review queue, mock-exam state, and analytics
history. The store is **versioned** and validated with Zod on load; if it is ever
corrupted, the app safely resets to defaults and tells you.

### Reset

Go to **Settings → Data & progress → Reset progress**. This erases all local
progress after a confirmation. (You can also clear site data in your browser.)

### Export & import

- **Export** downloads a JSON snapshot (`claude-cert-trainer-progress.json`).
- **Import** validates the file before applying it and replaces your local state.

Both live under **Settings → Data & progress**.

---

## Adding content

- **Questions & Flash Fire** — see [`docs/adding-questions.md`](docs/adding-questions.md).
  Author new questions in `src/data/questions/questions-dN.ts`, label them
  `independently-authored`, explain every option, and run `npm run test` — the
  content-validation suite catches structural mistakes.
- **Another certification** — see [`docs/adding-a-certification.md`](docs/adding-a-certification.md).
  The architecture is multi-certification-ready; only fully-sourced content
  should be added. **Never** add unsupported domains, weightings, or questions.

---

## Documentation

| Doc | Contents |
| --- | --- |
| [`CLAUDE.md`](CLAUDE.md) | Project objective, conventions, and rules for contributors/agents |
| [`docs/architecture.md`](docs/architecture.md) | Technical architecture and data flow |
| [`docs/content-model.md`](docs/content-model.md) | Content entities, schemas, and validation |
| [`docs/content-audit.md`](docs/content-audit.md) | Review of imported/authored questions |
| [`docs/readiness-model.md`](docs/readiness-model.md) | The practice-readiness formula |
| [`docs/review-system.md`](docs/review-system.md) | The spaced-repetition algorithm |
| [`docs/adding-questions.md`](docs/adding-questions.md) | How to add questions |
| [`docs/adding-a-certification.md`](docs/adding-a-certification.md) | How to add a certification |
| [`docs/attribution.md`](docs/attribution.md) | Attribution and licensing detail |

---

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · React Router 6 · Zod ·
Vitest + React Testing Library · Mermaid (lazy-loaded) · `localStorage`.

---

## Licensing

- **This application's code and its adapted study content** are released under
  **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.
- Study content is adapted from the independent, CC BY 4.0 study guide
  **[evggzzz/ccao-f-guide](https://github.com/evggzzz/ccao-f-guide)**.
- Anthropic retains copyright over its official documentation and ownership of
  its trademarks. Each cited source links to the original.

See [`docs/attribution.md`](docs/attribution.md) for full detail.

---

## Attribution

This project adapts material from **evggzzz/ccao-f-guide** (CC BY 4.0), an
independent study guide. It is **not** a fork, contains its own history, and has
no runtime dependency on that repository — all transformed content lives inside
this repository. It is independent software and is **not endorsed by, affiliated
with, or sponsored by Anthropic**.
