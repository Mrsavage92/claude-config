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

to_windows_path() {
  local path="$1"
  if command -v wslpath >/dev/null 2>&1 && [[ "$path" == /mnt/* ]]; then
    wslpath -w "$path"
  else
    echo "$path"
  fi
}

if command -v powershell >/dev/null 2>&1; then
  POWERSHELL_BIN="powershell"
elif command -v powershell.exe >/dev/null 2>&1; then
  POWERSHELL_BIN="powershell.exe"
else
  POWERSHELL_BIN=""
fi

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

# Gate 2b — settings.json must actually register the guard for the tools it protects.
SETTINGS="$USER_HOME/.claude/settings.json"
[ -f "$SETTINGS" ] || fail 2 "settings.json missing — web-evolve-guard.ps1 may exist but is not registered"
SETTINGS_CHECK=$(python3 - "$SETTINGS" <<'PYEOF'
import json, re, sys
path = sys.argv[1]
try:
    with open(path, encoding="utf-8") as f:
        settings = json.load(f)
except Exception as e:
    print(f"PARSE_FAIL:{e}")
    sys.exit(0)

for entry in settings.get("hooks", {}).get("PreToolUse", []):
    matcher = entry.get("matcher", "")
    commands = " ".join(
        hook.get("command", "")
        for hook in entry.get("hooks", [])
        if isinstance(hook, dict)
    )
    if "web-evolve-guard.ps1" not in commands:
        continue
    required = {"Write", "Edit", "MultiEdit", "AskUserQuestion"}
    present = {token for token in required if re.search(rf"(^|\|){re.escape(token)}($|\|)", matcher)}
    if present == required:
        print("OK")
        break
else:
    print("MISSING_REGISTRATION")
PYEOF
)
[ "$SETTINGS_CHECK" = "OK" ] || fail 2 "web-evolve-guard.ps1 not registered for Write|Edit|MultiEdit|AskUserQuestion in settings.json ($SETTINGS_CHECK)"

# Gate 3 — Hook RUNTIME test (not just contract). Directly invoke the PowerShell hook
# with a synthesized payload that simulates an Edit to .evolution/* during an active iter,
# and assert the hook returns exit 2 with the BLOCKED message.
[ -f "$SKILL_PATH/references/smoke-test.sh" ] || fail 3 "smoke-test.sh missing"

# Build a transient fixture project for the hook to walk up from.
# Use a Windows-style path under the user's home so PowerShell doesn't see MSYS /tmp paths.
HOOK_TEST_DIR="$USER_HOME/.claude/skills/web-evolve-workspace/.boot-gates-hook-test-$$"
rm -rf "$HOOK_TEST_DIR"
mkdir -p "$HOOK_TEST_DIR/.evolution"
echo '{"iteration":1,"current_checks":["A1"],"ask_user_count":0,"deviation_count":0}' > "$HOOK_TEST_DIR/.evolution/loop-state.json"
# Hook also checks for taste-rules.md presence — provide a stub so it doesn't bail on Principle 0
echo '# stub' > "$HOOK_TEST_DIR/.evolution/taste-rules.md"

HOOK_TEST_DIR_WIN="$(to_windows_path "$HOOK_TEST_DIR")"
GUARD_WIN="$(to_windows_path "$GUARD")"
if [[ "$HOOK_TEST_DIR_WIN" =~ ^[A-Za-z]:\\ ]]; then
  TARGET_FILE="${HOOK_TEST_DIR_WIN}\\.evolution\\test-target.json"
else
  TARGET_FILE="$HOOK_TEST_DIR_WIN/.evolution/test-target.json"
fi

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
[ -n "$POWERSHELL_BIN" ] || fail 3 "PowerShell not found — cannot runtime-test web-evolve-guard.ps1"
HOOK_OUTPUT=$(echo "$HOOK_PAYLOAD" | "$POWERSHELL_BIN" -NonInteractive -ExecutionPolicy Bypass -File "$GUARD_WIN" 2>&1)
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
SMOKE_OUT=$(bash "$SKILL_PATH/references/smoke-test.sh" 2>&1) || fail 3 "smoke-test.sh non-zero exit"
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

# Gate 10 — puppeteer-core cache initialised AND module entry resolvable
PUP_CACHE="${WEB_EVOLVE_PUPPETEER_CACHE:-$USER_HOME/.cache/web-evolve-puppeteer}"
PUP_ENTRY_NEW="$PUP_CACHE/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js"
PUP_ENTRY_OLD="$PUP_CACHE/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js"
if [ ! -f "$PUP_ENTRY_NEW" ] && [ ! -f "$PUP_ENTRY_OLD" ]; then
  fail 10 "puppeteer-core entry not resolvable at $PUP_CACHE — run:
    mkdir -p \"$PUP_CACHE\" && cd \"$PUP_CACHE\" &&
    echo '{\"name\":\"web-evolve-puppeteer-cache\",\"private\":true,\"version\":\"1.0.0\",\"type\":\"module\"}' > package.json &&
    PUPPETEER_SKIP_DOWNLOAD=true npm install puppeteer-core"
fi

# Gate 12 — Prior-run Phase D status. If a project trajectory exists and the most
# recent run did NOT pass Phase D, this run must Phase D before starting new iters.
# Prevents the failure mode where Run N+1 plows ahead while Run N's commits are
# unpushed/undeployed and the user sees no live change.
if [ -d "$PROJECT_PATH/.evolution" ] && [ -f "$PROJECT_PATH/.evolution/trajectory.json" ]; then
  set +e
  PHASE_D_CHECK=$(python3 - "$PROJECT_PATH/.evolution/trajectory.json" <<'PYEOF'
import json, sys
with open(sys.argv[1]) as f: t = json.load(f)
runs = t.get('runs', [])
if not runs:
    print('OK:no-prior-runs'); sys.exit(0)
last = runs[-1]
real_iters = int(last.get('real_iterations', 0) or 0)
# If the last run did any real iters, it must record verified_gates including RULE_PHASE_D_VERIFIED
# or include 'phase_d_verified: true'. Absent => carryover deploy debt.
deploy_verified = (
    last.get('phase_d_verified') is True
    or 'RULE_PHASE_D_VERIFIED' in (last.get('verified_gates') or [])
)
if real_iters > 0 and not deploy_verified:
    print(f"WARN:run_id={last.get('run_id')} had {real_iters} iters but no Phase D verification recorded"); sys.exit(1)
print('OK:phase-d-current'); sys.exit(0)
PYEOF
  )
  PHASE_D_RC=$?
  set -e
  if [ $PHASE_D_RC -ne 0 ]; then
    # WARNING not HALT — carryover deploy debt is a user decision (they may have deployed
    # manually outside the skill). Surface it loudly but do not block resumption.
    echo "BOOT_WARN_12: $PHASE_D_CHECK" >&2
    echo "  Prior run committed iter work but Phase D verification was not recorded." >&2
    echo "  If the commit is unpushed/undeployed, the live site does not reflect it." >&2
    echo "  Run: bash $SKILL_PATH/references/deploy-and-verify.sh   (or push manually + re-run)" >&2
  fi
fi

echo "BOOT_GATES_OK: lines=$LINES asks=$COUNT scripts_present=${#REQUIRED_SCRIPTS[@]} hashes=verified"
exit 0
