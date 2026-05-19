#!/usr/bin/env bash
# scan-hallucinated-stats.sh — finds quantitative claims (%, scores) that aren't backed by
# a visible computation or an EVIDENCE: tag.
#
# Mechanical fix for the "65% we-dominant language" hallucination caught in the forge baseline.

set -euo pipefail

FILE="${1:?usage: scan-hallucinated-stats.sh <critique-artifact-path>}"

if [[ ! -f "$FILE" ]]; then
  echo "ERROR: file not found: $FILE" >&2
  exit 1
fi

# Find every line that has a percentage or a score-like number (e.g. "8/10", "X/100").
# For each hit, check that either:
#   (a) the same line contains "EVIDENCE:" or "// EVIDENCE:" or "computed:" or "source:", OR
#   (b) the previous 5 lines contain a code/bash block that would produce it (look for ```bash or ```python or a $(...) substitution).

hits=$(grep -nE '([0-9]+(\.[0-9]+)?%)|\b[0-9]+\s*/\s*(10|20|50|100)\b' "$FILE" || true)

if [[ -z "$hits" ]]; then
  echo "No quantitative claims found in $FILE."
  exit 0
fi

unsourced=()
while IFS= read -r hit_line; do
  LINE_NUM=$(echo "$hit_line" | cut -d: -f1)
  LINE_CONTENT=$(echo "$hit_line" | cut -d: -f2-)
  # Same-line source tag?
  if echo "$LINE_CONTENT" | grep -iE 'evidence:|computed:|source:|file:|line [0-9]+|excerpt:' > /dev/null; then
    continue
  fi
  # Preceding 5 lines contain a code/bash block opener or a $() substitution?
  START=$(( LINE_NUM > 5 ? LINE_NUM - 5 : 1 ))
  PREV=$(sed -n "${START},${LINE_NUM}p" "$FILE")
  if echo "$PREV" | grep -E '^```(bash|python|sh|js)|\$\(.+\)' > /dev/null; then
    continue
  fi
  unsourced+=("line $LINE_NUM: $LINE_CONTENT")
done <<< "$hits"

if (( ${#unsourced[@]} > 0 )); then
  echo "ERROR: unsourced quantitative claims in $FILE (need EVIDENCE: tag or a visible computation):" >&2
  for u in "${unsourced[@]}"; do echo "  - $u" >&2; done
  exit 3
fi

echo "Quantitative-claim scan clean: every number is sourced."
