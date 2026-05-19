# project-context-inject.ps1 -- UserPromptSubmit hook
# Detects mention of a known project slug in the user's prompt and prints
# the path to the matching project CLAUDE.md so Claude knows to read it.
# Cheap: just emits hints; never reads the full file.
# Non-blocking: always exits 0.

$ErrorActionPreference = 'SilentlyContinue'

try {
    $stdin = [Console]::In.ReadToEnd()
    if (-not $stdin) { exit 0 }
    $payload = $stdin | ConvertFrom-Json
    $promptText = [string]$payload.prompt
    if (-not $promptText) { exit 0 }
    $lc = $promptText.ToLowerInvariant()

    $h = $env:USERPROFILE
    $projects = @(
        @{ slugs = @('audithq','audit-genius','audit genius'); path = "$h\audit-genius\CLAUDE.md" },
        @{ slugs = @('orbit digital','orbit','growlocal'); path = "$h\Documents\Claude\growlocal\CLAUDE.md" },
        @{ slugs = @('bdr mulesoft','bdr group'); path = "$h\Documents\Claude\BDR Group.co.uk\CLAUDE.md" },
        @{ slugs = @('bdr-integrations','bdr integrations'); path = "$h\.claude-work\projects\bdr-integrations\CLAUDE.md" },
        @{ slugs = @('gloss beauty','glossbeauty'); path = "$h\Documents\Claude\glossbeauty.com.au\repo\CLAUDE.md" },
        @{ slugs = @('automation agency','automation-agency'); path = "$h\automation-agency\CLAUDE.md" }
    )

    $matched = New-Object System.Collections.Generic.List[string]
    foreach ($p in $projects) {
        foreach ($s in $p.slugs) {
            $pattern = '\b' + [regex]::Escape($s) + '\b'
            if ($lc -match $pattern -and (Test-Path -LiteralPath $p.path)) {
                if (-not $matched.Contains($p.path)) {
                    $matched.Add($p.path) | Out-Null
                }
                break
            }
        }
    }

    if ($matched.Count -gt 0) {
        Write-Host "[project-context] Project slug detected. Read for context if relevant:"
        foreach ($p in $matched) { Write-Host "  - $p" }
    }
} catch {
    # silent
}

exit 0
