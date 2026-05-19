# ref-check.ps1 -- SessionStart hook
# Verifies the load-bearing paths referenced in CLAUDE.md still resolve at session start.
# Non-blocking: prints warnings to stderr, always exits 0.
# Catches drift when files are moved/renamed/deleted between sessions.

$ErrorActionPreference = 'SilentlyContinue'
$h = $env:USERPROFILE

$paths_to_check = @(
    "$h\audit-genius\CLAUDE.md",
    "$h\Documents\Claude\growlocal\CLAUDE.md",
    "$h\Documents\Claude\BDR Group.co.uk\CLAUDE.md",
    "$h\.claude-work\projects\bdr-integrations\CLAUDE.md",
    "$h\Documents\Claude\glossbeauty.com.au\repo\CLAUDE.md",
    "$h\automation-agency\CLAUDE.md",
    "$h\Documents\Claude\outputs\active-revenue-projects.md",
    "$h\.claude\web-system-prompt.md",
    "$h\.claude\rules\README.md",
    "$h\.claude\project-registry.md",
    "$h\.claude\opt-in-features.md",
    "$h\.claude\machine-context-mac.md"
)

$missing = @()
foreach ($p in $paths_to_check) {
    if (-not (Test-Path -LiteralPath $p)) {
        $missing += $p
    }
}

$logDir = "$h\.claude\logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
$logFile = Join-Path $logDir "ref-check.log"
$ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

if ($missing.Count -gt 0) {
    $msg = "[$ts] WARNING: $($missing.Count) referenced path(s) missing:"
    [System.Console]::Error.WriteLine($msg)
    Add-Content -Path $logFile -Value $msg
    foreach ($p in $missing) {
        $line = "  - $p"
        [System.Console]::Error.WriteLine($line)
        Add-Content -Path $logFile -Value $line
    }
} else {
    $msg = "[$ts] ref-check: all $($paths_to_check.Count) CLAUDE.md refs resolve."
    Add-Content -Path $logFile -Value $msg
}

exit 0
