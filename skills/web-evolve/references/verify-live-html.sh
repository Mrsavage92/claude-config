#!/usr/bin/env bash
# Phase A.4 live-HTML verification (cardinal rule 5).
# Compares an audit agent's extracted_strings (from page-baselines.json) against the live page.
# Exit 0 = match, entry stays. Exit 1 = mismatch, entry deleted, route re-queued.
# Closes failure mode 9 from .forge-spec.md (audit agent hallucinations).
#
# Strategy: try curl first (fast). If HTML body is minimal (SPA shell), fall back to node + puppeteer.

set -e

# Suppress MSYS/Git-Bash path conversion (otherwise "/" → "C:/Program Files/Git/")
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL='*'

USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"

PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
# Normalize MSYS-style PROJECT_PATH (/c/...) to Windows-style (C:/...) for python compatibility
if [[ "$PROJECT_PATH" =~ ^/([a-zA-Z])/ ]]; then
  drive="${BASH_REMATCH[1]^^}"
  PROJECT_PATH="${drive}:/${PROJECT_PATH:3}"
fi
SKILL_PATH="$USER_HOME/.claude/skills/web-evolve"
ROUTE="$1"
[ -n "$ROUTE" ] || { echo "USAGE: verify-live-html.sh <route-slug>"; exit 2; }

BASELINE="$PROJECT_PATH/.evolution/page-baselines.json"
[ -f "$BASELINE" ] || { echo "REJECT: page-baselines.json missing"; exit 1; }

# Pull JSON via python for portability (jq may not be on PATH)
CLAIMS=$(python3 - "$BASELINE" "$ROUTE" <<'PYEOF'
import json, sys
baseline_path, route = sys.argv[1], sys.argv[2]
with open(baseline_path) as f:
    d = json.load(f)
entry = next((r for r in d.get('routes', []) if r.get('route') == route), None)
if not entry:
    print('::NO_ENTRY::')
    sys.exit(0)
ext = entry.get('extracted_strings', {}) or {}
print('H1=' + (ext.get('h1') or ''))
print('CTA=' + (ext.get('primary_cta') or ''))
pricing = ext.get('visible_pricing', []) or []
for p in pricing:
    print('PRICE=' + p)
PYEOF
)

if echo "$CLAIMS" | grep -q "^::NO_ENTRY::$"; then
  echo "REJECT: no entry for route $ROUTE in page-baselines.json"
  exit 1
fi

CLAIMED_H1=$(echo "$CLAIMS" | grep "^H1=" | head -1 | sed 's/^H1=//')
CLAIMED_CTA=$(echo "$CLAIMS" | grep "^CTA=" | head -1 | sed 's/^CTA=//')
CLAIMED_PRICING=$(echo "$CLAIMS" | grep "^PRICE=" | sed 's/^PRICE=//')

# Live URL
LIVE_URL=$(python3 -c "import json; print(json.load(open('$PROJECT_PATH/.evolution/loop-state.json')).get('live_url',''))" 2>/dev/null)
[ -n "$LIVE_URL" ] || { echo "REJECT: live_url not set in loop-state.json"; exit 1; }
PROBE_URL="${LIVE_URL%/}/${ROUTE#/}"

# Step 1 — fetch via curl
LIVE_HTML=$(curl -fsSL --max-time 20 "$PROBE_URL" 2>/dev/null) || {
  echo "REJECT: live URL $PROBE_URL not reachable"
  exit 1
}

# SPA-shell detection: if body content is < 500 chars OR contains no <h1>/<button>/text,
# fall back to puppeteer render.
BODY_CHARS=$(echo "$LIVE_HTML" | tr -d '[:space:]' | wc -c)
HAS_H1=$(echo "$LIVE_HTML" | grep -c "<h1" || true)
NEEDS_PUPPETEER=0
if [ "$BODY_CHARS" -lt 500 ] || [ "$HAS_H1" -eq 0 ]; then
  NEEDS_PUPPETEER=1
fi

