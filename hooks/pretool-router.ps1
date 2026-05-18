# pretool-router.ps1
#
# Single PreToolUse entry point that routes to the appropriate sub-hooks
# based on tool name. Replaces 4 separate hook entries in settings.json with
# 1 router + conditional dispatch.
#
# Old layout (4 PreToolUse hook entries, each spawning its own PowerShell):
#   gateguard.ps1            (Read|Write|MultiEdit)
#   config-protection.ps1    (Write|Edit|MultiEdit)
#   tokens-lock-enforce.ps1  (Write|Edit|MultiEdit)
#   web-evolve-guard.ps1     (Write|Edit|MultiEdit|AskUserQuestion)
#
# New layout: one router that reads tool name once, runs only the relevant
# sub-hooks, and exits 2 with the first blocker's stderr if any sub-hook blocks.

$ErrorActionPreference = 'SilentlyContinue'

$stdin = [Console]::In.ReadToEnd()
if (-not $stdin) { exit 0 }

try { $payload = $stdin | ConvertFrom-Json } catch { exit 0 }

$toolName = $payload.tool_name
if (-not $toolName) { exit 0 }

# Decide which sub-hooks to run based on the tool name. Matches the original
# matcher patterns from settings.json verbatim so behaviour is unchanged.
$scripts = New-Object System.Collections.Generic.List[string]
if ($toolName -in @('Read', 'Write', 'MultiEdit')) {
    $scripts.Add('gateguard.ps1') | Out-Null
}
if ($toolName -in @('Write', 'Edit', 'MultiEdit')) {
    $scripts.Add('config-protection.ps1') | Out-Null
    $scripts.Add('tokens-lock-enforce.ps1') | Out-Null
}
if ($toolName -in @('Write', 'Edit', 'MultiEdit', 'AskUserQuestion')) {
    $scripts.Add('web-evolve-guard.ps1') | Out-Null
}

if ($scripts.Count -eq 0) { exit 0 }

# Stash stdin to a temp file so we can replay it into each sub-hook.
$payloadFile = New-TemporaryFile
Set-Content -LiteralPath $payloadFile.FullName -Value $stdin -NoNewline -Encoding utf8

$blocked = $false
$blockedMsg = $null

foreach ($name in $scripts) {
    $path = Join-Path $PSScriptRoot $name
    if (-not (Test-Path -LiteralPath $path)) { continue }

    $stderrFile = New-TemporaryFile
    Get-Content -LiteralPath $payloadFile.FullName -Raw |
        & powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $path 2>$stderrFile.FullName

    $code = $LASTEXITCODE
    if ($code -eq 2) {
        $blocked = $true
        $blockedMsg = Get-Content -LiteralPath $stderrFile.FullName -Raw
        Remove-Item -LiteralPath $stderrFile.FullName -ErrorAction SilentlyContinue
        break
    }
    Remove-Item -LiteralPath $stderrFile.FullName -ErrorAction SilentlyContinue
}

Remove-Item -LiteralPath $payloadFile.FullName -ErrorAction SilentlyContinue

if ($blocked) {
    if ($blockedMsg) { [Console]::Error.WriteLine($blockedMsg) }
    exit 2
}

exit 0
