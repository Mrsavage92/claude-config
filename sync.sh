#!/bin/bash
# Claude Config Sync Script — Mac/Linux
# Pulls latest config from GitHub and applies to ~/.claude/
# Run: bash sync.sh

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
SKILLS_REPO="https://github.com/Mrsavage92/skills-library.git"
SKILLS_DIR="$CLAUDE_DIR/skills/claude-skills"

echo "=== Claude Config Sync ==="
echo "Repo: $REPO_DIR"
echo "Target: $CLAUDE_DIR"
echo ""

# 1. Pull latest from GitHub
echo "[1/5] Pulling latest from GitHub..."
cd "$REPO_DIR"
git pull origin main
echo "Done."

# 2. Sync commands
echo "[2/5] Syncing slash commands..."
mkdir -p "$CLAUDE_DIR/commands"
cp "$REPO_DIR/commands/"*.md "$CLAUDE_DIR/commands/"
echo "Installed $(ls "$REPO_DIR/commands/" | wc -l | tr -d ' ') commands."

# 3. Sync agents
echo "[3/5] Syncing agents..."
mkdir -p "$CLAUDE_DIR/agents"
cp "$REPO_DIR/agents/"*.md "$CLAUDE_DIR/agents/"
echo "Installed $(ls "$REPO_DIR/agents/" | wc -l | tr -d ' ') agents."

# 4. Sync skills library
echo "[4/5] Syncing skills library..."
mkdir -p "$CLAUDE_DIR/skills"
if [ -d "$SKILLS_DIR/.git" ]; then
  echo "Updating existing skills library..."
  cd "$SKILLS_DIR"
  git pull origin main
else
  echo "Cloning skills library (first time)..."
  git clone "$SKILLS_REPO" "$SKILLS_DIR"
fi
echo "Done."

# 5. Settings
echo "[5/5] Checking settings..."
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
TEMPLATE_FILE="$REPO_DIR/settings-template.json"

if [ ! -f "$SETTINGS_FILE" ]; then
  echo "No settings.json found. Copying template..."
  cp "$TEMPLATE_FILE" "$SETTINGS_FILE"
  echo ""
  echo "ACTION REQUIRED: Edit $SETTINGS_FILE"
  echo "Replace YOUR_NOTION_TOKEN_HERE with your actual Notion token."
else
  echo "settings.json already exists — skipping (preserving your tokens)."
fi

echo ""
echo "=== Sync complete! ==="
echo "Commands: $(ls "$CLAUDE_DIR/commands/" | wc -l | tr -d ' ')"
echo "Agents:   $(ls "$CLAUDE_DIR/agents/" | wc -l | tr -d ' ')"
echo "Skills:   $(find "$SKILLS_DIR" -name 'SKILL.md' 2>/dev/null | wc -l | tr -d ' ') skill files"
echo ""
echo "Restart Claude Code to pick up all changes."
