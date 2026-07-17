# Adding a Certification

## Why the app currently ships only CCAO-F

`src/data/certifications/index.ts` exports a single `Certification` record
(`id: 'ccao-f'`, "Claude Certified Associate – Foundations") and
`activeCertificationId = 'ccao-f'`. This is not a hard architectural limit — the content
model and every selector are certification-scoped by `certificationId` — it's a content
decision: **CCAO-F is the only certification for which this project has a fully-sourced
content set** (an official exam guide plus a cited, adapted community study guide; see
`src/data/sources/index.ts`, sources `exam-guide` and `source-repo`). Every lesson,
question, lab, and domain weighting currently in the repo traces back to one of those two
sources. Adding a second certification without equivalent sourcing would mean shipping
unsupported or invented content, which `validateContent.ts` cannot catch (it checks
referential integrity and shape, not whether an exam-fact claim is true) — so it's a
project rule, not a code constraint.

## How the architecture already supports more certifications

Every content entity carries a `certificationId` (or, for `TaskStatement`/`Lesson`, a
`domainId` that itself carries one), and every selector in `src/data/index.ts` filters by
it:

```ts
getDomains(certId)
getLessons(certId)
getQuestions(certId, opts?)
getFlashFire(certId, enabledOnly?)
getLabs(certId)
```

Pages and hooks (`useActiveCertification`, `useCertAttempts`, `useReadiness`,
`useQuestionBank` in `src/hooks/useDerived.ts`) all key off
`state.settings.activeCertificationId`, not a hardcoded id. `PersistedState` and
`Settings` (`src/schemas/progress.ts`) are certification-agnostic — `attempts`,
`reviewItems`, and `mockResults` each carry their own `certificationId` and are filtered
by it wherever they're read. Adding a second `Certification` object to the array in
`src/data/certifications/index.ts` (and a way for the learner to switch
`activeCertificationId` in Settings) is enough for the whole app to serve a second exam
— **provided its content is fully sourced.**

One place that is not certification-generic today: `src/pages/SourcesPage.tsx` links to
the CCAO-F community study guide (`evggzzz/ccao-f-guide`) as static attribution copy. A
second certification with a different source lineage would need its own attribution
section there, not a reuse of that link.

## Steps to add a certification safely

1. **Confirm you have full sourcing first.** Do not start adding domains, questions, or
   labs before you have an official exam guide (or equivalent authoritative blueprint)
   and, ideally, a citable secondary source for supporting explanations. If you don't
   have that, stop — this is a `VALIDATE-FIRST`-style gate on the content itself, not
   just the product.
2. **Add sources** (`src/data/sources/index.ts`): one `Source` entry per citation you'll
   reference, each with a real `url`, correct `sourceType`, and honest `confidence`. See
   `docs/content-model.md` for the `Source` schema.
3. **Add the `Certification` record** (`src/data/certifications/index.ts`): new
   `id` (kebab-case, e.g. `xyz-cert`), `code`, `name`, `description`, `blueprintVersion`,
   `effectiveDate`, `questionCount`, `timeLimitMinutes`, `passingScore`, `scoringNotes`,
   `status`, `sourceIds` (must resolve), `lastVerifiedAt`. Push it into the exported
   `certifications` array; leave `activeCertificationId`/`defaultCertification` pointing
   at CCAO-F unless you intend to switch the app's default.
4. **Add its Domains** (new file under `src/data/domains/`, or extend the existing
   `index.ts` if you prefer one file): each `Domain.certificationId` must point at the
   new certification id, and **all domain `weighting` values for that certification must
   sum to 1.0** (`validateContent.ts`'s `weighting-sum` check, ±0.001 tolerance) —
   exactly reproducing the blueprint's published domain weights, not invented ones.
5. **Add its TaskStatements**, each `domainId` pointing at one of the new domains.
6. **Add its Lessons** (new `lessons-*.ts` files, wired into `src/data/lessons/index.ts`),
   each `certificationId`/`domainId`/`taskStatementId` correctly scoped, and content
   grounded in the sources you added in step 2 — no invented facts, no claims not
   traceable to a source.
7. **Add its Questions** (new `questions-*.ts` files, wired into
   `src/data/questions/index.ts`): follow `docs/adding-questions.md` for the exact shape,
   provenance rules (never mark self-authored content as official), and per-option
   explanation requirements.
8. **Add its Labs** (new `labs-*.ts` files, wired into `src/data/labs/index.ts`), each
   `domainIds` pointing at the new certification's domains.
9. **Never add unsupported domains, weightings, or questions.** If a detail (a domain
   weighting, a task statement wording, a passing score) isn't in a source you can cite,
   don't invent a plausible-sounding value — leave it out or mark it clearly as
   unconfirmed and keep it out of anything presented as official.
10. **Run validation and tests:**
    ```bash
    npm run test        # runs validateContent() over the whole bundle, incl. the new cert
    npm run typecheck    # (or npm run build, which runs tsc -b first)
    ```
    Both must pass with zero errors before the new certification is considered addable —
    the same content test suite covers every certification in the bundle at once, so a
    mistake in the new one will surface exactly like a mistake in CCAO-F would.
11. **Only then** wire up certification switching in the UI (e.g. a selector in
    `SettingsPage` that updates `settings.activeCertificationId`) if the app doesn't
    already expose one for multiple certifications — check current `SettingsPage.tsx`
    behavior before assuming this needs to be built from scratch.

## Checklist

- [ ] Sources added and cited (`src/data/sources/index.ts`), each with a real URL and
      honest confidence rating
- [ ] `Certification` record added, `sourceIds` resolve
- [ ] Domains added, `weighting` values sum to 1.0 for the new `certificationId`
- [ ] TaskStatements added, each `domainId` resolves
- [ ] Lessons added, grounded in cited sources, `domainId`/`taskStatementId` resolve
- [ ] Questions added following `docs/adding-questions.md` (shape, option-count rules,
      per-option explanations, provenance never claimed as official for authored content)
- [ ] Labs added, `domainIds` resolve
- [ ] No invented/unsupported domain weightings, task statements, or questions anywhere
      in the new content
- [ ] `npm run test` passes with zero `validateContent` errors
- [ ] `npm run typecheck` (or `npm run build`) passes
- [ ] Attribution surfaces (e.g. `SourcesPage.tsx`) updated if the new certification has
      a different source lineage than CCAO-F's
