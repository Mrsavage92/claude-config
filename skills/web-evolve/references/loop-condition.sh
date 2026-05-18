#!/usr/bin/env bash
# Phase C loop exit predicate. The ONLY way the loop ends.
# Reads loop-state.json. Exit 0 = continue. Exit non-0 = stop.
# Cardinal rule 9: the LLM has no path to ending the loop.
# Uses python3 (no jq dependency — jq is not on every user's PATH).

set -e
export MSYS_NO_PATHCONV=1

USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"

# Normalize PROJECT_PATH from MSYS-style (/c/Users/...) to Windows-style (C:/Users/...)
# so Python on Windows can open the file. Without this, the script silently fails-open.
PROJECT_PATH="${PROJECT_PATH:-.}"
if [[ "$PROJECT_PATH" =~ ^/([a-zA-Z])/ ]]; then
  drive="${BASH_REMATCH[1]^^}"
  PROJECT_PATH="${drive}:/${PROJECT_PATH:3}"
fi

STATE="$PROJECT_PATH/.evolution/loop-state.json"
[ -f "$STATE" ] || { echo "STOP: loop-state.json missing at $STATE" >&2; exit 10; }

# Read all needed fields in one python invocation
read ITERATION MAX CURRENT_SCORE TARGET DEVIATIONS VOIDS MAX_VOIDS HALT_FLAG <<EOF
$(python3 - "$STATE" <<'PYEOF'
import json, sys
with open(sys.argv[1]) as f: d = json.load(f)
print(
  d.get('iteration', 0),
  d.get('max_iterations', 5),
  d.get('current_score', 0),
  d.get('target_score', 90),
  d.get('deviation_count', 0),
  d.get('void_count', 0),
  d.get('max_voids', 3),
  str(d.get('halt_flag', False)).lower(),
)
PYEOF
)
EOF

if [ "$HALT_FLAG" = "true" ]; then
  echo "STOP: halt_flag set" >&2; exit 1
fi
if [ "$ITERATION" -ge "$MAX" ]; then
  echo "STOP: iteration $ITERATION >= max $MAX" >&2; exit 2
fi
if [ "$CURRENT_SCORE" -ge "$TARGET" ]; then
  echo "STOP: current_score $CURRENT_SCORE >= target $TARGET" >&2; exit 3
fi
if [ "$DEVIATIONS" -ge 3 ]; then
  echo "STOP: deviation_count $DEVIATIONS >= 3" >&2; exit 4
fi
if [ "$VOIDS" -ge "$MAX_VOIDS" ]; then
  echo "STOP: void_count $VOIDS >= max $MAX_VOIDS" >&2; exit 5
fi

# Ask counter session-scoped (cardinal rule 7)
SESSION_ID="${CLAUDE_SESSION_ID:-unknown}"
ASK_FILE="$USER_HOME/.claude/state/web-evolve-asks-$SESSION_ID.json"
if [ -f "$ASK_FILE" ]; then
  ASKS=$(python3 -c "import json; print(json.load(open(r'$ASK_FILE')).get('count', 0))")
  if [ "$ASKS" -gt 1 ]; then
    echo "STOP: ask_user_count $ASKS > 1 (session-scoped)" >&2; exit 6
  fi
fi

echo "CONTINUE: iter=$ITERATION/$MAX score=$CURRENT_SCORE/$TARGET devs=$DEVIATIONS voids=$VOIDS"
exit 0
