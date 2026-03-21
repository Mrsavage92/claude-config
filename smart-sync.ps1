# smart-sync.ps1 — Intelligent Claude Code config sync (Windows)
# Prevents machines from clobbering each other's changes via hash-based diffing
# Usage: .\smart-sync.ps1 -Mode start|stop

param([string]$Mode = "stop")

$ClaudeDir  = "$env:USERPROFILE\.claude"
$RepoDir    = "$env:USERPROFILE\Documents\Git\claude-config"
$SkillsDir  = "$ClaudeDir\skills"
$LOG        = "$ClaudeDir\sync-errors.log"
$MACHINE    = $env:COMPUTERNAME
$MSG        = "auto-sync: $MACHINE $(Get-Date -Format yyyy-MM-dd)"

function Get-Hash8([string]$Path) {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($Path)
        $md5   = [System.Security.Cryptography.MD5]::Create()
        return [BitConverter]::ToString($md5.ComputeHash($bytes)).Replace("-","").ToLower().Substring(0,8)
    } catch { return $null }
}

function Get-ManifestHashes {
    $p = "$RepoDir\manifest.json"
    $agents = @{}; $commands = @{}
    if (Test-Path $p) {
        $m = Get-Content $p -Raw | ConvertFrom-Json
        $m.agents.PSObject.Properties   | ForEach-Object { $agents[$_.Name]   = $_.Value }
        $m.commands.PSObject.Properties | ForEach-Object { $commands[$_.Name] = $_.Value }
    }
    return $agents, $commands
}

# ── SESSION START: pull repo → copy to local ─────────────────────────────────
if ($Mode -eq "start") {
    try {
        Set-Location $RepoDir
        git fetch origin main 2>>$LOG
        git pull origin main --rebase 2>>$LOG
        Copy-Item "$RepoDir\commands\*.md" "$ClaudeDir\commands\" -Force
        Copy-Item "$RepoDir\agents\*.md"   "$ClaudeDir\agents\"   -Force
        if (Test-Path "$RepoDir\global-context.md") {
            Copy-Item "$RepoDir\global-context.md" "$ClaudeDir\CLAUDE.md" -Force
        }
    } catch { "[$((Get-Date).ToString())][start][config] $_" >> $LOG }

    try {
        Set-Location $SkillsDir
        git fetch origin master 2>>$LOG
        git pull origin master --rebase 2>>$LOG
    } catch { "[$((Get-Date).ToString())][start][skills] $_" >> $LOG }

    exit 0
}

# ── SESSION STOP: smart push — only changed local files go to repo ────────────
try {
    Set-Location $RepoDir
    git fetch origin main 2>>$LOG
    git pull origin main --rebase 2>>$LOG

    $agentHashes, $commandHashes = Get-ManifestHashes

    # Only copy local files whose hash differs from manifest (i.e. modified this session)
    foreach ($file in (Get-ChildItem "$ClaudeDir\agents\*.md" -ErrorAction SilentlyContinue)) {
        if ((Get-Hash8 $file.FullName) -ne $agentHashes[$file.Name]) {
            Copy-Item $file.FullName "$RepoDir\agents\$($file.Name)" -Force
        }
    }
    foreach ($file in (Get-ChildItem "$ClaudeDir\commands\*.md" -ErrorAction SilentlyContinue)) {
        if ((Get-Hash8 $file.FullName) -ne $commandHashes[$file.Name]) {
            Copy-Item $file.FullName "$RepoDir\commands\$($file.Name)" -Force
        }
    }
    if (Test-Path "$ClaudeDir\CLAUDE.md") {
        Copy-Item "$ClaudeDir\CLAUDE.md" "$RepoDir\global-context.md" -Force
    }

    git add agents/ commands/ global-context.md 2>>$LOG
    git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) { git commit -m $MSG 2>>$LOG }

    git fetch origin main 2>>$LOG
    git rebase origin/main 2>>$LOG
    git push origin main 2>>$LOG

} catch { "[$((Get-Date).ToString())][stop][config] $_" >> $LOG }

# Skills: always safe (skills only change intentionally on one machine)
try {
    Set-Location $SkillsDir
    git fetch origin master 2>>$LOG
    git rebase origin/master 2>>$LOG
    git add -A
    git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) { git commit -m $MSG 2>>$LOG }
    git push origin master 2>>$LOG
} catch { "[$((Get-Date).ToString())][stop][skills] $_" >> $LOG }
