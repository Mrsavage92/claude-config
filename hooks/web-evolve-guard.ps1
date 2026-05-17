# web-evolve-guard.ps1
# Mechanical enforcement for /web-evolve principles 2 + 4:
#   1. Edit/Write/MultiEdit on a file under a project with an active web-evolve
#      iteration (loop-state.json present + iteration > 0) is BLOCKED if the
#      iter's current_checks contains any check_id flagged edit_direct:false
#      in references/fix-routing.md SKILL_LOOKUP.
#   2. AskUserQuestion is BLOCKED if ask_user_count >= 1 in the active run's
#      loop-state.json (one user scope-question per run; subsequent prompts
#      are mid-task approval-seeking which is banned).
#
# Failure mode = exit 2 with reason on stderr. Hook exits 0 (silent allow) if
# no active web-evolve run is detected for the target file/cwd.
#
# Activation contract: orchestrator MUST set
#   loop-state.json.iteration > 0 + current_checks: ["X1", "X2"]
# at the start of each iter; the hook only blocks when that state is set.
# Phase A setup edits (before iteration 1) are not blocked.

$ErrorActionPreference = "SilentlyContinue"

$raw = [System.Console]::In.ReadToEnd()
if (-not $raw) { exit 0 }
try { $payload = $raw | ConvertFrom-Json } catch { exit 0 }

$toolName = $payload.tool_name
if (-not $toolName) { exit 0 }

function Find-LoopState {
    param([string]$startPath)
    if (-not $startPath) { return $null }
    $current = $startPath
    for ($i = 0; $i -lt 12; $i++) {
        $candidate = Join-Path $current ".evolution\loop-state.json"
        if (Test-Path -LiteralPath $candidate) {
            return [pscustomobject]@{ Path = $candidate; Root = $current }
        }
        $parent = Split-Path $current -Parent
        if (-not $parent -or $parent -eq $current) { break }
        $current = $parent
    }
    return $null
}

function Read-LoopState {
    param([string]$path)
    try { return Get-Content -LiteralPath $path -Raw | ConvertFrom-Json } catch { return $null }
}

function Get-EditDirectLookup {
    $routingPath = Join-Path $env:USERPROFILE ".claude\skills\web-evolve\references\fix-routing.md"
    if (-not (Test-Path -LiteralPath $routingPath)) { return $null }
    $content = Get-Content -LiteralPath $routingPath -Raw
    # Match the JSON block `SKILL_LOOKUP = { ... }` (greedy until closing brace at line start).
    if ($content -match '(?ms)SKILL_LOOKUP\s*=\s*(\{.+?\n\})') {
        try { return $matches[1] | ConvertFrom-Json } catch { return $null }
    }
    return $null
}

# --- Edit/Write/MultiEdit enforcement ---------------------------------------
if ($toolName -in @("Edit","Write","MultiEdit")) {
    $filePath = $payload.tool_input.file_path
    if (-not $filePath) { exit 0 }
    $dir = Split-Path -LiteralPath $filePath -Parent
    $ls = Find-LoopState $dir
    if (-not $ls) { exit 0 }
    $state = Read-LoopState $ls.Path
    if (-not $state) { exit 0 }
    if ($state.iteration -le 0) { exit 0 }
    if (-not $state.current_checks -or $state.current_checks.Count -eq 0) { exit 0 }

    # Skip non-source files (allow trajectory + state + report writes during iters)
    if ($filePath -match '\.evolution[\\/]' -or $filePath -match 'BUILD-LOG\.md$' -or $filePath -match 'EVOLUTION-LOG\.md$') {
        exit 0
    }

    $lookup = Get-EditDirectLookup
    if (-not $lookup) { exit 0 }

    foreach ($check in $state.current_checks) {
        $entry = $lookup.$check
        if ($null -ne $entry -and $entry.PSObject.Properties.Match('edit_direct').Count -gt 0) {
            if ($entry.edit_direct -eq $false) {
                $fixSkill = $entry.fix_skill
                if (-not $fixSkill) { $fixSkill = "(unknown — check fix-routing.md)" }
                [Console]::Error.WriteLine(
                    "BLOCKED by web-evolve-guard: check '$check' has edit_direct:false in SKILL_LOOKUP. " +
                    "Route through Skill('$fixSkill', ...) instead of $toolName. " +
                    "(Principle 2 — Skills are the only execution path. Direct Edit is for declared lookups.)"
                )
                exit 2
            }
        }
    }
    exit 0
}

# --- AskUserQuestion enforcement --------------------------------------------
if ($toolName -eq "AskUserQuestion") {
    # Walk up from cwd to find active loop-state. The hook payload may not
    # carry cwd reliably across platforms; fall back to current working dir.
    $cwd = $payload.cwd
    if (-not $cwd) { $cwd = (Get-Location).Path }
    $ls = Find-LoopState $cwd
    if (-not $ls) { exit 0 }
    $state = Read-LoopState $ls.Path
    if (-not $state) { exit 0 }
    if ($state.iteration -le 0) { exit 0 }

    $count = 0
    if ($state.PSObject.Properties.Match('ask_user_count').Count -gt 0 -and $state.ask_user_count) {
        $count = [int]$state.ask_user_count
    }
    $count++
    if ($count -gt 1) {
        [Console]::Error.WriteLine(
            "BLOCKED by web-evolve-guard: AskUserQuestion limit is 1 per /web-evolve run (this would be #$count). " +
            "Commit to the initial scope or halt honestly. Mid-run approval-seeking is banned. " +
            "(Principle 4 — One scope commitment per run.)"
        )
        exit 2
    }
    # Persist the increment so subsequent calls see it.
    if ($state.PSObject.Properties.Match('ask_user_count').Count -eq 0) {
        $state | Add-Member -NotePropertyName 'ask_user_count' -NotePropertyValue $count
    } else {
        $state.ask_user_count = $count
    }
    try { $state | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $ls.Path -Encoding utf8 } catch { }
    exit 0
}

exit 0
