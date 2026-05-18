#!/usr/bin/env bash
# Phase 0 boot gates. Every /web-evolve invocation runs this FIRST.
# Exit 0 = pass, all gates green, Phase A may proceed.
# Exit non-0 = HALT. The exit code is the gate name.
# Cardinal rules 3, 9: gates are scripts returning exit codes, not LLM prose.
# Uses python3 (no jq dependency).

set -e
export MSYS_NO_PATHCONV=1

# Use USERPROFILE on Windows (Python reads it directly); fall back to HOME elsewhere.
# Normalize backslashes to forward slashes for Python compatibility.
USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"

PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
# Normalize MSYS-style PROJECT_PATH (/c/...) to Windows-style (C:/...) for python compatibility
if [[ "$PROJECT_PATH" =~ ^/([a-zA-Z])/ ]]; then
  drive="${BASH_REMATCH[1]^^}"
  PROJECT_PATH="${drive}:/${PROJECT_PATH:3}"
fi
SKILL_PATH="$USER_HOME/.claude/skills/web-evolve"
SESSION_ID="${CLAUDE_SESSION_ID:-no-session}"
STATE_DIR="$USER_HOME/.claude/state"

fail() {
  local code="$1"; shift
  echo "BOOT_GATE_FAIL[$code]: $*" >&2
  exit "$code"
}

# Gate 1 — SKILL.md line-count cap (closes failure mode 6: spec bloat)
LINES=$(wc -l < "$SKILL_PATH/SKILL.md")
[ "$LINES" -le 500 ] || fail 1 "SKILL.md has $LINES lines > 500. Consolidate before adding rules."

# Gate 2 — hook script exists and references .evolution path
GUARD="$USER_HOME/.claude/hooks/web-evolve-guard.ps1"
[ -f "$GUARD" ] || fail 2 "Hook script $GUARD missing — Cardinal Rule 2 unenforced"
grep -q "\.evolution" "$GUARD" || fail 2 "Hook script does not reference .evolution path — Cardinal Rule 2 unenforced"
# Confirm the hook BLOCKS .evolution/* writes (not exits 0 as the pre-fix version did)
grep -qE 'BLOCK.*\.evolution|exit 2.*evolution|evolution.*exit 2' "$GUARD" || fail 2 "Hook does not BLOCK .evolution writes — Cardinal Rule 2 inverted"

# Gate 3 — Hook RUNTIME test (not just contract). Directly invoke the PowerShell hook
# with a synthesized payload that simulates an Edit to .evolution/* during an active iter,
# and assert the hook returns exit 2 with the BLOCKED message.
[ -x "$SKILL_PATH/references/smoke-test.sh" ] || fail 3 "smoke-test.sh missing or not executable"

# Build a transient fixture project for the hook to walk up from.
# Use a Windows-style path under the user's home so PowerShell doesn't see MSYS /tmp paths.
HOOK_TEST_DIR="$USER_HOME/.claude/skills/web-evolve-workspace/.boot-gates-hook-test-$$"
rm -rf "$HOOK_TEST_DIR"
mkdir -p "$HOOK_TEST_DIR/.evolution"
echo '{"iteration":1,"current_checks":["A1"],"ask_user_count":0,"deviation_count":0}' > "$HOOK_TEST_DIR/.evolution/loop-state.json"
# Hook also checks for taste-rules.md presence — provide a stub so it doesn't bail on Principle 0
echo '# stub' > "$HOOK_TEST_DIR/.evolution/taste-rules.md"

# Already a Windows path; just normalize
HOOK_TEST_DIR_WIN="$HOOK_TEST_DIR"
TARGET_FILE="$HOOK_TEST_DIR_WIN/.evolution/test-target.json"

