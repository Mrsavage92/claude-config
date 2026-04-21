# GateGuard — fact-force hook.
#
# Blocks the first Write or MultiEdit to an EXISTING file in a session unless
# the file has been Read first in the same session. Creating new files is
# always allowed. Read calls are recorded.
#
# Wired from settings.json as a PreToolUse hook with matcher "Read|Write|MultiEdit".
#
# Escape hatch: set env CLAUDE_GATEGUARD_OFF=1 to disable.

$ErrorActionPreference = 'SilentlyContinue'

if ($env:CLAUDE_GATEGUARD_OFF -eq '1') { exit 0 }

$raw = [Console]::In.ReadToEnd()
if (-not $raw) { exit 0 }

try { $data = $raw | ConvertFrom-Json } catch { exit 0 }

$sessionId = $data.session_id
$toolName  = $data.tool_name
$filePath  = $data.tool_input.file_path

if (-not $sessionId -or -not $toolName -or -not $filePath) { exit 0 }

$stateDir = Join-Path $env:USERPROFILE '.claude\hooks\state'
if (-not (Test-Path $stateDir)) {
    New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
}
$stateFile = Join-Path $stateDir "gateguard-$sessionId.txt"

try { $normPath = [System.IO.Path]::GetFullPath($filePath) } catch { $normPath = $filePath }

# Record reads (so later writes to the same path pass the gate).
if ($toolName -eq 'Read') {
    Add-Content -LiteralPath $stateFile -Value $normPath -ErrorAction SilentlyContinue
    exit 0
}

# Gate Write / MultiEdit on existing files only. Edit is already covered by
# Claude Code's native "must Read first" rule, so we don't double-gate it.
if ($toolName -eq 'Write' -or $toolName -eq 'MultiEdit') {
    if (-not (Test-Path -LiteralPath $normPath)) { exit 0 }  # creating new file

    $seen = @()
    if (Test-Path $stateFile) { $seen = Get-Content $stateFile -ErrorAction SilentlyContinue }
    if ($seen -contains $normPath) { exit 0 }

    $msg = @"
GateGuard blocked: $toolName on an existing file you haven't Read in this session.
File: $normPath

Investigate before editing:
  1. Read the file (Claude Code Read tool)
  2. Grep for importers / callers so you understand blast radius
  3. Confirm the contract you are about to change

Then retry the write.

Override (use sparingly): set env CLAUDE_GATEGUARD_OFF=1
"@
    [Console]::Error.WriteLine($msg)
    exit 2
}

exit 0
