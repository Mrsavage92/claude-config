---
name: changelog
description: "Generate Keep-a-Changelog entries from git history and lint conventional commit messages. Use when writing release notes, generating a changelog from a git tag range, or validating commit format before a release."
---

# /changelog

Generate Keep a Changelog entries from git history and validate commit message format.

## Quick Start

```bash
/changelog generate --from-tag v2.0.0          # All changes since a tag
/changelog lint --from-ref main --to-ref dev    # Lint commits between branches
```

## Usage

```
/changelog generate [--from-tag <tag>] [--to-tag <tag>]    Generate changelog entries
/changelog lint [--from-ref <ref>] [--to-ref <ref>]        Lint commit messages
```

## Examples

```
/changelog generate --from-tag v2.0.0
/changelog lint --from-ref main --to-ref dev
/changelog generate --from-tag v2.0.0 --to-tag v2.1.0 --format markdown
```

## Scripts

Scripts are optional — if unavailable, Claude will parse `git log` output directly and format entries manually.

- `engineering/changelog-generator/scripts/generate_changelog.py` — Parse commits, render changelog (`--from-tag`, `--to-tag`, `--from-ref`, `--to-ref`, `--format markdown|json`)
- `engineering/changelog-generator/scripts/commit_linter.py` — Validate conventional commit format (`--from-ref`, `--to-ref`, `--strict`, `--format text|json`)

**Fallback (no script):** Run `git log --oneline --no-merges <from>..<to>` and categorize commits by conventional commit prefix (feat, fix, chore, docs, etc.) into Added / Changed / Fixed / Removed sections.

## Skill Reference

`engineering/changelog-generator/SKILL.md`

## Related Skills

- `/pipeline` — Automate changelog generation as a CI/CD step
- `/sprint-plan` — Use changelog output to summarize sprint deliverables
- `/tech-debt` — Track debt paydown as `chore:` entries in changelogs
