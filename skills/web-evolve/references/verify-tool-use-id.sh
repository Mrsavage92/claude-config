#!/usr/bin/env bash
# Phase A.2 tool-use-id verification (cardinal rule 1).
# Confirms an agent's claimed `tool_use_id_for_screenshot_read` actually appears in the transcript.
# Uses python3 (no jq dependency).

set -e
export MSYS_NO_PATHCONV=1

USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"

TOOL_USE_ID="$1"
[ -n "$TOOL_USE_ID" ] || { echo "USAGE: verify-tool-use-id.sh <toolu_id>"; exit 2; }

if ! echo "$TOOL_USE_ID" | grep -qE '^toolu_[A-Za-z0-9]+$'; then
  echo "REJECT: '$TOOL_USE_ID' is not a valid toolu_ ID" >&2
  exit 1
fi

TOOL_LOG="${TOOL_USE_LOG:-$USER_HOME/.claude/tool-use.log}"

if [ ! -f "$TOOL_LOG" ]; then
  echo "REJECT: tool-use log $TOOL_LOG missing — cannot verify" >&2
  exit 1
fi

RESULT=$(python3 - "$TOOL_LOG" "$TOOL_USE_ID" <<'PYEOF'
import sys, json, re
log_path, tool_use_id = sys.argv[1], sys.argv[2]
allowed_tools = {'Read', 'read', 'mcp__puppeteer__puppeteer_screenshot', 'mcp__chrome-devtools__take_screenshot'}
match_line = None
try:
    with open(log_path, 'r', errors='ignore') as f:
        for line in f:
            if tool_use_id in line:
                match_line = line.strip(); break
except Exception as e:
    print(f"REJECT:read fail:{e}"); sys.exit(1)
if not match_line:
    print(f"REJECT:tool_use_id {tool_use_id} not found in log"); sys.exit(1)

# Try to parse JSON-lines; fallback to regex tool-name extraction
tool = None
try:
    parsed = json.loads(match_line)
    tool = parsed.get('tool') or parsed.get('name') or parsed.get('tool_name')
except Exception:
    m = re.search(r'"tool"\s*:\s*"([^"]+)"', match_line) or re.search(r'"name"\s*:\s*"([^"]+)"', match_line)
    if m: tool = m.group(1)
if not tool:
    print(f"REJECT:could not extract tool name from log line"); sys.exit(1)
if tool not in allowed_tools:
    print(f"REJECT:tool_use_id {tool_use_id} exists but tool={tool} is not a screenshot/read call"); sys.exit(1)
print(f"OK:tool_use_id {tool_use_id} verified (tool={tool})")
sys.exit(0)
PYEOF
)
RC=$?
echo "$RESULT"
exit $RC
