# start-dev-server.ps1
# PostToolUse hook: starts npm run dev if port 5173 is free and project has a dev script
# Receives Claude Code hook JSON on stdin

$ErrorActionPreference = 'SilentlyContinue'
$raw = [Console]::In.ReadToEnd()
try {
    $j = $raw | ConvertFrom-Json
    $fp = $j.tool_input.file_path
    if (!$fp) { exit 0 }

    # Resolve to absolute path
    if (-not [System.IO.Path]::IsPathRooted($fp)) {
        $fp = Join-Path (Get-Location).Path $fp
    }

    # Get the directory containing the file
    $dir = Split-Path ([System.IO.Path]::GetFullPath($fp)) -Parent
    if (-not $dir) { exit 0 }

    # Walk up directory tree to find package.json with a "dev" script
    $projectRoot = $null
    $d = $dir
    while ($d) {
        $pkgPath = Join-Path $d 'package.json'
        if (Test-Path $pkgPath) {
            $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($pkg -and $pkg.scripts -and $pkg.scripts.dev) {
                $projectRoot = $d
                break
            }
        }
        $parent = Split-Path $d -Parent
        if (-not $parent -or $parent -eq $d) { break }
        $d = $parent
    }

    if (-not $projectRoot) { exit 0 }

    # Check if port 5173 is already in use
    $busy = netstat -an 2>$null | Select-String ':5173\s'
    if ($busy) { exit 0 }

    # Start npm run dev in a new PowerShell window
    Start-Process -FilePath 'powershell.exe' `
        -ArgumentList "-NoProfile -NoExit -Command `"Set-Location -LiteralPath '$projectRoot'; npm run dev`"" `
        -WindowStyle Normal

} catch {
    # Silent fail - never block Claude
}
