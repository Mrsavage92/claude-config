# Claude Config Sync Script — Windows (PowerShell)
# Pulls latest config from GitHub and applies to ~/.claude/
# Run: .\sync.ps1

$ErrorActionPreference = "Stop"

$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeDir = "$env:USERPROFILE\.claude"
$SkillsRepo = "https://github.com/Mrsavage92/skills-library.git"
$SkillsDir = "$ClaudeDir\skills"

Write-Host "=== Claude Config Sync ===" -ForegroundColor Cyan
Write-Host "Repo:   $RepoDir"
Write-Host "Target: $ClaudeDir"
Write-Host ""

# 1. Pull latest from GitHub
Write-Host "[1/5] Pulling latest from GitHub..." -ForegroundColor Yellow
Set-Location $RepoDir
git pull origin main
Write-Host "Done." -ForegroundColor Green

# 2. Sync commands
Write-Host "[2/5] Syncing slash commands..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$ClaudeDir\commands" | Out-Null
Copy-Item "$RepoDir\commands\*.md" "$ClaudeDir\commands\" -Force
$cmdCount = (Get-ChildItem "$RepoDir\commands\*.md").Count
Write-Host "Installed $cmdCount commands." -ForegroundColor Green

# 3. Sync agents
Write-Host "[3/5] Syncing agents..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$ClaudeDir\agents" | Out-Null
Copy-Item "$RepoDir\agents\*.md" "$ClaudeDir\agents\" -Force
$agentCount = (Get-ChildItem "$RepoDir\agents\*.md").Count
Write-Host "Installed $agentCount agents." -ForegroundColor Green

# 4. Sync skills library
Write-Host "[4/5] Syncing skills library..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$ClaudeDir\skills" | Out-Null
if (Test-Path "$SkillsDir\.git") {
    Write-Host "Updating existing skills library..."
    Set-Location $SkillsDir
    git pull origin master
} else {
    Write-Host "Cloning skills library (first time, may take a minute)..."
    git clone $SkillsRepo $SkillsDir
}
Write-Host "Done." -ForegroundColor Green

# 5. Settings
Write-Host "[5/5] Checking settings..." -ForegroundColor Yellow
$SettingsFile = "$ClaudeDir\settings.json"
$TemplateFile = "$RepoDir\settings-template.json"

if (-not (Test-Path $SettingsFile)) {
    Write-Host "No settings.json found. Copying template..."
    Copy-Item $TemplateFile $SettingsFile
    Write-Host ""
    Write-Host "ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "Edit $SettingsFile"
    Write-Host "Replace YOUR_NOTION_TOKEN_HERE with: ntn_K46793192822yLb12pUWso1QC0gaYtsA6dENpcn0xjhfKB"
} else {
    Write-Host "settings.json already exists — skipping (preserving your tokens)." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Sync complete! ===" -ForegroundColor Cyan
$cmdTotal = (Get-ChildItem "$ClaudeDir\commands\*.md" -ErrorAction SilentlyContinue).Count
$agentTotal = (Get-ChildItem "$ClaudeDir\agents\*.md" -ErrorAction SilentlyContinue).Count
Write-Host "Commands: $cmdTotal"
Write-Host "Agents:   $agentTotal"
Write-Host ""
Write-Host "Restart Claude Code (VS Code) to pick up all changes." -ForegroundColor Yellow
