#!/bin/bash
# Claude Config Sync Script - Mac/Linux
# Pulls latest config from GitHub and applies it to ~/.claude/.
# Run: bash sync.sh

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
SKILLS_DIR="$CLAUDE_DIR/skills"
HOOKS_DIR="$CLAUDE_DIR/hooks"
RULES_DIR="$CLAUDE_DIR/rules"

mirror_dir() {
  local source="$1"
  local destination="$2"

  if [ ! -d "$source" ]; then
    echo "Missing source directory: $source" >&2
    exit 1
  fi

  mkdir -p "$destination"

  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete --exclude='.git' --exclude='__pycache__' --exclude='.DS_Store' "$source"/ "$destination"/
  else
    find "$destination" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
    cp -R "$source"/. "$destination"/
    rm -rf "$destination/.git" "$destination/__pycache__"
  fi
}

echo "=== Claude Config Sync ==="
echo "Repo: $REPO_DIR"
echo "Target: $CLAUDE_DIR"
echo ""

echo "[1/6] Pulling latest from GitHub..."
cd "$REPO_DIR"
git pull origin main
echo "Done."

echo "[2/6] Syncing slash commands..."
mkdir -p "$CLAUDE_DIR/commands"
cp "$REPO_DIR/commands/"*.md "$CLAUDE_DIR/commands/"
echo "Installed $(find "$REPO_DIR/commands" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ') commands."

echo "[3/6] Syncing agents..."
mkdir -p "$CLAUDE_DIR/agents"
cp "$REPO_DIR/agents/"*.md "$CLAUDE_DIR/agents/"
echo "Installed $(find "$REPO_DIR/agents" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ') agents."

echo "[4/6] Syncing hooks and rules..."
mirror_dir "$REPO_DIR/hooks" "$HOOKS_DIR"
if [ -d "$REPO_DIR/rules" ]; then
  mirror_dir "$REPO_DIR/rules" "$RULES_DIR"
fi
echo "Done."

echo "[5/6] Syncing skills from claude-config..."
mkdir -p "$SKILLS_DIR"
if [ -d "$SKILLS_DIR/.git" ]; then
  echo "Removing legacy skills-library git metadata..."
  rm -rf "$SKILLS_DIR/.git"
fi
mirror_dir "$REPO_DIR/skills" "$SKILLS_DIR"
echo "Installed $(find "$SKILLS_DIR" -name 'SKILL.md' 2>/dev/null | wc -l | tr -d ' ') skill files."

echo "[6/6] Checking settings..."
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
TEMPLATE_FILE="$REPO_DIR/settings-template.json"

if [ ! -f "$SETTINGS_FILE" ]; then
  echo "No settings.json found. Copying template..."
  cp "$TEMPLATE_FILE" "$SETTINGS_FILE"
  echo ""
  echo "ACTION REQUIRED: Edit $SETTINGS_FILE"
  echo "Set env.NOTION_INTERNAL_TOKEN to your current Notion internal integration token."
else
  echo "settings.json already exists - skipping (preserving your tokens)."
fi

echo ""
echo "=== Sync complete! ==="
echo "Commands: $(find "$CLAUDE_DIR/commands" -maxdepth 1 -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
echo "Agents:   $(find "$CLAUDE_DIR/agents" -maxdepth 1 -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
echo "Skills:   $(find "$SKILLS_DIR" -name 'SKILL.md' 2>/dev/null | wc -l | tr -d ' ') skill files"
echo ""
echo "Restart Claude Code to pick up all changes."
