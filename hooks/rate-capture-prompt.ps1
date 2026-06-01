# UserPromptSubmit hook — captures the raw user prompt for /rate's anti-priming check.
# Writes the prompt verbatim to ~/.claude/skills/rate/.last-prompt.txt so the Stop-gate
# grader (rate-grade-gate.ps1) can pass it to check_rating.py --prompt without the model
# having to remember. Emits NO stdout (would pollute prompt context). Fail-open always.

$ErrorActionPreference = 'SilentlyContinue'
try {
    $raw = [Console]::In.ReadToEnd()
    if (-not $raw) { exit 0 }
    $data = $raw | ConvertFrom-Json
    $prompt = $data.prompt
    if ($null -eq $prompt) { exit 0 }

    $rateDir = Join-Path $env:USERPROFILE '.claude\skills\rate'
    if (-not (Test-Path $rateDir)) { exit 0 }
    $out = Join-Path $rateDir '.last-prompt.txt'
    [System.IO.File]::WriteAllText($out, [string]$prompt, [System.Text.UTF8Encoding]::new($false))
} catch { }
exit 0
