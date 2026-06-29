# Claude Config Sync Script - Windows (PowerShell)
# Pulls latest config from GitHub and applies it to ~/.claude/.
# Run: .\sync.ps1

$ErrorActionPreference = "Stop"

$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeDir = "$env:USERPROFILE\.claude"
$SkillsDir = "$ClaudeDir\skills"
$HooksDir = "$ClaudeDir\hooks"
$RulesDir = "$ClaudeDir\rules"

function Invoke-MirrorCopy {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination,
        [string[]]$ExcludeDirs = @(".git", "__pycache__"),
        [string[]]$ExcludeFiles = @(".DS_Store")
    )

    if (-not (Test-Path $Source)) {
        throw "Missing source directory: $Source"
    }

    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    robocopy $Source $Destination /MIR /XD $ExcludeDirs /XF $ExcludeFiles | Out-Null
    if ($LASTEXITCODE -gt 7) {
        throw "robocopy failed from $Source to $Destination with exit code $LASTEXITCODE"
    }
    $global:LASTEXITCODE = 0
}

Write-Host "=== Claude Config Sync ===" -ForegroundColor Cyan
Write-Host "Repo:   $RepoDir"
Write-Host "Target: $ClaudeDir"
Write-Host ""

# 1. Pull latest from GitHub
Write-Host "[1/6] Pulling latest from GitHub..." -ForegroundColor Yellow
Set-Location $RepoDir
git pull origin main
Write-Host "Done." -ForegroundColor Green

# 2. Sync commands
Write-Host "[2/6] Syncing slash commands..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$ClaudeDir\commands" | Out-Null
Copy-Item "$RepoDir\commands\*.md" "$ClaudeDir\commands\" -Force
$cmdCount = (Get-ChildItem "$RepoDir\commands\*.md").Count
Write-Host "Installed $cmdCount commands." -ForegroundColor Green

# 3. Sync agents
Write-Host "[3/6] Syncing agents..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$ClaudeDir\agents" | Out-Null
Copy-Item "$RepoDir\agents\*.md" "$ClaudeDir\agents\" -Force
$agentCount = (Get-ChildItem "$RepoDir\agents\*.md").Count
Write-Host "Installed $agentCount agents." -ForegroundColor Green

# 4. Sync hooks and rules from canonical repo
Write-Host "[4/6] Syncing hooks and rules..." -ForegroundColor Yellow
Invoke-MirrorCopy -Source "$RepoDir\hooks" -Destination $HooksDir
if (Test-Path "$RepoDir\rules") {
    Invoke-MirrorCopy -Source "$RepoDir\rules" -Destination $RulesDir
}
Write-Host "Done." -ForegroundColor Green

# 5. Sync skills from canonical repo
Write-Host "[5/6] Syncing skills from claude-config..." -ForegroundColor Yellow
$RepoSkillsDir = "$RepoDir\skills"
New-Item -ItemType Directory -Force -Path $SkillsDir | Out-Null
$LegacySkillsGit = "$SkillsDir\.git"
if (Test-Path $LegacySkillsGit) {
    Write-Host "Removing legacy skills-library git metadata..."
    Remove-Item -LiteralPath $LegacySkillsGit -Recurse -Force
}
# ai-exposure-validation is PRIVATE product IP — canonical home is the private
# orbit-digital-suites repo, never public claude-config. Excluded from the mirror so
# /MIR neither publishes nor deletes the local runtime copy.
Invoke-MirrorCopy -Source $RepoSkillsDir -Destination $SkillsDir -ExcludeDirs ".git", "__pycache__", "ai-exposure-validation"
$skillCount = (Get-ChildItem $SkillsDir -Directory -ErrorAction SilentlyContinue).Count
Write-Host "Installed $skillCount skill directories." -ForegroundColor Green

# 6. Settings
Write-Host "[6/6] Checking settings..." -ForegroundColor Yellow
$SettingsFile = "$ClaudeDir\settings.json"
$TemplateFile = "$RepoDir\settings-template.json"

if (-not (Test-Path $SettingsFile)) {
    Write-Host "No settings.json found. Copying template..."
    Copy-Item $TemplateFile $SettingsFile
    Write-Host ""
    Write-Host "ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "Edit $SettingsFile"
    Write-Host "Set env.NOTION_INTERNAL_TOKEN to your current Notion internal integration token."
} else {
    Write-Host "settings.json already exists - skipping (preserving your tokens)." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Sync complete! ===" -ForegroundColor Cyan
$cmdTotal = (Get-ChildItem "$ClaudeDir\commands\*.md" -ErrorAction SilentlyContinue).Count
$agentTotal = (Get-ChildItem "$ClaudeDir\agents\*.md" -ErrorAction SilentlyContinue).Count
$skillTotal = (Get-ChildItem "$ClaudeDir\skills" -Directory -ErrorAction SilentlyContinue).Count
Write-Host "Commands: $cmdTotal"
Write-Host "Agents:   $agentTotal"
Write-Host "Skills:   $skillTotal"
Write-Host ""
Write-Host "Restart Claude Code (VS Code) to pick up all changes." -ForegroundColor Yellow
