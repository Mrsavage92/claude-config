# project-context-inject.ps1 -- UserPromptSubmit hook
# Detects mention of a known project slug in the user's prompt and prints the path
# to the matching project CLAUDE.md so Claude knows to read it if relevant.
# Single source of truth: slugs and paths come from ~/.claude/project-registry.md.
# Cheap: just emits hints; never reads the full project CLAUDE.md.
# Non-blocking: always exits 0.

$ErrorActionPreference = 'SilentlyContinue'

try {
    $stdin = [Console]::In.ReadToEnd()
    if (-not $stdin) { exit 0 }
    $payload = $stdin | ConvertFrom-Json
    $promptText = [string]$payload.prompt
    if (-not $promptText) { exit 0 }
    $lc = $promptText.ToLowerInvariant()

    $registryPath = "$env:USERPROFILE\.claude\project-registry.md"
    if (-not (Test-Path -LiteralPath $registryPath)) { exit 0 }

    $matched = New-Object System.Collections.Generic.List[string]

    foreach ($line in Get-Content -LiteralPath $registryPath) {
        # Skip non-table lines, header row, and separator row
        if ($line -notmatch '^\|') { continue }
        if ($line -match '^\|\s*Project\b') { continue }
        if ($line -match '^\|\s*-{3,}') { continue }

        # Cells split: leading-empty | Project | Slugs | Path | Notes | trailing-empty
        $cells = $line -split '\|' | ForEach-Object { $_.Trim() }
        if ($cells.Length -lt 4) { continue }

        $slugsCell = $cells[2]
        $pathCell = ($cells[3] -replace '`', '').Trim()
        if (-not $slugsCell -or -not $pathCell) { continue }

        $slugs = $slugsCell -split ',' | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ }

        foreach ($s in $slugs) {
            $pattern = '\b' + [regex]::Escape($s) + '\b'
            if ($lc -match $pattern -and (Test-Path -LiteralPath $pathCell)) {
                if (-not $matched.Contains($pathCell)) {
                    $matched.Add($pathCell) | Out-Null
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
