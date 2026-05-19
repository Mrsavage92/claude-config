#!/usr/bin/env bash
# lint-typography-pairing.sh — refuses globals.css that uses the same font stack for
# --font-display and --font-body.
#
# Mechanical fix for forge baseline: both var(--font-display) and var(--font-body)
# resolved to var(--font-geist-sans). No pairing strategy.

set -euo pipefail

CSS_FILE="${1:?usage: lint-typography-pairing.sh <globals.css>}"

if [[ ! -f "$CSS_FILE" ]]; then
  echo "ERROR: file not found: $CSS_FILE" >&2
  exit 1
fi

# Extract the right-hand side of --font-display and --font-body declarations
DISPLAY=$(grep -E '^\s*--font-display\s*:' "$CSS_FILE" | head -n 1 | sed -E 's/^.*--font-display\s*:\s*([^;]*);.*/\1/' | xargs)
BODY=$(grep -E '^\s*--font-body\s*:' "$CSS_FILE" | head -n 1 | sed -E 's/^.*--font-body\s*:\s*([^;]*);.*/\1/' | xargs)

if [[ -z "$DISPLAY" || -z "$BODY" ]]; then
  echo "WARN: --font-display or --font-body not found in $CSS_FILE. Pairing lint skipped." >&2
  echo "  If this is intentional (e.g. site uses one font), add // craft: single-font-allowed comment." >&2
  exit 0
fi

if [[ "$DISPLAY" == "$BODY" ]]; then
  echo "ERROR: typography pairing failed in $CSS_FILE." >&2
  echo "  --font-display = $DISPLAY" >&2
  echo "  --font-body    = $BODY" >&2
  echo "  Both resolve to the same stack. A real pairing strategy uses distinct families per role." >&2
  echo "  Override: add a comment '/* craft: single-font-allowed reason: <ref> */' near the declarations." >&2
  if grep -E '^\s*/\*\s*craft:\s*single-font-allowed' "$CSS_FILE" > /dev/null; then
    echo "  Override comment found — exiting 0 with warning." >&2
    exit 0
  fi
  exit 2
fi

echo "Typography pairing OK: display=$DISPLAY, body=$BODY"
