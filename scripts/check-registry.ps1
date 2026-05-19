# check-registry.ps1 -- validates project-registry.md
# Asserts every CLAUDE.md path in the registry resolves to a real file.
# Surfaces tag conformance against the documented tag set.
# Exit 0 = all paths exist + all tags valid. Exit 1 = at least one failure.
# Designed to be runnable in CI or as a one-shot from the repo root.

$ErrorActionPreference = 'Stop'

$registryPath = Join-Path $PSScriptRoot '..\project-registry.md'
if (-not (Test-Path -LiteralPath $registryPath)) {
    Write-Host "FAIL: project-registry.md not found at $registryPath" -ForegroundColor Red
    exit 1
}

$validTags = @('[PRIMARY]', '[INTERNAL]', '[CLIENT]', '[DORMANT]')
$failures = New-Object System.Collections.Generic.List[string]
$rowsChecked = 0

foreach ($line in Get-Content -LiteralPath $registryPath) {
    if ($line -notmatch '^\|') { continue }
    if ($line -match '^\|\s*Project\b') { continue }
    if ($line -match '^\|\s*-{3,}') { continue }

    $cells = $line -split '\|' | ForEach-Object { $_.Trim() }
    if ($cells.Count -lt 6) { continue }

    $project = $cells[1]
    $pathCell = $cells[3] -replace '^`|`$',''
    $notesCell = $cells[4]
    $rowsChecked++

    if (-not (Test-Path -LiteralPath $pathCell)) {
        $failures.Add("$project -> path missing: $pathCell")
    }

    $tagsFound = [regex]::Matches($notesCell, '`\[[A-Z]+\]`') | ForEach-Object {
        $_.Value -replace '`',''
    }
    if ($tagsFound.Count -eq 0) {
        $failures.Add("$project -> no status tag in Notes (expected one of: $($validTags -join ', '))")
    } else {
        foreach ($t in $tagsFound) {
            if ($t -notin $validTags) {
                $failures.Add("$project -> unknown tag '$t' (valid: $($validTags -join ', '))")
            }
        }
    }
}

Write-Host "Checked $rowsChecked registry rows."
if ($failures.Count -eq 0) {
    Write-Host "PASS: all paths resolve, all tags valid." -ForegroundColor Green
    exit 0
} else {
    Write-Host "FAIL: $($failures.Count) issue(s)" -ForegroundColor Red
    foreach ($f in $failures) { Write-Host "  - $f" }
    exit 1
}
