# daily-news-brief.ps1
# Launches Claude Code with a daily AI news brief prompt
# Schedule via Windows Task Scheduler to run at 9:30am daily

$prompt = @"
## Daily AI News Brief

Search the web and produce a concise daily brief covering:

### 1. Claude & Anthropic Updates
- Web search: "Claude Anthropic news $(Get-Date -Format 'MMMM yyyy')"
- New model releases, Claude Code features, API changes, pricing updates

### 2. AI Coding & Productivity Tools
- Web search: "AI coding assistant updates $(Get-Date -Format 'MMMM yyyy')"
- New features in Cursor, GitHub Copilot, Windsurf, and Claude Code competitors
- Any new MCP servers or agent patterns worth adopting

### 3. SaaS & Business AI
- Web search: "AI SaaS productivity tools $(Get-Date -Format 'MMMM yyyy')"
- New tools relevant to: content creation, SEO/GEO, marketing ops, customer success, financial analysis

### 4. Prompt Engineering & Agent Design
- Web search: "prompt engineering best practices agents 2026"
- New techniques for agent descriptions, skill design, multi-agent orchestration

### Output Format
Produce a brief under 400 words total:
- **Headline** (1 line): the single most important thing today
- **Claude/AI Tools** (3 bullets max): only genuinely new or changed things
- **Business AI** (2 bullets max): tools or techniques relevant to the current agent setup
- **Action item** (1 line): one concrete thing to implement or investigate today

If nothing significant is new, say so — do not pad with filler.
"@

# Launch Claude Code and log output
$claudeExe = "$env:USERPROFILE\.vscode\extensions\anthropic.claude-code-2.1.81-win32-x64\resources\native-binary\claude.exe"
$logDir    = "$env:USERPROFILE\.claude\logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$logFile   = "$logDir\$(Get-Date -Format 'yyyy-MM-dd')-news-brief.md"

$output = & $claudeExe --print $prompt
$output | Out-File -FilePath $logFile -Encoding UTF8
$output
