#!/usr/bin/env bash
# Phase R entry gate. Determines REBUILD vs REFINE mode.
# Uses python3 (no jq dependency).

set -e
export MSYS_NO_PATHCONV=1

PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
# Normalize MSYS-style PROJECT_PATH (/c/...) to Windows-style (C:/...) for python compatibility
if [[ "$PROJECT_PATH" =~ ^/([a-zA-Z])/ ]]; then
  drive="${BASH_REMATCH[1]^^}"
  PROJECT_PATH="${drive}:/${PROJECT_PATH:3}"
fi
EVOLUTION="$PROJECT_PATH/.evolution"
BASELINE="$EVOLUTION/page-baselines.json"
[ -f "$BASELINE" ] || { echo "REJECT: page-baselines.json missing"; exit 1; }

# Hash check (cardinal rule 4)
HASHES="$EVOLUTION/.hashes.json"
if [ -f "$HASHES" ]; then
  CHECK=$(python3 - "$HASHES" "$BASELINE" <<'PYEOF'
import json, hashlib, sys
with open(sys.argv[1]) as f: h = json.load(f)
entries = h.get('files', []) or h.get('scripts', [])
e = next((x for x in entries if x.get('file') == 'page-baselines.json'), None)
if not e:
    print('NO_HASH'); sys.exit(0)
with open(sys.argv[2], 'rb') as f: actual = hashlib.sha256(f.read()).hexdigest()
print('OK' if actual == e.get('sha256') else 'MISMATCH')
PYEOF
  )
  if [ "$CHECK" = "MISMATCH" ]; then
    echo "REJECT: page-baselines.json hash mismatch (cardinal rule 4)"
    exit 1
  fi
fi

REBUILD_Q="$EVOLUTION/rebuild-queue.txt"
REFINE_Q="$EVOLUTION/refine-queue.txt"
: > "$REBUILD_Q"
: > "$REFINE_Q"

# Build queues via python
python3 - "$BASELINE" "$REBUILD_Q" "$REFINE_Q" <<'PYEOF'
import json, sys
with open(sys.argv[1]) as f: d = json.load(f)
with open(sys.argv[2], 'w') as rb, open(sys.argv[3], 'w') as rf:
    for r in d.get('routes', []):
        v = r.get('verdict', '')
        if v == 'FAIL_REBUILD':
            rb.write(r.get('route', '') + '\n')
        elif v == 'FAIL_REFINE':
            rf.write(r.get('route', '') + '\n')
PYEOF

REBUILD_COUNT=$(grep -c . "$REBUILD_Q" 2>/dev/null || echo 0)
REFINE_COUNT=$(grep -c . "$REFINE_Q" 2>/dev/null || echo 0)
STATE="$EVOLUTION/loop-state.json"

if [ "$REBUILD_COUNT" -ge 1 ]; then
  python3 - "$STATE" "$REBUILD_COUNT" <<'PYEOF'
import json, sys
with open(sys.argv[1]) as f: d = json.load(f)
d['phase_r_mode'] = 'REBUILD'; d['rebuild_queue_count'] = int(sys.argv[2])
with open(sys.argv[1], 'w') as f: json.dump(d, f, indent=2)
PYEOF
  echo "MODE=REBUILD count=$REBUILD_COUNT (refine deferred until rebuild queue empty)"
else
  python3 - "$STATE" <<'PYEOF'
import json, sys
with open(sys.argv[1]) as f: d = json.load(f)
d['phase_r_mode'] = 'STANDARD'
with open(sys.argv[1], 'w') as f: json.dump(d, f, indent=2)
PYEOF
  echo "MODE=STANDARD (no rebuild needed)"
fi
exit 0
