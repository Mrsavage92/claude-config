# Stop hook — enforces /rate's structural grader on the rating I actually produced.
#
# Reads the last assistant text message from the transcript. If it is a /rate output
# (H1 headline `# ... **NN/100**` AND a "cold rating"/"Path to 100" marker), it runs
# check_rating.py against that exact text, passing the captured prompt for the priming
# check. If the grader fails (exit 1), the Stop is BLOCKED and the failures are fed back
# so the rating is revised before the turn ends. This makes the "mandatory grader" a real
# gate keyed off actual output — not honor-system prose.
#
# Fail-open on EVERY error path (no transcript, no python, grader missing/misconfigured,
# parse error): the gate must never trap the user when something is off. It only ever
# blocks on a genuine grader exit-1 against a genuine rating.

$ErrorActionPreference = 'Stop'

function Allow { exit 0 }

try {
    $raw = [Console]::In.ReadToEnd()
    if (-not $raw) { Allow }
    $data = $raw | ConvertFrom-Json

    $tp = $data.transcript_path
    if (-not $tp -or -not (Test-Path -LiteralPath $tp)) { Allow }

    # Pull the last non-empty assistant text message from the JSONL transcript tail.
    # @() forces array context — a single-line file otherwise returns a scalar string,
    # whose [int] indexing yields characters instead of lines.
    $lines = @(Get-Content -LiteralPath $tp -Tail 250 -ErrorAction Stop)
    $lastText = $null
    for ($i = $lines.Count - 1; $i -ge 0; $i--) {
        $line = $lines[$i]
        if (-not $line) { continue }
        try { $evt = $line | ConvertFrom-Json } catch { continue }
        $msg = $evt.message
        if ($null -eq $msg -or $msg.role -ne 'assistant') { continue }
        $sb = [System.Text.StringBuilder]::new()
        foreach ($block in $msg.content) {
            if ($block.type -eq 'text' -and $block.text) {
                [void]$sb.Append($block.text)
                [void]$sb.Append("`n")
            }
        }
        $t = $sb.ToString()
        if ($t.Trim().Length -gt 0) { $lastText = $t; break }
    }
    if (-not $lastText) { Allow }

    # Only gate genuine /rate output: H1 score headline + a corroborating marker.
    $hasHeadline = $lastText -match '(?m)^#\s+.*\*\*\d{1,3}/100\*\*'
    $hasMarker   = ($lastText -match 'cold rating') -or ($lastText -match '(?m)^##\s+Path to 100')
    if (-not ($hasHeadline -and $hasMarker)) { Allow }

    $rateDir = Join-Path $env:USERPROFILE '.claude\skills\rate'
    $grader  = Join-Path $rateDir 'scripts\check_rating.py'
    if (-not (Test-Path -LiteralPath $grader)) { Allow }   # fail-open: grader gone

    $py = (Get-Command python -ErrorAction SilentlyContinue).Source
    if (-not $py) { $py = (Get-Command python3 -ErrorAction SilentlyContinue).Source }
    if (-not $py) { Allow }                                 # fail-open: no python

    $tmp = Join-Path $env:TEMP ("rate-stop-" + [guid]::NewGuid().ToString('N') + '.md')
    [System.IO.File]::WriteAllText($tmp, $lastText, [System.Text.UTF8Encoding]::new($false))

    $cmdArgs = @($grader, $tmp)
    $promptFile = Join-Path $rateDir '.last-prompt.txt'
    if (Test-Path -LiteralPath $promptFile) {
        $p = Get-Content -LiteralPath $promptFile -Raw -ErrorAction SilentlyContinue
        if ($p) { $cmdArgs += @('--prompt', $p) }
    }

    $out  = & $py @cmdArgs 2>&1
    $code = $LASTEXITCODE
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue

    if ($code -eq 0 -or $code -eq 2) { Allow }   # passed, or grader misconfigured -> fail-open

    # exit 1 -> structural failure. Block the stop and feed the failures back.
    $reason = "BLOCKED by /rate Stop-gate: the rating you just produced FAILED its own " +
              "structural grader (check_rating.py exit 1). Fix the issues below and re-emit " +
              "the corrected rating before ending the turn.`n`n" + ($out -join "`n")
    $payload = @{ decision = 'block'; reason = $reason } | ConvertTo-Json -Compress
    Write-Output $payload
    exit 0
} catch {
    exit 0   # fail-open on any unexpected error: never trap the user
}
