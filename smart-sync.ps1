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

    # Run validation before sync — log issues but don't block
    try {
        $validOut = python3 "$ClaudeDir\scripts\validate-skills.py" 2>&1
        if ($LASTEXITCODE -ne 0) {
            "[$((Get-Date).ToString())][stop][validate] ISSUES: $validOut" >> $LOG
        }
    } catch { "[$((Get-Date).ToString())][stop][validate] $_" >> $LOG }

    # Regenerate manifest.json — excludes shared, .git, .gitignore + auto-updates README counts
    try {
        python3 -c "
import os,json,hashlib,re
from datetime import date
home=os.environ['USERPROFILE']
repo=os.path.join(home,'Documents','Git','claude-config')
cmds=os.path.join(home,'.claude','commands')
agts=os.path.join(home,'.claude','agents')
skls=os.path.join(home,'.claude','skills')
EXCLUDE={'shared','.git','.gitignore'}
def md5(p):
    with open(p,'rb') as f: return hashlib.md5(f.read()).hexdigest()
ch={f:md5(os.path.join(cmds,f)) for f in os.listdir(cmds) if f.endswith('.md')}
ah={f:md5(os.path.join(agts,f)) for f in os.listdir(agts) if f.endswith('.md')}
sk=sorted([d.rstrip('@/') for d in os.listdir(skls) if d.rstrip('@/') not in EXCLUDE and not d.startswith('.')])
m={'last_updated':str(date.today()),'generated_by':os.environ.get('COMPUTERNAME','PC'),'commands':ch,'agents':ah,'skills':sk,'counts':{'commands':len(ch),'agents':len(ah),'skills':len(sk)}}
json.dump(m,open(os.path.join(repo,'manifest.json'),'w'),indent=2)
rp=os.path.join(repo,'README.md')
if os.path.exists(rp):
    r=open(rp,encoding='utf-8').read()
    r=re.sub(r'\d+ slash commands',f'{len(ch)} slash commands',r)
    r=re.sub(r'\d+ specialist agents',f'{len(ah)} specialist agents',r)
    r=re.sub(r'\d+ skills',f'{len(sk)} skills',r)
    open(rp,'w',encoding='utf-8').write(r)
" 2>>$LOG
    } catch { "[$((Get-Date).ToString())][stop][manifest] $_" >> $LOG }

    git add agents/ commands/ global-context.md manifest.json README.md 2>>$LOG
    git diff --cached --quiet
    $hasChanges = $LASTEXITCODE -ne 0
    if ($hasChanges) { git commit -m $MSG 2>>$LOG }

    git fetch origin main 2>>$LOG
    git rebase origin/main 2>>$LOG
    git push origin main 2>>$LOG

    # Update Notion if anything changed
    if ($hasChanges) {
        Start-Process python3 -ArgumentList "`"$env:USERPROFILE\Documents\notion_sync.py`"" -WindowStyle Hidden
    }

} catch { "[$((Get-Date).ToString())][stop][config] $_" >> $LOG }

# Skills: always safe (skills only change intentionally on one machine)
try {
    Set-Location $SkillsDir
    git fetch origin master 2>>$LOG
    git rebase origin/master 2>>$LOG
    git add -A
    git diff --cached --quiet
    $skillsChanged = $LASTEXITCODE -ne 0
    if ($skillsChanged) { git commit -m $MSG 2>>$LOG }
    git push origin master 2>>$LOG

    # Update Notion if skills changed (even if claude-config didn't)
    if ($skillsChanged -and -not $hasChanges) {
        Start-Process python3 -ArgumentList "`"$env:USERPROFILE\Documents\notion_sync.py`"" -WindowStyle Hidden
    }
} catch { "[$((Get-Date).ToString())][stop][skills] $_" >> $LOG }
