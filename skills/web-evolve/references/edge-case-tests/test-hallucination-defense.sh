#!/usr/bin/env bash
# Edge case 2: audit agent hallucination detected by live-HTML verification.
# Builds a fixture page-baselines.json with a deliberately fabricated H1,
# runs verify-live-html.sh against live example.com, asserts:
#   1. exit code 1 (REJECT)
#   2. entry purged from page-baselines.json
#   3. route added to re-audit-queue.txt
# This is the exact failure mode #9 from .forge-spec.md (Run #5 "Reilly Plumbing" hallucination).

set +e
export MSYS_NO_PATHCONV=1

USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"
SKILL_PATH="$USER_HOME/.claude/skills/web-evolve"
FIXTURE="$USER_HOME/.claude/skills/web-evolve-workspace/.edge-case-test-hallucination-$$"

rm -rf "$FIXTURE"
mkdir -p "$FIXTURE/.evolution"

# Loop-state with live URL pointing to example.com (real, predictable content)
cat > "$FIXTURE/.evolution/loop-state.json" <<'EOF'
{"live_url": "https://example.com", "iteration": 0, "branch": "test"}
EOF

# Page-baselines with fabricated specifics that don't match example.com
cat > "$FIXTURE/.evolution/page-baselines.json" <<'EOF'
{"routes": [
  {"route": "/", "extracted_strings": {
    "h1": "FABRICATED: Build amazing things with Acme",
    "primary_cta": "Get Started Free",
    "visible_pricing": ["$29/mo", "$99/yr"]
  }}
]}
EOF

# Run the verification
OUTPUT=$(PROJECT_PATH="$FIXTURE" bash "$SKILL_PATH/references/verify-live-html.sh" "/" 2>&1)
RC=$?

# Assert exit 1
if [ "$RC" -ne 1 ]; then
  echo "FAIL: expected exit 1 (REJECT), got $RC. Output: $OUTPUT" >&2
  rm -rf "$FIXTURE"
  exit 1
fi

# Assert REJECT message present
if ! echo "$OUTPUT" | grep -qi "REJECT"; then
  echo "FAIL: no REJECT message in output: $OUTPUT" >&2
  rm -rf "$FIXTURE"
  exit 1
fi

# Assert entry purged from page-baselines.json
REMAINING=$(python3 -c "import json; print(len(json.load(open(r'$FIXTURE/.evolution/page-baselines.json'))['routes']))")
if [ "$REMAINING" -ne 0 ]; then
  echo "FAIL: expected 0 routes after purge, got $REMAINING" >&2
  rm -rf "$FIXTURE"
  exit 1
fi

# Assert route added to re-audit queue
if [ ! -f "$FIXTURE/.evolution/re-audit-queue.txt" ] || ! grep -q "^/$" "$FIXTURE/.evolution/re-audit-queue.txt"; then
  echo "FAIL: / not added to re-audit-queue.txt" >&2
  cat "$FIXTURE/.evolution/re-audit-queue.txt" 2>/dev/null >&2
  rm -rf "$FIXTURE"
  exit 1
fi

rm -rf "$FIXTURE"
echo "PASS: hallucinated H1 / CTA / pricing rejected; entry purged; route re-queued"
exit 0
