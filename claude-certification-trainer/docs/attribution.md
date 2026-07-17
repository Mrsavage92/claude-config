# Attribution & Licensing

## Summary

- This application **adapts material from
  [evggzzz/ccao-f-guide](https://github.com/evggzzz/ccao-f-guide)**.
- The source repository is licensed under
  **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.
- The original repository is an **independent study guide**, not official
  Anthropic material.
- **Anthropic retains ownership of its trademarks and official documentation.**
- This application is **independent** and is **not endorsed by, affiliated with,
  or sponsored by Anthropic.**

## What was adapted

The upstream guide is a single long-form Markdown study guide. For this trainer,
its useful material was **transformed into structured, typed, Zod-validated
content**:

- Certification metadata, the seven domains and their blueprint weightings, and
  task statements → `src/data/certifications`, `src/data/domains`.
- Domain prose → structured `Lesson` records (`src/data/lessons`).
- The guide's sample questions were transcribed with honest provenance:
  - The three official CCAO-F Exam Guide samples are labelled
    `official-sample`.
  - The guide's additional practice items are labelled `repository-authored`.
- Additional practice questions and all Flash Fire items were **independently
  authored for this trainer** (`independently-authored`), grounded in the same
  official Anthropic sources the guide cites.
- The guide's exercises → interactive `Lab` records (`src/data/labs`).
- Every cited URL → the source registry (`src/data/sources`).

No text from the guide is loaded at runtime, and the app has **no runtime
dependency** on the upstream repository. This project is **not a fork** and does
not include the upstream Git history — it has its own README, `CLAUDE.md`,
documentation, package files, and history.

## CC BY 4.0 attribution

Under CC BY 4.0 you are free to share and adapt the material, provided you give
appropriate credit, link to the licence, and indicate if changes were made. This
project:

- **Credits** the source: *CCAO-F Study Guide* by
  [evggzzz](https://github.com/evggzzz/ccao-f-guide).
- **Links** the licence: <https://creativecommons.org/licenses/by/4.0/>.
- **Indicates changes:** the material was restructured into typed data, edited for
  concision, and supplemented with independently authored questions, labs, and
  application code, as described above.

This application's own code and adapted content are likewise released under
**CC BY 4.0**.

## Trademarks and official documentation

"Claude", "Anthropic", and the Claude Certification Program are trademarks of
**Anthropic PBC**. Anthropic retains copyright over its official documentation and
policies. Where this trainer cites Anthropic documentation, each source links to
the original; the documentation itself remains Anthropic's property and is not
redistributed here beyond short factual references necessary for study.

## Provenance transparency in the app

The **Sources** page lists every source with its type, confidence, and last-
verified date, and clearly separates official Anthropic sources from community and
independently-authored material. Every question and Flash Fire item displays a
provenance badge, and only genuinely official items are ever labelled "official".

## No exam-outcome claims

This is an independent study tool. It does not reproduce the live exam, does not
claim any question appeared on the exam, and does not predict or guarantee a
result. The "practice readiness" figure is an estimate defined in
`docs/readiness-model.md`, not an official scaled score.
