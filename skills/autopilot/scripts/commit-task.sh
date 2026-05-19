#!/usr/bin/env bash
# commit-task.sh — atomic commit + LOG.md append + counter increment + maybe-checkpoint
#
# The ONLY sanctioned way for autopilot to commit a task.
# Direct `git commit` calls are forbidden by SKILL.md.
#
# Mechanical fix for defect 1 (LOG.md per-task entries) and defect 2 (checkpoints every 5).

set -euo pipefail

MSG="${1:?usage: commit-task.sh <commit-msg> <files-changed-csv> <test-status>}"
FILES="${2:-}"
TESTS="${3:-}"

# Require anchor
if [[ ! -f .autopilot/anchor.txt ]]; then
  echo "ERROR: .autopilot/anchor.txt missing. Run anchor-check.sh first." >&2
  exit 1
fi

# Require staged changes
if git diff --cached --quiet; then
  echo "ERROR: nothing staged. Use 'git add <specific-files>' before commit-task.sh." >&2
  exit 1
fi

# Pre-commit secret scan — refuse to commit if .env or *.pem are staged
STAGED="$(git diff --cached --name-only)"
if echo "$STAGED" | grep -qE '(^|/)\.env($|\.)|\.pem$|\.key$|_rsa$|_ed25519$|/secrets/|/credentials/'; then
  echo "ERROR: refusing to commit secrets/credentials. Staged:" >&2
  echo "$STAGED" | grep -E '(^|/)\.env($|\.)|\.pem$|\.key$|_rsa$|_ed25519$|/secrets/|/credentials/' >&2
  echo "Unstage with: git reset HEAD <file>" >&2
  exit 1
fi

# No-op detection — if the staged diff has no substantive (non-whitespace, non-comment-only) lines,
# increment the no-op counter. After 3 in a row, exit 4 — caller halts as DEGRADED.
mkdir -p .autopilot
NOOP_FILE=".autopilot/noop-count"
NOOP_PREV=0
[[ -f "$NOOP_FILE" ]] && NOOP_PREV="$(cat "$NOOP_FILE")"

# Use awk for atomic counting — avoids pipefail issues with grep chains that may find no matches.
SUBSTANTIVE_LINES=$(git diff --cached -U0 | awk '
  # skip file-header lines (+++/--- markers)
  /^(\+\+\+|---)/ { next }
  # only consider +/- change lines
  /^[+-]/ {
    line = substr($0, 2)
    sub(/^[[:space:]]+/, "", line)        # strip leading whitespace
    if (line == "") next                  # blank-line change
    if (line ~ /^(#|\/\/|\/\*|\*|--)/) next  # comment-only line
    count++
  }
  END { print count+0 }
')

if [[ "$SUBSTANTIVE_LINES" -eq 0 ]]; then
  NOOP_NEW=$((NOOP_PREV + 1))
  echo "$NOOP_NEW" > "$NOOP_FILE"
  echo "WARN: this commit has no substantive changes (whitespace/comments only). No-op streak: ${NOOP_NEW}/3"
  if (( NOOP_NEW >= 3 )); then
    echo "DEGRADED: 3 consecutive no-op commits. Halting per session-level circuit breaker." >&2
    echo "  Reset the counter manually after investigating: echo 0 > $NOOP_FILE" >&2
    exit 4
  fi
else
  # Substantive change — reset the no-op streak
  echo "0" > "$NOOP_FILE"
fi

# Perform the commit
git commit -m "$MSG"

# Compute LOG.md path — prefer project root; if docs/ exists, prefer docs/LOG.md
LOG_PATH="LOG.md"
if [[ -d docs ]]; then
  LOG_PATH="docs/LOG.md"
fi
touch "$LOG_PATH"

TS="$(date '+%H:%M:%S')"
SHORT_MSG="$(printf '%s' "$MSG" | head -n1 | cut -c1-120)"
FILES_DISPLAY="${FILES:-<not-specified>}"
TESTS_DISPLAY="${TESTS:-<not-run>}"
printf '[%s] DONE | %s | files: %s | tests: %s\n' "$TS" "$SHORT_MSG" "$FILES_DISPLAY" "$TESTS_DISPLAY" >> "$LOG_PATH"

# Increment task counter
mkdir -p .autopilot
COUNT_FILE=".autopilot/task-count"
COUNT=0
if [[ -f "$COUNT_FILE" ]]; then
  COUNT="$(cat "$COUNT_FILE")"
fi
COUNT=$((COUNT + 1))
echo "$COUNT" > "$COUNT_FILE"

echo "Task #$COUNT committed. LOG entry appended to $LOG_PATH."

# Maybe-checkpoint
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$SCRIPT_DIR/maybe-checkpoint.sh" "$COUNT" "$SHORT_MSG"
