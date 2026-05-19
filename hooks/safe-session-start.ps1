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

# 2. Git sync pull (5s timeout)
Run-Safe "git-sync-pull" {
    $repo = "$env:USERPROFILE\.claude"
    if (Test-Path "$repo\.git") {
        Set-Location $repo
        git pull --ff-only origin main 2>&1 | Out-Null
    }
} 5
