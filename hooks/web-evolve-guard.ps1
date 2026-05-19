# web-evolve-guard.ps1
# Mechanical enforcement for /web-evolve Cardinal Rules 2, 4, 7.
#
#   Cardinal Rule 2 (capability-stripped producer):
#     Edit/Write/MultiEdit on a file under .evolution/* during an active iter
#     (loop-state.json present + iteration > 0) is BLOCKED. The orchestrator
#     must route .evolution/* writes through bash scripts in references/
#     (append-retro.sh, iter-step.sh, enumerate-routes.sh, etc.) which use
#     bash redirects and do NOT trigger the Claude PreToolUse Edit hook.
#
#   Cardinal Rule 2 (extended): Edit/Write on a source file under an active
#     iter is BLOCKED if the iter's current_checks contains any check_id flagged
#     edit_direct:false in references/fix-routing.md SKILL_LOOKUP.
#
#   Cardinal Rule 7 (session-scoped ask counter):
#     AskUserQuestion is BLOCKED if EITHER the project's loop-state.ask_user_count
#     OR the session-scoped counter at ~/.claude/state/web-evolve-asks-<session>.json
#     already shows >= 1 ask. Limit is 1 per run AND 1 per session.
#
# Failure mode = exit 2 with reason on stderr. Hook exits 0 (silent allow) if
# no active web-evolve run is detected for the target file/cwd.

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
    if ($content -match '(?ms)SKILL_LOOKUP\s*=\s*(\{.+?\n\})') {
        try { return $matches[1] | ConvertFrom-Json } catch { return $null }
    }
    return $null
}

function Get-SessionId {
    param($payload)
    if ($payload.session_id) { return $payload.session_id }
    if ($env:CLAUDE_SESSION_ID) { return $env:CLAUDE_SESSION_ID }
    return "unknown"
}

# --- Edit/Write/MultiEdit enforcement ---------------------------------------
if ($toolName -in @("Edit","Write","MultiEdit")) {
    $filePath = $payload.tool_input.file_path
    if (-not $filePath) { exit 0 }
    # Use [System.IO.Path] directly -- Split-Path with -LiteralPath + -Parent has
    # an ambiguous parameter set in some PowerShell versions and silently fails
    # with $ErrorActionPreference=SilentlyContinue, leaving $dir null and the
    # hook erroneously returning exit 0 (allow). This was the hidden bug that
    # caused Cardinal Rule 2 enforcement to never fire in Runs #1-#5.
    $dir = [System.IO.Path]::GetDirectoryName($filePath)
    if (-not $dir) { exit 0 }
    $ls = Find-LoopState $dir
    if (-not $ls) { exit 0 }
    $state = Read-LoopState $ls.Path
    if (-not $state) { exit 0 }

    # CARDINAL RULE 2: BLOCK Edit/Write to .evolution/* whenever a web-evolve run is
    # active (loop-state.json present), regardless of iteration count. The Phase 0-A
    # design also separates capabilities: baseline artifacts must come from scripts
    # (enumerate-routes.sh, parse-handoff.sh) or designated sub-agents (TasteFetcher
    # writes taste-rules.md). All legit writers use bash redirects (`python3 ... > tmp
    # && mv tmp file`) which do NOT trigger this PreToolUse hook. Orchestrator
    # Edit/Write to .evolution/* is the anti-pattern this rule prevents.
    #
    # NARROW WHITELIST for tool-based writes:
    #   - taste-rules.md (TasteFetcher via Skill('taste-skill'))
    #   - .hashes.json (TasteFetcher appends its own hash; other writers use bash redirects)
    # All other .evolution/* writes via Edit/Write/MultiEdit are blocked.
    # Cardinal Rule 4 (hash verification on every read) catches any attempt to spoof
    # .hashes.json since downstream agents re-hash and compare.
    if ($filePath -match '\.evolution[\\/]') {
        $leaf = [System.IO.Path]::GetFileName($filePath)
        $allowed = @('taste-rules.md', '.hashes.json')
        if ($allowed -notcontains $leaf) {
            [Console]::Error.WriteLine(
                "BLOCKED by web-evolve-guard: $toolName on $filePath is forbidden. " +
                ".evolution/* writes must go through bash scripts in references/ (append-retro.sh, iter-step.sh, enumerate-routes.sh, parse-handoff.sh) which use bash redirects and do not trigger this hook. " +
                "Write-tool whitelist (TasteFetcher only): taste-rules.md, .hashes.json. " +
                "Orchestrator-authored .evolution/* files are the contamination pattern this rule exists to prevent. " +
                "(Cardinal Rule 2 - Capability-stripped producer.)"
            )
            exit 2
        }
    }

    # Below this point: iter-aware checks (fix-routing edit_direct, taste-rules precondition)
    if ($state.iteration -le 0) { exit 0 }

    # Allow root-level log files (BUILD-LOG.md, EVOLUTION-LOG.md) -these are
    # orchestrator-narrative logs, not audit-agent inputs.
    if ($filePath -match 'BUILD-LOG\.md$' -or $filePath -match 'EVOLUTION-LOG\.md$') {
        exit 0
    }

    if (-not $state.current_checks -or $state.current_checks.Count -eq 0) { exit 0 }

    # PRINCIPLE 0 GATE: taste-rules.md must exist before any source-file edit during an iter.
    $tasteCache = Join-Path $ls.Root ".evolution\taste-rules.md"
    if (-not (Test-Path -LiteralPath $tasteCache)) {
        [Console]::Error.WriteLine(
            "BLOCKED by web-evolve-guard: .evolution/taste-rules.md is missing. " +
            "Phase 0 must fire Skill('taste-skill') to cache bias-correction rules BEFORE any iter starts. " +
            "(Principle 0 -Load taste-skill before any other phase.)"
        )
        exit 2
    }

    $lookup = Get-EditDirectLookup
    if (-not $lookup) { exit 0 }

    foreach ($check in $state.current_checks) {
        $entry = $lookup.$check
        if ($null -ne $entry -and $entry.PSObject.Properties.Match('edit_direct').Count -gt 0) {
            if ($entry.edit_direct -eq $false) {
                $fixSkill = $entry.fix_skill
                if (-not $fixSkill) { $fixSkill = "(unknown - check fix-routing.md)" }
                [Console]::Error.WriteLine(
                    "BLOCKED by web-evolve-guard: check '$check' has edit_direct:false in SKILL_LOOKUP. " +
                    "Route through Skill('$fixSkill', ...) instead of $toolName. " +
                    "(Cardinal Rule 2 - Skills are the only execution path. Direct Edit is for declared lookups.)"
                )
                exit 2
            }
        }
    }
    exit 0
}

