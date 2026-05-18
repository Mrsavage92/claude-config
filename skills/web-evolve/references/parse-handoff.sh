#!/usr/bin/env bash
# Phase-to-phase handoff parser. Validates JSON against the named phase's schema.
# Malformed entries dropped, not auto-repaired. Cardinal rules 4, 8.
# Uses python3 (no jq dependency).

set +e  # do NOT auto-exit on non-zero — we need to capture python's exit code explicitly
export MSYS_NO_PATHCONV=1

USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"

PHASE="$1"
INPUT="${2:-/dev/stdin}"
[ -n "$PHASE" ] || { echo "USAGE: parse-handoff.sh <phase-name> [<input-json-path>]"; exit 2; }

SKILL_PATH="$USER_HOME/.claude/skills/web-evolve"
SCHEMA="$SKILL_PATH/references/schemas/$PHASE.json"
[ -f "$SCHEMA" ] || { echo "REJECT: schema $SCHEMA missing for phase $PHASE" >&2; exit 1; }

PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
# Normalize MSYS-style PROJECT_PATH (/c/...) to Windows-style (C:/...) for python compatibility
if [[ "$PROJECT_PATH" =~ ^/([a-zA-Z])/ ]]; then
  drive="${BASH_REMATCH[1]^^}"
  PROJECT_PATH="${drive}:/${PROJECT_PATH:3}"
fi
FAILURES="$PROJECT_PATH/.evolution/parse-failures.json"
mkdir -p "$PROJECT_PATH/.evolution"
[ -f "$FAILURES" ] || echo '{"entries": []}' > "$FAILURES"

# Pass JSON via stdin (NOT via heredoc substitution — avoids escaping bugs)
JSON_INPUT=$(cat "$INPUT")

# Single python invocation; stdout = validated JSON or REJECT message; exit code = real
python3 - "$SCHEMA" "$PHASE" "$FAILURES" "$JSON_INPUT" <<'PYEOF'
import json, re, sys, base64, datetime

schema_path, phase, fail_path, json_text = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]

try:
    payload = json.loads(json_text)
except Exception as e:
    print(f"REJECT: invalid JSON: {e}", file=sys.stderr)
    sys.exit(1)

with open(schema_path) as f:
    schema = json.load(f)

required = schema.get('required', [])
missing = [k for k in required if k not in payload]
if missing:
    try:
        with open(fail_path) as f: fails = json.load(f)
    except Exception:
        fails = {'entries': []}
    fails.setdefault('entries', []).append({
        'phase': phase,
        'reason': f"missing fields: {missing}",
        'dropped_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'raw': payload,
    })
    with open(fail_path, 'w') as f: json.dump(fails, f, indent=2)
    print(f"REJECT: missing fields: {missing}", file=sys.stderr)
    sys.exit(1)

enums = schema.get('enums', {})
for field, allowed in enums.items():
    val = payload.get(field)
    if val is not None and val not in allowed:
        print(f"REJECT: enum violation: {field}={val!r} not in {allowed}", file=sys.stderr)
        sys.exit(1)

# Banned-phrase scan (base64-decoded — literal phrases not in source)
BANNED = base64.b64decode(
    "Y29tcHJlaGVuc2l2ZXxyb2J1c3R8cHJvZHVjdGlvbi1yZWFkeXx3b3JsZC1jbGFzc3xwcmVtaXVtfHBlcmZlY3R8MTAvMTB8c2hpdCBob3R8YmVzdC1pbi1jbGFzc3xlbnRlcnByaXNlLWdyYWRlfGJhdHRsZS10ZXN0ZWQ="
).decode()
text = json.dumps(payload)
hits = re.findall(BANNED, text, re.IGNORECASE)
if hits:
    print(f"REJECT: banned phrase(s): {sorted(set(hits))}", file=sys.stderr)
    sys.exit(1)

# Validated — emit the JSON on stdout for the next phase
print(json.dumps(payload))
sys.exit(0)
PYEOF
RC=$?
exit $RC
