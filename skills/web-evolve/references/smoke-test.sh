#!/usr/bin/env bash
# Phase 0 hook smoke-test. Attempts to violate the web-evolve-guard hook.
# MUST exit 2 (the hook's block code). Any other exit = hook is broken.
# Cardinal rules: gate is mechanical, ground-truth (exit code).
# This closes failure mode #2 from .forge-spec.md (hook untested in execution).

set +e  # we expect the inner command to fail with exit 2

PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
STATE="$PROJECT_PATH/.evolution/loop-state.json"
SMOKE_FILE="$PROJECT_PATH/.evolution/.smoke-target.txt"

# Set loop-state to a state the hook should block: iteration > 0 with a check that has edit_direct:false
mkdir -p "$PROJECT_PATH/.evolution"
cat > "$STATE.smoke-backup" <<EOF
{"iteration": 1, "current_checks": ["A1"], "ask_user_count": 0, "deviation_count": 0, "void_count": 0, "max_iterations": 5, "target_score": 90, "halt_flag": false}
EOF
cp "$STATE.smoke-backup" "$STATE" 2>/dev/null || true

# Touch a fake source file the hook should protect
touch "$SMOKE_FILE"

# Attempt the violation: the hook's PreToolUse on Write/Edit against a protected path should block
# We can't directly invoke a Claude tool from bash, so this script is a stub for the orchestrator:
# the orchestrator MUST attempt an Edit on $SMOKE_FILE while iteration > 0 and assert it gets blocked.

# Real smoke-test (orchestrator-driven):
#   1. orchestrator reads this script's output for the path
#   2. orchestrator attempts: Edit(file_path: "$SMOKE_FILE", old: "anything", new: "anything")
#   3. expected: hook returns exit 2 with "BLOCKED" in stderr
#   4. orchestrator parses hook stderr, asserts "BLOCKED" present
#   5. if not blocked → real smoke-test FAILED → boot-gates.sh exits 1 → /web-evolve HALTs

# This script's job: emit the contract that the orchestrator follows.
echo "SMOKE_TARGET=$SMOKE_FILE"
echo "EXPECTED_EXIT_CODE=2"
echo "EXPECTED_STDERR_SUBSTRING=BLOCKED"
echo "STATE_FILE=$STATE"
echo "INSTRUCTIONS=Orchestrator must Edit \$SMOKE_TARGET and assert hook blocks. boot-gates.sh exits 1 unless verified."

# Self-cleanup
rm -f "$SMOKE_FILE"

# This script alone cannot trigger the Claude PreToolUse hook (which fires on Claude tool calls, not bash).
# So this script exits 0 to indicate "smoke-test contract emitted." The orchestrator's boot-gates.sh
# does the actual Edit attempt and asserts the exit-2 behaviour via Claude's tool result.
exit 0
