#!/usr/bin/env bash
# record-failure.sh — increments failure counter for a task; exits 3 on the 3rd failure
#
# Caller treats exit code 3 as the signal to invoke revert-task.sh and log STUCK.
#
# Mechanical fix for defect 4: triple-failure circuit breaker.

set -euo pipefail

TASK_ID="${1:?usage: record-failure.sh <task-id>}"

if [[ ! "$TASK_ID" =~ ^[A-Za-z0-9_-]+$ ]]; then
  echo "ERROR: task-id must match [A-Za-z0-9_-]+, got: $TASK_ID" >&2
  exit 1
fi

FAIL_FILE=".autopilot/failures/${TASK_ID}"
if [[ ! -f "$FAIL_FILE" ]]; then
  echo "ERROR: no failure file for task ${TASK_ID}. start-task.sh was not called for this task." >&2
  exit 1
fi

COUNT="$(cat "$FAIL_FILE")"
COUNT=$((COUNT + 1))
echo "$COUNT" > "$FAIL_FILE"

echo "Task ${TASK_ID}: failure #${COUNT}"

if (( COUNT >= 3 )); then
  echo "TRIPLE FAILURE for task ${TASK_ID}. Caller must invoke revert-task.sh ${TASK_ID}." >&2
  exit 3
fi
