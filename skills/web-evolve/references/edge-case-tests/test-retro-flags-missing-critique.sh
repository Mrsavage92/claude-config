#!/usr/bin/env bash
# Edge case 3: Phase F retro agent flags Skill('critique') was NOT actually fired.
# This is the exact Run #5 failure mode 1.
#
# We can't spawn a real general-purpose Agent in a bash test, but we CAN exercise the
# same logic the RetroAgent would: read a tool-use log, count Skill('critique') calls,
# compare against expected, emit RULE_1_VIOLATED if missing.
#
# This test:
#   1. Creates a synthetic tool-use log that has 5 routes but only 2 critique calls.
#   2. Runs the retro logic (simulating retro-agent-brief.md RULE_1 check).
#   3. Asserts the output flags RULE_1_VIOLATED with concrete count evidence.

set +e
export MSYS_NO_PATHCONV=1

USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"
SKILL_PATH="$USER_HOME/.claude/skills/web-evolve"
FIXTURE="$USER_HOME/.claude/skills/web-evolve-workspace/.edge-case-test-retro-$$"

rm -rf "$FIXTURE"
mkdir -p "$FIXTURE/.evolution"

# Synthetic tool-use log: 5 audit routes attempted, but only 2 actual Skill('critique') calls
cat > "$FIXTURE/tool-use.log" <<'EOF'
{"session_id":"test","tool_use_id":"toolu_001","tool":"Skill","name":"Skill","args":"web-evolve audit /"}
{"session_id":"test","tool_use_id":"toolu_002","tool":"Skill","name":"Skill","args":"critique route=/"}
{"session_id":"test","tool_use_id":"toolu_003","tool":"WebFetch","name":"WebFetch","args":"https://example.com"}
{"session_id":"test","tool_use_id":"toolu_004","tool":"Skill","name":"Skill","args":"critique route=/about"}
{"session_id":"test","tool_use_id":"toolu_005","tool":"Read","name":"Read"}
{"session_id":"test","tool_use_id":"toolu_006","tool":"Read","name":"Read"}
EOF

# Page-baselines claims 5 routes audited
cat > "$FIXTURE/.evolution/page-baselines.json" <<'EOF'
{"routes":[{"route":"/"},{"route":"/about"},{"route":"/pricing"},{"route":"/contact"},{"route":"/blog"}]}
EOF

# Run the RULE_1 check (replicate what retro-agent-brief.md prescribes)
RESULT=$(python3 - "$FIXTURE/tool-use.log" "$FIXTURE/.evolution/page-baselines.json" <<'PYEOF'
import json, sys
log_path, baseline_path = sys.argv[1], sys.argv[2]

# Count critique calls in log
critique_calls = 0
with open(log_path) as f:
    for line in f:
        try:
            entry = json.loads(line)
            if entry.get('tool') == 'Skill' and 'critique' in entry.get('args', ''):
                critique_calls += 1
        except Exception:
            pass

# Count expected (one per route)
with open(baseline_path) as f:
    baseline = json.load(f)
expected = len(baseline.get('routes', []))

# RetroAgent decision logic
if critique_calls < expected:
    print(f"RULE_1_VIOLATED: expected={expected} found={critique_calls}")
else:
    print(f"RULE_1_VERIFIED: expected={expected} found={critique_calls}")
PYEOF
)

# Assert violation flagged
if ! echo "$RESULT" | grep -q "^RULE_1_VIOLATED"; then
  echo "FAIL: expected RULE_1_VIOLATED, got: $RESULT" >&2
  rm -rf "$FIXTURE"
  exit 1
fi

# Assert concrete count evidence (not just a string)
if ! echo "$RESULT" | grep -qE "expected=5 found=2"; then
  echo "FAIL: missing concrete counts in $RESULT" >&2
  rm -rf "$FIXTURE"
  exit 1
fi

rm -rf "$FIXTURE"
echo "PASS: synthetic log with 2/5 critique calls correctly flagged RULE_1_VIOLATED"
exit 0