# --- AskUserQuestion enforcement (Cardinal Rule 7: session AND run scoped) ---
if ($toolName -eq "AskUserQuestion") {
    $cwd = $payload.cwd
    if (-not $cwd) { $cwd = (Get-Location).Path }
    $ls = Find-LoopState $cwd
    if (-not $ls) { exit 0 }
    $state = Read-LoopState $ls.Path
    if (-not $state) { exit 0 }

    # Run-scoped counter (from loop-state.json)
    $runCount = 0
    if ($state.PSObject.Properties.Match('ask_user_count').Count -gt 0 -and $state.ask_user_count) {
        $runCount = [int]$state.ask_user_count
    }

    # Session-scoped counter (from ~/.claude/state/web-evolve-asks-<session>.json)
    $sessionId = Get-SessionId $payload
    $stateDir = Join-Path $env:USERPROFILE ".claude\state"
    if (-not (Test-Path -LiteralPath $stateDir)) { New-Item -ItemType Directory -Path $stateDir | Out-Null }
    $askFile = Join-Path $stateDir ("web-evolve-asks-" + $sessionId + ".json")
    $sessionCount = 0
    if (Test-Path -LiteralPath $askFile) {
        try {
            $sj = Get-Content -LiteralPath $askFile -Raw | ConvertFrom-Json
            if ($sj.PSObject.Properties.Match('count').Count -gt 0) { $sessionCount = [int]$sj.count }
        } catch { $sessionCount = 0 }
    }

    # This call would make BOTH counters at least 1. Block if either was already 1+.
    if ($runCount -ge 1 -or $sessionCount -ge 1) {
        [Console]::Error.WriteLine(
            "BLOCKED by web-evolve-guard: AskUserQuestion limit is 1 per /web-evolve run AND 1 per session. " +
            "Current: run_count=$runCount session_count=$sessionCount (this would be #$([math]::Max($runCount, $sessionCount) + 1)). " +
            "Commit to the initial scope or halt honestly. " +
            "(Cardinal Rule 7 - Session-scoped ask counter.)"
        )
        exit 2
    }

    # Persist increments to BOTH counters
    $runCount++
    $sessionCount++

    if ($state.PSObject.Properties.Match('ask_user_count').Count -eq 0) {
        $state | Add-Member -NotePropertyName 'ask_user_count' -NotePropertyValue $runCount
    } else {
        $state.ask_user_count = $runCount
    }
    try { $state | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $ls.Path -Encoding utf8 } catch { }

    try {
        $sessionData = [pscustomobject]@{
            count = $sessionCount
            session_id = $sessionId
            last_updated = (Get-Date).ToString("o")
        }
        $sessionData | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $askFile -Encoding utf8
    } catch { }

    exit 0
}

exit 0
