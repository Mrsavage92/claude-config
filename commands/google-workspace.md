---
name: google-workspace
description: "Run Google Workspace CLI diagnostics, security audits, and automation recipes via the gws tool. Use when auditing workspace security, automating Gmail/Drive/Sheets, or managing Google Workspace configuration."
---

# /google-workspace

Google Workspace CLI administration via the `gws` CLI. Run setup diagnostics, security audits, browse and execute recipes, and analyze command output.

## Quick Start

```bash
/google-workspace setup
/google-workspace audit --services gmail,drive
/google-workspace recipe list --persona pm
```

## Usage

```
/google-workspace setup [--json]
/google-workspace audit [--services gmail,drive,calendar] [--json]
/google-workspace recipe list [--persona <role>] [--json]
/google-workspace recipe search <keyword> [--json]
/google-workspace recipe run <name> [--dry-run]
/google-workspace recipe describe <name>
/google-workspace analyze [--filter <field=value>] [--group-by <field>] [--stats <field>] [--format table|csv|json]
```

## Examples

```
/google-workspace setup
/google-workspace audit --services gmail,drive --json
/google-workspace recipe list --persona pm
/google-workspace recipe search "email"
/google-workspace recipe run standup-report --dry-run
/google-workspace recipe describe morning-briefing
/google-workspace analyze --filter "mimeType=pdf" --select "name,size" --format table
```

## Scripts

Scripts are optional — if unavailable, Claude will guide you through equivalent `gws` CLI commands manually.

- `engineering-team/google-workspace-cli/scripts/gws_doctor.py` — Pre-flight diagnostics (optional)
- `engineering-team/google-workspace-cli/scripts/auth_setup_guide.py` — Auth setup guide (optional)
- `engineering-team/google-workspace-cli/scripts/gws_recipe_runner.py` — Recipe catalog & runner (optional)
- `engineering-team/google-workspace-cli/scripts/workspace_audit.py` — Security audit (optional)
- `engineering-team/google-workspace-cli/scripts/output_analyzer.py` — JSON/NDJSON analyzer (optional)

## Subcommands

### setup
Run pre-flight diagnostics and auth validation.
```bash
python3 engineering-team/google-workspace-cli/scripts/gws_doctor.py [--json]
python3 engineering-team/google-workspace-cli/scripts/auth_setup_guide.py --validate [--json]
```

### audit
Run security and configuration audit.
```bash
python3 engineering-team/google-workspace-cli/scripts/workspace_audit.py [--services gmail,drive,calendar] [--json]
```

### recipe
Browse, search, and execute the built-in gws recipes.
```bash
python3 engineering-team/google-workspace-cli/scripts/gws_recipe_runner.py --list [--persona <role>] [--json]
python3 engineering-team/google-workspace-cli/scripts/gws_recipe_runner.py --search <keyword> [--json]
python3 engineering-team/google-workspace-cli/scripts/gws_recipe_runner.py --describe <name>
python3 engineering-team/google-workspace-cli/scripts/gws_recipe_runner.py --run <name> [--dry-run]
```

### analyze
Parse, filter, and aggregate JSON output from any gws command.
```bash
gws <command> --json | python3 engineering-team/google-workspace-cli/scripts/output_analyzer.py [options]
python3 engineering-team/google-workspace-cli/scripts/output_analyzer.py --demo --format table
```

## Skill Reference

`engineering-team/google-workspace-cli/SKILL.md`

## Related Skills

- `/pipeline` — Automate Workspace audit steps in a CI/CD workflow
- `/project-health` — Combine Workspace activity data with project health metrics
- `/changelog` — Log Workspace configuration changes in a structured changelog
