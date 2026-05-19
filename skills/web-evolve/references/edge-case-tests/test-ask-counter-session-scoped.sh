#!/usr/bin/env bash
# Edge case 5: AskUserQuestion session-scoped counter blocks 2nd ask in the same session.
# Run #5 had asks across the session that the per-iter hook couldn't block.
#
# This test:
#   1. Builds a fixture project with iter > 0.
#   2. Pre-seeds the session counter file at ~/.claude/state/web-evolve-asks-<id>.json with count=1.
#   3. Invokes the hook with an AskUserQuestion payload.
#   4. Asserts exit 2 + BLOCKED message.

set +e
export MSYS_NO_PATHCONV=1

USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"
SKILL_PATH="$USER_HOME/.claude/skills/web-evolve"
GUARD="$USER_HOME/.claude/hooks/web-evolve-guard.ps1"
TEST_SESSION="edge-case-test-$$"
ASK_FILE="$USER_HOME/.claude/state/web-evolve-asks-$TEST_SESSION.json"
FIXTURE="$USER_HOME/.claude/skills/web-evolve-workspace/.edge-case-test-ask-$$"

rm -rf "$FIXTURE"
mkdir -p "$FIXTURE/.evolution"
echo '{"iteration":1,"current_checks":["A1"],"ask_user_count":0}' > "$FIXTURE/.evolution/loop-state.json"
echo '# stub' > "$FIXTURE/.evolution/taste-rules.md"

# Pre-seed the session counter with count=1 (simulating one prior ask in this session)
mkdir -p "$USER_HOME/.claude/state"
cat > "$ASK_FILE" <<EOF
{"count": 1, "session_id": "$TEST_SESSION", "created_at": "2026-05-17T00:00:00Z"}
EOF

# Build the hook payload — AskUserQuestion with session_id field
PAYLOAD=$(python3 -c "
import json
print(json.dumps({
  'tool_name': 'AskUserQuestion',
  'tool_input': {'question': 'should I proceed?'},
  'cwd': r'$FIXTURE',
  'session_id': '$TEST_SESSION'
}))
")

# Invoke the hook
OUTPUT=$(echo "$PAYLOAD" | powershell -NonInteractive -ExecutionPolicy Bypass -File "$GUARD" 2>&1)
RC=$?

# Cleanup
rm -rf "$FIXTURE"
rm -f "$ASK_FILE"

# Assert exit 2
if [ "$RC" -ne 2 ]; then
  echo "FAIL: expected exit 2 from hook (2nd ask blocked), got $RC. Output: $OUTPUT" >&2
  exit 1
fi

# Assert BLOCKED message references session counter
if ! echo "$OUTPUT" | grep -q "BLOCKED"; then
  echo "FAIL: no BLOCKED message in hook stderr: $OUTPUT" >&2
  exit 1
fi
if ! echo "$OUTPUT" | grep -qi "session"; then
  echo "FAIL: BLOCKED message does not reference session-scoped enforcement: $OUTPUT" >&2
  exit 1
fi

echo "PASS: 2nd AskUserQuestion in same session correctly blocked by hook (exit 2)"
exit 0
