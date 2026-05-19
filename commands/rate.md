# /rate

Cold, unbiased 0-100 rating of any target with a strategic path-to-100.

TRIGGER when: user says "rate {anything} out of 100", "score this", "non-biased review", "tell me where this really sits", "what's the gap to perfect", "be brutally honest about", "is this any good", or invokes `/rate {target}`.

DO NOT TRIGGER when:

- User says "review" → `/review` (exhaustive issue scan + auto-fix)
- User says "critique" → `/critique` (UX feedback)
- User says "audit" → `/audit` / `/full-audit` / `/seo-auditor` (domain-specific deep scan)

## How it differs from /review and /critique

- `/review` = scan every file, find every issue, deduct from 100, auto-fix P0/P1/P2.
- `/critique` = UX-focused feedback with personas, no numeric score.
- `/rate` = strategic gap analysis. Defines 100/100 concretely, scores current state by area, gives ordered path-to-100. **Does not auto-fix.**

## Invocation

```text
/rate {target}
```

Target can be:

- A skill name (`/rate /skill-creator`)
- A file path (`/rate src/components/Hero.tsx`)
- A URL (`/rate https://example.com`) — if fetchable
- A plan or doc (`/rate this PRD`)
- A prompt (`/rate the system prompt I just shared`)
- A repo or folder (`/rate the audit-genius repo`)

If no target is provided, ask once: "What should I rate?"

## Output contract

The skill produces this exact shape:

1. **Headline rating** — `# {target} — cold rating: **{N}/100**` with one-paragraph finding
2. **What 100/100 looks like** — 7-12 observable bullets
3. **Area-by-area** — table with score + specific evidence (file:line links where applicable)
4. **Path to 100** — P0/P1/P2 ladder ordered by cost-to-fix vs value, each with change + AI wall-clock time + file links
5. **Verdict** — one paragraph + direct next-action offer

Shape is enforced by `~/.claude/skills/rate/scripts/check_rating.py`. After every rating, run:

```bash
python ~/.claude/skills/rate/scripts/check_rating.py <path-to-rating.md> --prompt "<the user prompt>"
```

Exit 0 = ship. Exit 1 = revise. The skill must not return output that fails the grader.

See `~/.claude/skills/rate/SKILL.md` for full rules.

## Calibration discipline

- Default mode: FIND-BUGS, never VERIFY-SUCCESS
- Rate lower than instinct (Anthropic agents over-predict success by 38 points)
- 90+ requires external comparator or measured metric, never pure vibes
- AI wall-clock time only (minutes/hours, never "1 week")
- No "after fixes" framing — that primes the next review

## Memory anchors

This command enforces:

- [feedback_never_prime_reviewers](~/.claude/projects/c--Users-Adam--claude-projects/memory/feedback_never_prime_reviewers.md)
- [feedback_no_self_quality_claims](~/.claude/projects/c--Users-Adam--claude-projects/memory/feedback_no_self_quality_claims.md)
- [feedback_ai_time_not_human_time](~/.claude/projects/c--Users-Adam--claude-projects/memory/feedback_ai_time_not_human_time.md)
- [feedback_taste_calibration](~/.claude/projects/c--Users-Adam--claude-projects/memory/feedback_taste_calibration.md)
