#!/usr/bin/env bash
# strip-banned-phrases.sh — scans a text file (or stdin) for banned self-praise phrases.
# Exit 0 if clean, exit 3 if any phrase found (printing each occurrence).
#
# Banned list mirrors the user's [feedback_no_self_quality_claims] rule.
#
# Mechanical fix for "Comprehensive" appearing in the sync report (forge baseline finding).

set -euo pipefail

FILE="${1:-}"
if [[ -z "$FILE" ]]; then
  FILE=$(mktemp -t strip-stdin-XXXXXX.txt)
  cat > "$FILE"
  trap 'rm -f "$FILE"' EXIT
fi

if [[ ! -f "$FILE" ]]; then
  echo "ERROR: file not found: $FILE" >&2
  exit 1
fi

BANNED='comprehensive|robust|production-ready|world-class|premium|perfect|10/10|shit hot|epic|best-in-class|enterprise-grade|battle-tested|deeply|holistic|seamless|cutting-edge'

# -i: case-insensitive. Use word boundaries for short words to avoid false positives.
# Note: "epic" is common in casual text but banned here as a self-quality claim.
HITS=$(grep -in -E "\b($BANNED)\b" "$FILE" 2>/dev/null || true)

if [[ -n "$HITS" ]]; then
  echo "ERROR: banned self-praise phrases found in $FILE:" >&2
  echo "$HITS" >&2
  echo "" >&2
  echo "Strip these before emitting. Banned list: $BANNED" >&2
  exit 3
fi

echo "Banned-phrase scan clean: $FILE"
