# safe-session-stop.ps1
# Resilient session end -- pushes changes but NEVER hangs Claude shutdown.

$LOG = "$env:USERPROFILE\.claude\sync-errors.log"

try {
    $repo = "$env:USERPROFILE\.claude"
    if (Test-Path "$repo\.git") {
        Set-Location $repo
        $status = git status --porcelain 2>&1
        if ($status) {
            git add -A 2>&1 | Out-Null
            git commit -m "auto-sync $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1 | Out-Null
            # Fire-and-forget push with 10s timeout
            $job = Start-Job { Set-Location $using:repo; git push origin main 2>&1 }
            Wait-Job $job -Timeout 10 | Out-Null
            if ($job.State -eq 'Running') {
                Stop-Job $job -ErrorAction SilentlyContinue
                "[$(Get-Date)] git-push TIMEOUT -- will retry next session" >> $LOG
            }
            Remove-Job $job -Force -ErrorAction SilentlyContinue
        }
    }
} catch {
    "[$(Get-Date)] session-stop ERROR: $_" >> $LOG
    # Never throw -- Claude must shut down cleanly
}
