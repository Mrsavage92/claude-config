#!/usr/bin/env bash
# start-task.sh — Phase 2b mechanical snapshot
#
# Captures the pre-task git HEAD SHA and initializes the failure counter.
# Must be called before every task's first edit/bash op.
#
# Mechanical fix for defect 4: snapshot-before-task discipline.

set -euo pipefail

TASK_ID="${1:?usage: start-task.sh <task-id>}"

# Sanitize task id — allow only alphanumeric, dash, underscore
if [[ ! "$TASK_ID" =~ ^[A-Za-z0-9_-]+$ ]]; then
  echo "ERROR: task-id must match [A-Za-z0-9_-]+, got: $TASK_ID" >&2
  exit 1
fi

# Require anchor
if [[ ! -f .autopilot/anchor.txt ]]; then
  echo "ERROR: .autopilot/anchor.txt missing. Run scripts/anchor-check.sh first (Phase 0)." >&2
  exit 1
fi

# Require git
if ! git rev-parse HEAD > /dev/null 2>&1; then
  echo "ERROR: not in a git repo or no HEAD commit yet." >&2
  exit 1
fi

mkdir -p .autopilot/snapshots .autopilot/failures
SHA="$(git rev-parse HEAD)"
echo "$SHA" > ".autopilot/snapshots/${TASK_ID}.sha"
echo "0" > ".autopilot/failures/${TASK_ID}"
echo "Task ${TASK_ID} started. Snapshot: $SHA"
