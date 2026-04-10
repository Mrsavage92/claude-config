# build-context-inject.ps1
# UserPromptSubmit hook - injects build state before Claude response.
# Only fires when a BUILD-LOG.md exists in the working directory (active build).
# Keeps output minimal to reduce token consumption.

$ErrorActionPreference = 'SilentlyContinue'
try {

$cwd = $PWD.Path
$buildLog = $null

# Find BUILD-LOG.md — current directory only (no monorepo scan to save time)
if (Test-Path "$cwd\BUILD-LOG.md") {
    $buildLog = "$cwd\BUILD-LOG.md"
}

# Check monorepo apps/ if not found directly
if (-not $buildLog) {
    $appLogs = Get-ChildItem "$cwd\apps\*\BUILD-LOG.md" -ErrorAction SilentlyContinue
    if ($appLogs) {
        $match = $appLogs | Where-Object { $cwd.StartsWith((Split-Path $_.FullName), [System.StringComparison]::OrdinalIgnoreCase) }
        if (-not $match) {
            $match = $appLogs | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        }
        $buildLog = $match.FullName
    }
}

# No active build - stay completely silent
if (-not $buildLog) { exit 0 }

# Emit MINIMAL context — last 20 lines of BUILD-LOG only (was 40 + 40 SCOPE)
Write-Output "=== BUILD CONTEXT ==="
Write-Output "## BUILD-LOG.md (last 20 lines)"
Get-Content $buildLog -Tail 20
Write-Output "=== END BUILD CONTEXT ==="

} catch {
    exit 0
}
