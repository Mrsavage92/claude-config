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
RESULT=$(JSON_PAYLOAD="$JSON" python3 - <<'PYEOF'
import json, os, re, sys, base64

try:
    d = json.loads(os.environ.get("JSON_PAYLOAD", ""))
except Exception as e:
    print(f"REJECT: invalid JSON: {e}")
    sys.exit(1)

def req(field, pattern, default=None):
    v = d.get(field, default)
    if v is None or v == 'null':
        return f"REJECT: field .{field} missing or null"
    if not re.fullmatch(pattern, str(v)):
        return f"REJECT: .{field} value {v!r} does not match /{pattern}/"
    return None

errs = []
e = req('verdict', r'(PASS|FAIL_REBUILD|FAIL_REFINE|FAIL_VOID|INVALID)')
if e: errs.append(e)
# Accept either a real harness tool_use_id (toolu_XXX) OR the honest sentinel
# ABORT_CANNOT_INTROSPECT, which means the sub-agent verified it read the
# screenshot but the harness does not expose the tool_use_id in its context.
# Anti-hallucination protection then falls to verify-live-html.sh (the real
# ground-truth check: compares extracted_strings vs puppeteer-extracted live H1/CTA/pricing).
e = req('tool_use_id_for_screenshot_read', r'(toolu_[A-Za-z0-9]+|ABORT_CANNOT_INTROSPECT)')
if e: errs.append(e)

vq_raw = d.get('vq_aggregate', '')
try:
    vq_f = float(vq_raw)
except Exception:
    vq_f = None
vq_valid = vq_f is not None and 0.0 <= vq_f <= 5.0
if not vq_valid:
    errs.append(f"REJECT: vq_aggregate {vq_raw!r} not in [0.0, 5.0]")

checklist_fails = d.get('checklist_fails')
taste_violations = d.get('taste_violations')
if not isinstance(checklist_fails, list):
    errs.append("REJECT: checklist_fails not array")
    checklist_fails = []
if not isinstance(taste_violations, list):
    errs.append("REJECT: taste_violations not array")
    taste_violations = []

# Banned-phrase scan (base64-decoded at runtime — literal strings not in source)
BANNED = base64.b64decode("Y29tcHJlaGVuc2l2ZXxyb2J1c3R8cHJvZHVjdGlvbi1yZWFkeXx3b3JsZC1jbGFzc3xwcmVtaXVtfHBlcmZlY3R8MTAvMTB8c2hpdCBob3R8YmVzdC1pbi1jbGFzc3xlbnRlcnByaXNlLWdyYWRlfGJhdHRsZS10ZXN0ZWQ=").decode()
payload = json.dumps(d)
hits = re.findall(BANNED, payload, re.IGNORECASE)
if hits:
    errs.append(f"REJECT: banned phrase(s) in response: {sorted(set(hits))}")

# Deterministic verdict cross-check
cf = len(checklist_fails)
tv = len(taste_violations)
if not vq_valid:
    vq_f = 0.0
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