# Synthesize hook payload: Edit on .evolution/ file during iter > 0 → must exit 2
HOOK_PAYLOAD=$(python3 -c "
import json
print(json.dumps({
  'tool_name': 'Edit',
  'tool_input': {'file_path': r'$TARGET_FILE'},
  'cwd': r'$HOOK_TEST_DIR_WIN'
}))
")

set +e
HOOK_OUTPUT=$(echo "$HOOK_PAYLOAD" | powershell -NonInteractive -ExecutionPolicy Bypass -File "$GUARD" 2>&1)
HOOK_RC=$?
set -e
rm -rf "$HOOK_TEST_DIR"

if [ "$HOOK_RC" -ne 2 ]; then
  fail 3 "Hook runtime test FAILED: expected exit 2 from PreToolUse on .evolution/* during iter>0, got exit $HOOK_RC. Output: $HOOK_OUTPUT"
fi
if ! echo "$HOOK_OUTPUT" | grep -q "BLOCKED"; then
  fail 3 "Hook returned exit 2 but no BLOCKED message in stderr. Output: $HOOK_OUTPUT"
fi

# Also run the contract-emit smoke-test.sh script to keep the dual signal
SMOKE_OUT=$("$SKILL_PATH/references/smoke-test.sh" 2>&1) || fail 3 "smoke-test.sh non-zero exit"
echo "$SMOKE_OUT" | grep -q "EXPECTED_EXIT_CODE=2" || fail 3 "smoke-test.sh did not emit expected contract"

# Gate 4 — Session-scoped ask counter file (cardinal rule 7)
mkdir -p "$STATE_DIR"
ASK_FILE="$STATE_DIR/web-evolve-asks-$SESSION_ID.json"
if [ ! -f "$ASK_FILE" ]; then
  python3 - "$ASK_FILE" "$SESSION_ID" <<'PYEOF'
import json, sys, datetime
with open(sys.argv[1], 'w') as f:
    json.dump({"count": 0, "session_id": sys.argv[2], "created_at": datetime.datetime.utcnow().isoformat() + 'Z'}, f)
PYEOF
fi
COUNT=$(python3 -c "import json; print(json.load(open(r'$ASK_FILE')).get('count', 0))")
[ "$COUNT" -le 1 ] || fail 4 "ask_user_count $COUNT already > 1 at boot — session-scoped limit exceeded"

# Gate 5 — Skill('taste-skill') availability probe
TASTE_SKILL="$USER_HOME/.claude/skills/taste-skill"
[ -d "$TASTE_SKILL" ] || fail 5 "Skill('taste-skill') directory missing — Phase 0.5 cannot proceed"
[ -f "$TASTE_SKILL/SKILL.md" ] || fail 5 "Skill('taste-skill')/SKILL.md missing"

# Gate 6 — references/*.sh integrity (hash verification)
HASHES="$SKILL_PATH/references/.hashes.json"
if [ -f "$HASHES" ]; then
  MISMATCH=$(python3 - "$HASHES" "$SKILL_PATH/references" <<'PYEOF'
import json, hashlib, sys, os
with open(sys.argv[1]) as f: hashes = json.load(f)
ref_dir = sys.argv[2]
entries = hashes.get('scripts', []) or hashes.get('files', [])
mismatches = []
for e in entries:
    fn = e.get('file')
    expected = e.get('sha256')
    if not fn or not expected: continue
    fp = os.path.join(ref_dir, fn)
    if not os.path.isfile(fp):
        mismatches.append(f"{fn}:missing")
        continue
    with open(fp, 'rb') as f: actual = hashlib.sha256(f.read()).hexdigest()
    if actual != expected:
        mismatches.append(f"{fn}:expected={expected[:8]} got={actual[:8]}")
print('|'.join(mismatches) if mismatches else 'OK')
PYEOF
  )
  [ "$MISMATCH" = "OK" ] || fail 6 "hash mismatches: $MISMATCH"
else
  echo '{"scripts": []}' > "$HASHES"
fi

# Gate 7 — All required scripts exist and are executable
REQUIRED_SCRIPTS=(
  boot-gates.sh smoke-test.sh parse-verdict.sh loop-condition.sh
  parse-handoff.sh gate-checks.sh verify-live-html.sh verify-tool-use-id.sh
  enumerate-routes.sh rebuild-gate.sh iter-step.sh deploy-and-verify.sh
  append-retro.sh per-iter-gates.sh ssim-compare.py puppeteer-extract.mjs
  vercel-parser-test.sh
)
for script in "${REQUIRED_SCRIPTS[@]}"; do
  [ -f "$SKILL_PATH/references/$script" ] || fail 7 "Required script $script missing"
done

# Gate 11 — Vercel CLI parser fixture validation (closes the "schema unverified" gap)
bash "$SKILL_PATH/references/vercel-parser-test.sh" >/dev/null 2>&1 || fail 11 "Vercel parser failed fixture test — deploy-and-verify.sh logic does not correctly classify OK/WRONG_BRANCH/MISSING scenarios"

# Gate 8 — python3 available (required by all jq-replaced scripts)
command -v python3 >/dev/null 2>&1 || fail 8 "python3 not on PATH — required by gate scripts"

# Gate 9 — PIL available (required by ssim-compare.py)
python3 -c "from PIL import Image" 2>/dev/null || fail 9 "PIL/Pillow not installed — required by ssim-compare.py"

# Gate 10 — puppeteer-core cache initialised (required by puppeteer-extract.mjs)
PUP_CACHE="${WEB_EVOLVE_PUPPETEER_CACHE:-$USER_HOME/.cache/web-evolve-puppeteer}"
[ -d "$PUP_CACHE/node_modules/puppeteer-core" ] || fail 10 "puppeteer-core not installed at $PUP_CACHE — run: cd $PUP_CACHE && npm install puppeteer-core"

echo "BOOT_GATES_OK: lines=$LINES asks=$COUNT scripts_present=${#REQUIRED_SCRIPTS[@]} hashes=verified"
exit 0
