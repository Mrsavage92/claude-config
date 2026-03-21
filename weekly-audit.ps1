# weekly-audit.ps1
# Runs a full plugin audit across all agents and commands
# Schedule via Windows Task Scheduler to run Monday at 9:45am

$prompt = @"
## Weekly Plugin Audit — $(Get-Date -Format 'yyyy-MM-dd')

Run a comprehensive quality audit across the entire Claude Code setup.

### Phase 1 — Inventory Check
1. List all files in ~/.claude/agents/ and ~/.claude/commands/
2. Count totals and compare against manifest.json in ~/Documents/Git/claude-config/
3. Flag any files present locally but missing from repo (or vice versa)

### Phase 2 — Agent Quality Audit
For each agent in ~/.claude/agents/:
- Check frontmatter is valid YAML (name, description, model, tools all present)
- Check description includes explicit "NOT for X (use Y)" routing disambiguation
- Check skills listed in frontmatter actually exist in ~/.claude/skills/
- Flag any description under 50 characters (too vague for auto-routing)
- Flag any agent with NO related agents listed

### Phase 3 — Command Quality Audit
For each command in ~/.claude/commands/:
- Check frontmatter has name and description fields
- Check description is specific enough to be useful (not generic)
- Flag any command file over 200 lines (likely bloated)

### Phase 4 — Routing Overlap Check
- Identify any two agents whose descriptions could match the same user request
- Suggest disambiguation language for any overlaps found

### Phase 5 — Dead Skill References
- Cross-reference all skills: listed in agent frontmatter against actual ~/.claude/skills/ directories
- List any broken references (skill listed but directory doesn't exist)

### Output
Produce a structured report:
- **Health Score**: X/100
- **Critical Issues** (fix now): list
- **Warnings** (fix this week): list
- **Passed checks**: count
- **Recommended actions**: prioritised list

If all checks pass, say so clearly — do not invent problems.
Fix any critical issues found automatically, then push to GitHub.
"@

# Launch Claude Code with the prompt (non-interactive)
claude --print $prompt
