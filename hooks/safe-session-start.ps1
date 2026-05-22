# safe-session-start.ps1
# Resilient session start -- runs sync tasks but NEVER blocks Claude startup.
# Each task is wrapped in its own try/catch with a hard timeout.

$LOG = "$env:USERPROFILE\.claude\sync-errors.log"

function Run-Safe([string]$Name, [scriptblock]$Action, [int]$TimeoutSec = 8) {
    try {
        $job = Start-Job -ScriptBlock $Action
        $done = Wait-Job $job -Timeout $TimeoutSec
        if (-not $done) {
            Stop-Job $job -ErrorAction SilentlyContinue
            Remove-Job $job -Force -ErrorAction SilentlyContinue
            "[$(Get-Date)] $Name TIMEOUT after ${TimeoutSec}s -- skipped" >> $LOG
        } else {
            Remove-Job $job -ErrorAction SilentlyContinue
            "[$(Get-Date)] $Name OK" >> $LOG
        }
    } catch {
        "[$(Get-Date)] $Name ERROR: $_" >> $LOG
    }
}

# 1. Fetch Notion context (8s timeout)
Run-Safe "notion-context" {
    & "$env:USERPROFILE\.claude\hooks\fetch-notion-context.ps1"
} 8

# 2. Git sync pull -- claude-config (skills/agents/commands) (5s timeout)
Run-Safe "claude-config-pull" {
    $repo = "$env:USERPROFILE\Documents\Git\claude-config"
    if (Test-Path "$repo\.git") {
        Set-Location $repo
        git pull --ff-only origin main 2>&1 | Out-Null
    }
} 5

# 3. Git sync pull -- claude-memory (private memory) + mirror into local cwd-mangled dirs (8s timeout)
Run-Safe "claude-memory-pull" {
    $repo = "$env:USERPROFILE\Documents\Git\claude-memory"
    if (Test-Path "$repo\pull-memory.ps1") {
        & "$repo\pull-memory.ps1" 2>&1 | Out-Null
    }
} 8

# 4. Sync-pending reminder. Printed to stdout so SessionStart hook injects it
#    into Claude's context -- prompts Claude to run /sync-knowledge-base.
$marker = "$env:USERPROFILE\.claude\.sync-pending"
if (Test-Path $marker) {
    try {
        $count = (Get-Content $marker | Measure-Object -Line).Lines
        Write-Output "SYNC PENDING: $count config files changed last session (skills/agents/commands/hooks). Run /sync-knowledge-base to update Notion."
        Remove-Item -LiteralPath $marker -Force -ErrorAction SilentlyContinue
    } catch {
        "[$(Get-Date)] sync-pending-read ERROR: $_" >> $LOG
    }
}
