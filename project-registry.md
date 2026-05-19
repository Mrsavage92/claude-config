# Project CLAUDE.md Registry

Single source of truth for project slugs, CLAUDE.md paths, and notes. The `Slugs` column is consumed by `~/.claude/hooks/project-context-inject.ps1` at runtime — never duplicate this list elsewhere. Slugs are comma-separated, case-insensitive, matched as whole words against user prompts.

**Notes-column tags** (used by status filters / colour-coding):
`[PRIMARY]` = primary revenue product · `[INTERNAL]` = own product/service · `[CLIENT]` = external client delivery · `[DORMANT]` = not actively worked on.

**Mac-path mapping:** when the Mac comes back into rotation, this file gets a `Mac CLAUDE.md` column OR paths get rewritten to `$HOME`-relative. Tracked in [feedback_machine_context_mac](memory) when activated.

| Project | Slugs | CLAUDE.md location | Notes |
| --- | --- | --- | --- |
| AuditHQ | audithq, audit-genius, audit genius | `C:/Users/Adam/audit-genius/CLAUDE.md` | `[PRIMARY]` revenue, $0 → $10K/mo target |
| Orbit Digital | orbit digital, orbit, growlocal | `C:/Users/Adam/Documents/Claude/growlocal/CLAUDE.md` | `[INTERNAL]` audit-led managed service, powered by AuditHQ |
| BDR MuleSoft | bdr mulesoft, bdr group | `C:/Users/Adam/Documents/Claude/BDR Group.co.uk/CLAUDE.md` | `[CLIENT]` NetSuite↔SF critical path |
| BDR Integrations Platform | bdr-integrations, bdr integrations | `C:/Users/Adam/.claude-work/projects/bdr-integrations/CLAUDE.md` | `[CLIENT]` MuleSoft monorepo — active delivery |
| Gloss Beauty | gloss beauty, glossbeauty | `C:/Users/Adam/Documents/Claude/glossbeauty.com.au/repo/CLAUDE.md` | `[CLIENT]` Lovable-hosted site |
| Automation Agency | automation agency, automation-agency | `C:/Users/Adam/automation-agency/CLAUDE.md` | `[INTERNAL]` live marketing site |
