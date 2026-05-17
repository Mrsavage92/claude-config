# Skill Authoring Standard

Rules for writing and maintaining skills in this config. Adapted from alirezarezvani/claude-skills patterns, customised for Adam's setup.

---

## 1. Reference Separation (the #1 rule)

**SKILL.md stays under 10KB / ~500 lines.** Heavy content moves to `references/`.

```
skills/<skill-name>/
  SKILL.md              # Required. Under 10KB. Core logic only.
  references/           # Optional. Deep knowledge, loaded on demand.
  templates/            # Optional. Fillable artifacts for users.
  scripts/              # Optional. Python tools (stdlib-only).
```

### What stays in SKILL.md
- Role/purpose (2-3 sentences)
- When to use / when NOT to use
- Multi-mode workflows (entry points)
- Phase overview (names + one-liners, NOT full instructions)
- Output artifacts table
- Anti-patterns section
- Related skills navigation

### What moves to references/
- Full phase instructions (step-by-step details)
- Checklists (security, quality, compliance)
- Libraries (color palettes, component registries, product patterns)
- Templates and boilerplate code
- Benchmarks, scoring models, example outputs

### How references are loaded
SKILL.md tells the agent WHEN to read each reference:
```markdown
**Phase 3 — Backend Setup**
Read `references/backend-setup.md` before executing. Covers Supabase, Stripe, and email configuration.
```

The agent reads the reference file only when it reaches that phase. This saves ~60% of context tokens on every invocation.

---

## 2. Frontmatter

Only two fields. No metadata bloat.

```yaml
---
name: skill-name
description: "One-line description with trigger keywords. When to use. When NOT to use."
---
```

Do NOT include: `version`, `author`, `license`, `category`, `updated`, `triggers`.

---

## 3. Multi-Mode Workflows

Every skill should support 2-3 entry points:

| Mode | When |
|---|---|
| **Build from scratch** | No prior work exists |
| **Optimise existing** | Work exists, needs improvement |
| **Quick fix** | Single targeted change |

Not every skill needs all three. But if a skill only has "build from scratch" and users regularly invoke it on existing work, add the optimise mode.

---

## 4. Anti-Patterns Section (mandatory)

Every SKILL.md ends with an anti-patterns section. These prevent the most common failures:

```markdown
## Anti-Patterns (do NOT do these)
- **Generic MCP calls during build** — component decisions are locked in DESIGN-BRIEF.md. Do not re-research.
- **Skipping empty states** — every data page needs an empty state with a CTA. Blank = broken.
- **Hardcoded colors** — zero hex/rgb in components. Use CSS variables only.
```

3-6 items. Each is a specific failure mode, not generic advice.

---

## 5. Related Skills Navigation

```markdown
## Related Skills
- Use `/web-scaffold` when starting a new project from scratch
- Use `/web-fix` for targeted bug fixes on existing pages
- Do NOT use this skill for [X] — use [Y] instead
```

Explicit WHEN and WHEN NOT. Prevents the wrong skill being triggered.

---

## 6. Proactive Triggers

4-6 conditions where the skill should flag issues unprompted:

```markdown
## Proactive Triggers
- If you see `.map(` without a stable key → flag immediately
- If any page lacks useSeo() → flag before deploy
- If bundle chunk > 250KB → flag and auto-split
```

---

## 7. Output Artifacts Table

Map common requests to deliverables:

```markdown
## Output Artifacts
| Request | Deliverable | Format |
|---|---|---|
| "Build the landing page" | LandingPage.tsx + all sections | React components |
| "Score the product" | GAP-REPORT.md | Markdown checklist |
```

---

## 8. Python Scripts (if applicable)

- Standard library only (no pip dependencies, no LLM API calls)
- CLI-first with `--help` flag
- JSON output with `--json` flag
- Exit codes: 0 = success, 1 = warnings, 2 = critical
- Include `if __name__ == "__main__":`

---

## 9. Quality Confidence Tags

Tag findings with confidence level:
- Verified — confirmed by reading code/running tool
- Medium — inferred from patterns, likely correct
- Assumed — no direct evidence, flagged for human review

---

## 10. Maintenance Rule

When updating a skill:
1. If adding content > 10KB: move to `references/`, add a read-pointer in SKILL.md
2. If adding a non-negotiable rule: update the parent orchestrator (e.g., `premium-website.md`) in the same session
3. Push to GitHub in the same commit
