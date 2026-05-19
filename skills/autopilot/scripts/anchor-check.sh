#!/usr/bin/env bash
# anchor-check.sh — Phase 0 hard gate
#
# Validates that the current working directory is a legitimate project root.
# Writes the resolved anchor path to .autopilot/anchor.txt.
# Exits non-zero with a NEEDS_HUMAN message if the anchor is invalid.
#
# Mechanical fix for defect 3: Phase 0 scope-anchor drift.
# The skill is forbidden from reading anything outside the anchor's path.

set -euo pipefail

HERE="$(pwd -P)"
HOME_REAL="$(cd "$HOME" && pwd -P)"

# Tight set of forbidden EXACT roots (cwd must not equal any of these)
forbidden_exact=(
  "$HOME_REAL"
  "$HOME_REAL/.claude"
  "$HOME_REAL/.claude/projects"
  "$HOME_REAL/.claude/skills"
  "$HOME_REAL/.claude/agents"
  "$HOME_REAL/.claude/commands"
  "$HOME_REAL/Documents"
  "$HOME_REAL/Documents/Git/claude-config"
  "/"
  "/c"
  "/c/Users"
  "/c/Users/Adam"
)

for f in "${forbidden_exact[@]}"; do
  if [[ "$HERE" == "$f" ]]; then
    echo "NEEDS_HUMAN: cwd is $HERE which is a forbidden anchor root." >&2
    echo "  Reason: this is a home / config / dotfiles directory, not a project." >&2
    echo "  Fix: cd into the actual project directory (e.g. C:/Users/Adam/audit-genius) and re-invoke autopilot." >&2
    exit 2
  fi
done

# Required project marker — at least one must exist in cwd (not in a parent)
markers=(CLAUDE.md package.json pyproject.toml Cargo.toml go.mod composer.json Gemfile)
found=""
for m in "${markers[@]}"; do
  if [[ -f "$HERE/$m" ]]; then
    found="$m"
    break
  fi
done

if [[ -z "$found" ]]; then
  echo "NEEDS_HUMAN: $HERE does not contain a project marker." >&2
  echo "  Looked for: ${markers[*]}" >&2
  echo "  Fix: cd into the actual project root (a directory with CLAUDE.md, package.json, etc.) and re-invoke autopilot." >&2
  exit 2
fi

# Anchor is valid. Persist it.
mkdir -p "$HERE/.autopilot"
echo "$HERE" > "$HERE/.autopilot/anchor.txt"
echo "Anchored: $HERE (marker: $found)"
