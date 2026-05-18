#!/usr/bin/env bash
# Token-vocab regex validator for Skill('critique') responses.
# Reads JSON from stdin, exits 0 if every field matches its constrained vocab.
# Cardinal rules 1, 8 — anything outside the vocab is __invalid__, no auto-recovery.
# Uses python3 (no jq dependency).

set +e  # capture python's exit code explicitly; do not let set-e abort before RC check
export MSYS_NO_PATHCONV=1

JSON=$(cat)

# All validation in a single python pass for clarity. stderr goes straight through so
# REJECT messages are visible to the orchestrator; stdout captured for RESULT.
RESULT=$(python3 - <<PYEOF
import json, re, sys, base64

try:
    d = json.loads("""$JSON""")
except Exception as e:
    print(f"REJECT: invalid JSON: {e}")
    sys.exit(1)

def req(field, pattern, default=None):
    v = d.get(field, default)
    if v is None or v == 'null':
        return f"REJECT: field .{field} missing or null"
    if not re.match(pattern, str(v)):
        return f"REJECT: .{field} value {v!r} does not match /{pattern}/"
    return None

errs = []
e = req('verdict', r'^(PASS|FAIL_REBUILD|FAIL_REFINE|FAIL_VOID|INVALID)\$')
if e: errs.append(e)
e = req('tool_use_id_for_screenshot_read', r'^toolu_[A-Za-z0-9]+\$')
if e: errs.append(e)

vq = str(d.get('vq_aggregate', ''))
if not re.match(r'^[0-5](\.[0-9]+)?\$', vq):
    errs.append(f"REJECT: vq_aggregate {vq!r} not in [0.0, 5.0]")

if not isinstance(d.get('checklist_fails'), list):
    errs.append("REJECT: checklist_fails not array")
if not isinstance(d.get('taste_violations'), list):
    errs.append("REJECT: taste_violations not array")

# Banned-phrase scan (base64-decoded at runtime — literal strings not in source)
BANNED = base64.b64decode("Y29tcHJlaGVuc2l2ZXxyb2J1c3R8cHJvZHVjdGlvbi1yZWFkeXx3b3JsZC1jbGFzc3xwcmVtaXVtfHBlcmZlY3R8MTAvMTB8c2hpdCBob3R8YmVzdC1pbi1jbGFzc3xlbnRlcnByaXNlLWdyYWRlfGJhdHRsZS10ZXN0ZWQ=").decode()
payload = json.dumps(d)
hits = re.findall(BANNED, payload, re.IGNORECASE)
if hits:
    errs.append(f"REJECT: banned phrase(s) in response: {sorted(set(hits))}")

# Deterministic verdict cross-check
cf = len(d.get('checklist_fails', []))
tv = len(d.get('taste_violations', []))
try: vq_f = float(d.get('vq_aggregate', 0))
except: vq_f = 0.0
if cf >= 2 or tv >= 1:
    expected = 'FAIL_REBUILD'
elif cf == 1 and tv == 0:
    expected = 'FAIL_REFINE' if vq_f >= 2.0 else 'FAIL_VOID'
elif cf == 0 and tv == 0:
    expected = 'PASS' if vq_f >= 3.5 else 'FAIL_VOID'
else:
    expected = 'FAIL_VOID'
got = d.get('verdict')
if got != expected:
    errs.append(f"REJECT: verdict {got!r} does not match deterministic mapping (expected {expected!r}; cf={cf} tv={tv} vq={vq_f})")

if errs:
    for e in errs: print(e)
    sys.exit(1)
print(f"OK: verdict={got} vq={vq_f} checklist_fails={cf} taste_violations={tv}")
sys.exit(0)
PYEOF
)
RC=$?
echo "$RESULT"
exit $RC
