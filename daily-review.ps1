# daily-review.ps1
# Launches Claude Code with the daily config review prompt
# Schedule via Windows Task Scheduler to run at 10am daily

$prompt = @"
## Daily Config Review

Run this review in two phases:

### Phase 1 - Sync Check
1. Compare local ~/.claude/agents/ against ~/Documents/Git/claude-config/agents/ - flag any files that differ or are missing
2. Compare local ~/.claude/commands/ against repo commands/ - same check
3. Check ~/.claude/skills/ git status - any untracked or modified files
4. If drift found: copy local to repo, commit, and push to GitHub
5. Report: In sync or list what was out of sync and what was fixed

### Phase 2 - AI World Improvements Review
1. Web search for: Claude Code new features 2026, Claude agents best practices, AI coding assistant updates
2. Web search for: new AI productivity tools relevant to Claude Code agents and skills
3. Compare findings against current setup (27 agents, 32 commands, 65 skill suites)
4. Identify top 3 concrete improvements and implement them
5. Push changes to GitHub and update Notion documentation
6. Report: what was reviewed, what was found, what was implemented
"@

# Launch Claude Code with the prompt (non-interactive)
$claudeExe = "$env:USERPROFILE\.vscode\extensions\anthropic.claude-code-2.1.81-win32-x64\resources\native-binary\claude.exe"
& $claudeExe --print $prompt
