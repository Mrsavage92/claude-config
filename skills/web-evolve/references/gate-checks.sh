#!/usr/bin/env bash
# Library of gate-check functions. Each returns exit code (0 = pass, non-0 = fail).
# Cardinal rule 3: gates are bash, not LLM prose.
# Uses python3 (no jq dependency).

export MSYS_NO_PATHCONV=1
USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"
PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
# Normalize MSYS-style PROJECT_PATH (/c/...) to Windows-style (C:/...) for python compatibility
if [[ "$PROJECT_PATH" =~ ^/([a-zA-Z])/ ]]; then
  drive="${BASH_REMATCH[1]^^}"
  PROJECT_PATH="${drive}:/${PROJECT_PATH:3}"
fi
SKILL_PATH="$USER_HOME/.claude/skills/web-evolve"
EVOLUTION="$PROJECT_PATH/.evolution"

# Gate 1 — Skill('critique') invoked at every required point
gate_critique_invoked() {
  local expected_count="${1:-0}"
  local log="${TOOL_USE_LOG:-$USER_HOME/.claude/tool-use.log}"
  local session="${CLAUDE_SESSION_ID:-}"
  [ -f "$log" ] || { echo "gate_critique_invoked: log missing" >&2; return 1; }
  local actual
  actual=$(python3 - "$log" "$session" <<'PYEOF'
import sys, re
log_path, session = sys.argv[1], sys.argv[2]
count = 0
try:
    with open(log_path, 'r', errors='ignore') as f:
        for line in f:
            if 'Skill' in line and 'critique' in line:
                if not session or session in line:
                    count += 1
    print(count)
except Exception:
    print(0)
PYEOF
  )
  if [ "$actual" -lt "$expected_count" ]; then
    echo "gate_critique_invoked: expected $expected_count, found $actual" >&2
    return 1
  fi
  echo "gate_critique_invoked: OK ($actual >= $expected_count)"
  return 0
}

# Gate 2 — Hook smoke-test passed (orchestrator sets flag after observing block)
gate_smoke_test_passed() {
  local flag="$EVOLUTION/.smoke-test-passed"
  [ -f "$flag" ] || { echo "gate_smoke_test_passed: flag $flag missing" >&2; return 1; }
  grep -q "PASSED" "$flag" || { echo "gate_smoke_test_passed: flag does not contain PASSED" >&2; return 1; }
  echo "gate_smoke_test_passed: OK"
  return 0
}

# Gate 3 — Cache files unmodified (hash integrity)
gate_cache_unmodified() {
  local hashes="$EVOLUTION/.hashes.json"
  [ -f "$hashes" ] || { echo "gate_cache_unmodified: .hashes.json missing" >&2; return 1; }
  local result
  result=$(python3 - "$hashes" "$EVOLUTION" <<'PYEOF'
import json, hashlib, sys, os
with open(sys.argv[1]) as f: hashes = json.load(f)
base = sys.argv[2]
entries = hashes.get('files', []) or hashes.get('scripts', [])
mismatches = []
for e in entries:
    fn = e.get('file'); expected = e.get('sha256')
    if not fn or not expected: continue
    fp = os.path.join(base, fn)
    if not os.path.isfile(fp):
        mismatches.append(f"{fn}:missing"); continue
    with open(fp, 'rb') as f: actual = hashlib.sha256(f.read()).hexdigest()
    if actual != expected:
        mismatches.append(f"{fn}:hash_mismatch")
print('|'.join(mismatches) if mismatches else 'OK')
PYEOF
  )
  if [ "$result" != "OK" ]; then
    echo "gate_cache_unmodified: $result" >&2
    return 1
  fi
  echo "gate_cache_unmodified: OK"
  return 0
}

# Gate 4 — Live-HTML matches every page-baseline entry
gate_live_html_matches() {
  local baseline="$EVOLUTION/page-baselines.json"
  [ -f "$baseline" ] || { echo "gate_live_html_matches: baseline missing" >&2; return 1; }
  local routes
  routes=$(python3 -c "import json; [print(r.get('route','')) for r in json.load(open(r'$baseline')).get('routes', [])]")
  local rejects=0
  while IFS= read -r route; do
    [ -z "$route" ] && continue
    if ! bash "$SKILL_PATH/references/verify-live-html.sh" "$route" >/dev/null 2>&1; then
      rejects=$((rejects + 1))
    fi
  done <<< "$routes"
  [ "$rejects" -eq 0 ] || { echo "gate_live_html_matches: $rejects mismatches" >&2; return 1; }
  echo "gate_live_html_matches: OK"
  return 0
}

# Gate 5 — Retro authored by independent agent (cardinal rule 6)
gate_retro_independent() {
  local hashes="$EVOLUTION/.hashes.json"
  [ -f "$hashes" ] || { echo "gate_retro_independent: hashes missing" >&2; return 1; }
  local written_by
  written_by=$(python3 - "$hashes" <<'PYEOF'
import json, sys
with open(sys.argv[1]) as f: d = json.load(f)
entries = d.get('files', []) or d.get('scripts', [])
for e in entries:
    if e.get('file') == 'trajectory.json':
        print(e.get('written_by','UNKNOWN')); break
else:
    print('NOT_FOUND')
PYEOF
  )
  if [ "$written_by" != "append-retro.sh" ]; then
    echo "gate_retro_independent: trajectory.json last written by '$written_by', not append-retro.sh" >&2
    return 1
  fi
  echo "gate_retro_independent: OK"
  return 0
}

# Gate 6 — Vercel preview env vars correctly scoped
gate_vercel_preview_scoped() {
  local state="$EVOLUTION/loop-state.json"
  [ -f "$state" ] || { echo "gate_vercel_preview_scoped: state missing" >&2; return 1; }
  local soft
  soft=$(python3 -c "import json; print(json.load(open(r'$state')).get('soft_degrade_active', False))")
  if [ "$soft" = "True" ]; then
    echo "gate_vercel_preview_scoped: soft_degrade_active flag set" >&2
    return 1
  fi
  echo "gate_vercel_preview_scoped: OK"
  return 0
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  fails=0
  for fn in gate_critique_invoked gate_smoke_test_passed gate_cache_unmodified gate_retro_independent gate_vercel_preview_scoped; do
    if ! $fn 2>&1; then fails=$((fails + 1)); fi
  done
  [ "$fails" -eq 0 ] && { echo "gate-checks: all green"; exit 0; }
  echo "gate-checks: $fails failures"
  exit 1
fi
