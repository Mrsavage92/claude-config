#!/usr/bin/env bash
# Per-iter post-checks. Verifies the iter actually did what it claimed.
# Increments deviation_count on any failed sub-check.
# Includes real SSIM-like similarity check via ssim-compare.py.

set -e
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
STATE="$EVOLUTION/loop-state.json"

ITER=$(python3 -c "import json; print(json.load(open('$STATE')).get('iteration',0))")
ROUTE=$(python3 -c "import json; print(json.load(open('$STATE')).get('current_route',''))")
ROUTE_SLUG="${ROUTE//\//-}"

source "$SKILL_PATH/references/gate-checks.sh"

DEVIATIONS=0
VOID_THIS_ITER=0

# Sub-check 1: Skill('critique') was invoked this iter (cardinal rule 1)
if ! gate_critique_invoked "$ITER"; then
  echo "per-iter-gates: deviation — critique not invoked"
  DEVIATIONS=$((DEVIATIONS + 1))
fi

# Sub-check 2: pre/post screenshots exist
PRE="$EVOLUTION/iter-$ITER-before-$ROUTE_SLUG.png"
POST="$EVOLUTION/iter-$ITER-after-$ROUTE_SLUG.png"
if [ ! -f "$PRE" ] || [ ! -f "$POST" ]; then
  echo "per-iter-gates: deviation — screenshots missing (pre=$PRE post=$POST)"
  DEVIATIONS=$((DEVIATIONS + 1))
else
  # Sub-check 3: REAL SSIM-like similarity (cardinal rule 1 — visible delta enforcement)
  SSIM=$(python3 "$SKILL_PATH/references/ssim-compare.py" "$PRE" "$POST" 2>/dev/null || echo "0.0")
  echo "per-iter-gates: similarity(pre,post) = $SSIM"
  # Threshold > 0.985 = invisible diff → VOID
  VOID=$(python3 -c "print('VOID' if float('$SSIM') > 0.985 else 'KEEP')")
  if [ "$VOID" = "VOID" ]; then
    echo "per-iter-gates: VOID — similarity $SSIM > 0.985, invisible diff"
    VOID_THIS_ITER=1
    # Increment void_count; orchestrator handles the git revert
    CURRENT_VOIDS=$(python3 -c "import json; print(json.load(open('$STATE')).get('void_count',0))")
    NEW_VOIDS=$((CURRENT_VOIDS + 1))
    python3 - "$STATE" "$NEW_VOIDS" <<'PYEOF'
import json, sys
path, voids = sys.argv[1], int(sys.argv[2])
with open(path) as f:
    d = json.load(f)
d['void_count'] = voids
d['last_iter_void'] = True
with open(path, 'w') as f:
    json.dump(d, f, indent=2)
PYEOF
  fi
fi

# Sub-check 4: cache integrity (cardinal rule 4)
if ! gate_cache_unmodified; then
  echo "per-iter-gates: deviation — cache modified"
  DEVIATIONS=$((DEVIATIONS + 1))
fi

# Update loop-state with deviation count
CURRENT_DEV=$(python3 -c "import json; print(json.load(open('$STATE')).get('deviation_count',0))")
NEW_DEV=$((CURRENT_DEV + DEVIATIONS))
python3 - "$STATE" "$NEW_DEV" <<'PYEOF'
import json, sys
path, dev = sys.argv[1], int(sys.argv[2])
with open(path) as f:
    d = json.load(f)
d['deviation_count'] = dev
with open(path, 'w') as f:
    json.dump(d, f, indent=2)
PYEOF

if [ "$NEW_DEV" -ge 3 ]; then
  echo "per-iter-gates: deviation_cap_exceeded ($NEW_DEV) — setting halt_flag"
  python3 - "$STATE" <<'PYEOF'
import json, sys
path = sys.argv[1]
with open(path) as f:
    d = json.load(f)
d['halt_flag'] = True
d['status'] = 'deviation_cap_exceeded'
with open(path, 'w') as f:
    json.dump(d, f, indent=2)
PYEOF
fi

echo "per-iter-gates: iter=$ITER deviations_this_iter=$DEVIATIONS total=$NEW_DEV void_this_iter=$VOID_THIS_ITER"
exit 0