if [ "$NEEDS_PUPPETEER" -eq 1 ]; then
  echo "PUPPETEER_FALLBACK: curl HTML insufficient ($BODY_CHARS chars, h1_count=$HAS_H1). Rendering via node + puppeteer..." >&2
  # Use node + puppeteer-extract.mjs
  EXTRACTED_JSON=$(cd "$SKILL_PATH/references" && node puppeteer-extract.mjs "$PROBE_URL" 2>&1)
  PUPPETEER_RC=$?
  if [ "$PUPPETEER_RC" -ne 0 ]; then
    echo "REJECT: puppeteer render failed for $PROBE_URL: $EXTRACTED_JSON" >&2
    exit 1
  fi
  LIVE_H1=$(echo "$EXTRACTED_JSON" | python3 -c "import json,sys; print((json.loads(sys.stdin.read()).get('h1') or '').strip())")
  LIVE_CTA=$(echo "$EXTRACTED_JSON" | python3 -c "import json,sys; print((json.loads(sys.stdin.read()).get('primary_cta') or '').strip())")
  LIVE_PRICING=$(echo "$EXTRACTED_JSON" | python3 -c "import json,sys; [print(p) for p in json.loads(sys.stdin.read()).get('visible_pricing',[])]")
else
  # Curl-only path: extract from raw HTML
  LIVE_H1=$(echo "$LIVE_HTML" | grep -oP '<h1[^>]*>\K[^<]+' | head -1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  LIVE_CTA=""  # CTA extraction from raw HTML is unreliable — skip and let puppeteer-path handle SPAs
  LIVE_PRICING=$(echo "$LIVE_HTML" | grep -oP '[\$£€¥][0-9][0-9,]*(\.[0-9]+)?' | sort -u)
fi

# Compare H1
if [ -n "$CLAIMED_H1" ] && [ "$CLAIMED_H1" != "$LIVE_H1" ]; then
  echo "REJECT: $ROUTE H1 mismatch — claimed='$CLAIMED_H1' live='$LIVE_H1'" >&2
  python3 - "$BASELINE" "$ROUTE" <<'PYEOF'
import json, sys
path, route = sys.argv[1], sys.argv[2]
with open(path) as f:
    d = json.load(f)
d['routes'] = [r for r in d.get('routes', []) if r.get('route') != route]
with open(path, 'w') as f:
    json.dump(d, f, indent=2)
PYEOF
  echo "$ROUTE" >> "$PROJECT_PATH/.evolution/re-audit-queue.txt"
  exit 1
fi

# Compare pricing — every claimed pricing string must appear in live pricing
if [ -n "$CLAIMED_PRICING" ]; then
  while IFS= read -r claimed; do
    [ -z "$claimed" ] && continue
    if ! echo "$LIVE_PRICING" | grep -qF "$claimed"; then
      echo "REJECT: $ROUTE pricing '$claimed' not found in live page — hallucinated" >&2
      python3 - "$BASELINE" "$ROUTE" <<'PYEOF'
import json, sys
path, route = sys.argv[1], sys.argv[2]
with open(path) as f:
    d = json.load(f)
d['routes'] = [r for r in d.get('routes', []) if r.get('route') != route]
with open(path, 'w') as f:
    json.dump(d, f, indent=2)
PYEOF
      echo "$ROUTE" >> "$PROJECT_PATH/.evolution/re-audit-queue.txt"
      exit 1
    fi
  done <<< "$CLAIMED_PRICING"
fi

# Compare CTA (only when puppeteer was used — curl-path is unreliable for CTA)
if [ "$NEEDS_PUPPETEER" -eq 1 ] && [ -n "$CLAIMED_CTA" ] && [ "$CLAIMED_CTA" != "$LIVE_CTA" ]; then
  echo "WARN: $ROUTE CTA mismatch — claimed='$CLAIMED_CTA' live='$LIVE_CTA' (soft warn, not fatal)" >&2
  # Soft warn only — CTA detection heuristic in puppeteer-extract.mjs is approximate
fi

MODE=$([ "$NEEDS_PUPPETEER" -eq 1 ] && echo "puppeteer" || echo "curl")
PRICE_COUNT=$(echo "$LIVE_PRICING" | grep -c . || echo 0)
echo "OK: $ROUTE live-HTML matches agent claims (mode=$MODE h1='$LIVE_H1' pricing=$PRICE_COUNT)"
exit 0
