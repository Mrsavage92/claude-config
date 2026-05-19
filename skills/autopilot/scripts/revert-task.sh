#!/usr/bin/env bash
# revert-task.sh — hard-resets to the pre-task snapshot SHA and logs STUCK
#
# Called by autopilot after record-failure.sh exits 3.
#
# Mechanical fix for defect 4: revert-on-triple-failure.

set -euo pipefail

TASK_ID="${1:?usage: revert-task.sh <task-id>}"

if [[ ! "$TASK_ID" =~ ^[A-Za-z0-9_-]+$ ]]; then
  echo "ERROR: task-id must match [A-Za-z0-9_-]+, got: $TASK_ID" >&2
  exit 1
fi

SHA_FILE=".autopilot/snapshots/${TASK_ID}.sha"
if [[ ! -f "$SHA_FILE" ]]; then
  echo "ERROR: no snapshot for task ${TASK_ID}. Cannot revert." >&2
  exit 1
fi

SHA="$(cat "$SHA_FILE")"
if [[ ! "$SHA" =~ ^[0-9a-f]{7,40}$ ]]; then
  echo "ERROR: snapshot file does not contain a valid SHA: $SHA" >&2
  exit 1
fi

echo "Reverting to pre-task snapshot: $SHA"
git reset --hard "$SHA"

# Append STUCK entry to LOG.md
LOG_PATH="LOG.md"
if [[ -d docs ]]; then
  LOG_PATH="docs/LOG.md"
fi
touch "$LOG_PATH"

TS="$(date '+%H:%M:%S')"
printf '[%s] STUCK | task %s | reverted to %s after 3 failures\n' "$TS" "$TASK_ID" "$SHA" >> "$LOG_PATH"

echo "Task ${TASK_ID} marked STUCK in $LOG_PATH. Move to next task."
