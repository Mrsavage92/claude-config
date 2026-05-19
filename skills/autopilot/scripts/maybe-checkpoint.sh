#!/usr/bin/env bash
# maybe-checkpoint.sh — appends a checkpoint block to AUTOPILOT_LOG.md every 5 tasks
#
# Called automatically by commit-task.sh after every task.
# Writes only when (count % 5 == 0). Claude never counts; the file does.
#
# Mechanical fix for defect 2: mid-session checkpoints every 5 tasks.

set -euo pipefail

COUNT="${1:?usage: maybe-checkpoint.sh <count> <last-task-msg>}"
LAST_MSG="${2:-<unknown>}"

# Only fire every 5 tasks
if (( COUNT % 5 != 0 )); then
  exit 0
fi

# Determine target file
LOG="AUTOPILOT_LOG.md"
if [[ -d docs ]] && [[ -f docs/AUTOPILOT_LOG.md ]]; then
  LOG="docs/AUTOPILOT_LOG.md"
fi
touch "$LOG"

# Run quality-gate.sh --quick to get an actual build/test status.
# The gate handles missing build/test commands gracefully (logs "skipped" rather than failing).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QGATE_OUT="$(bash "$SCRIPT_DIR/quality-gate.sh" --quick 2>&1 || true)"
QGATE_LINE="$(echo "$QGATE_OUT" | tail -n 1)"

TS="$(date '+%Y-%m-%d %H:%M')"

{
  echo ""
  echo "### Checkpoint — ${TS}"
  echo "Tasks done this session: ${COUNT}"
  echo "Last task: ${LAST_MSG}"
  echo "Quality gate (quick): ${QGATE_LINE}"
} >> "$LOG"

echo "Checkpoint written to $LOG (task #${COUNT})."
