#!/usr/bin/env bash
# validate-output.sh — verifies a critique artifact has all required sections.
# Fails if the output is prose-only (the forge baseline defect: Artifact B had no scoring table).
#
# Required sections (case-insensitive substring match):
#   1. Score / scoring table — contains "score" with numeric values
#   2. Persona section — contains "persona" or one of the persona names from references/personas.md
#   3. Anti-pattern section — contains "anti-pattern" or "anti pattern"
#   4. Evidence citations — at least 3 instances of "file:line", "screenshot", or "section:"
#   5. Verdict — contains "verdict" or "REBUILD" or "REFINE" or "SHIP"

set -euo pipefail

FILE="${1:?usage: validate-output.sh <critique-artifact-path>}"

if [[ ! -f "$FILE" ]]; then
  echo "ERROR: critique artifact not found: $FILE" >&2
  exit 1
fi

fail=0
fail_msgs=()

# 1. Score / scoring table — accept any of: "score:" near a number, "X / 5" or "X/10" patterns, or a dimension-name colon-number pattern
HAS_SCORE_KW=$(grep -ciE '\b(score|rating|vq|verdict)\b' "$FILE" || true)
HAS_NUM_RATING=$(grep -cE '[0-9]+(\.[0-9]+)?\s*/\s*(5|10|20|100)\b' "$FILE" || true)
HAS_DIM_COLON_NUM=$(grep -cE '^[[:space:]]*[-*]?[[:space:]]*[a-zA-Z_]+:[[:space:]]*[0-9]' "$FILE" || true)
if (( HAS_SCORE_KW == 0 )) && (( HAS_NUM_RATING == 0 )) && (( HAS_DIM_COLON_NUM == 0 )); then
  fail=1
  fail_msgs+=("missing numeric scoring (no 'score'/'rating'/'verdict' keyword, no 'X/5'/'X/10' pattern, no dimension-name:number pattern)")
fi

# 2. Persona section
PERSONA_NAMES='Sarah|James|Priya|Tom|Aisha|Marcus|Lena|David'
if ! grep -iE "(persona|$PERSONA_NAMES)" "$FILE" > /dev/null; then
  fail=1
  fail_msgs+=("missing persona section (no 'persona' keyword and no named persona from references/personas.md)")
fi

# 3. Anti-pattern section
if ! grep -iE 'anti[ -]?pattern' "$FILE" > /dev/null; then
  fail=1
  fail_msgs+=("missing anti-pattern section")
fi

# 4. Evidence citations — at least 3 instances
EVIDENCE_COUNT=$(grep -iEc '(\.tsx?:[0-9]+|\.css:[0-9]+|\.html:[0-9]+|section:|screenshot|excerpt|line [0-9]+)' "$FILE" || true)
if (( EVIDENCE_COUNT < 3 )); then
  fail=1
  fail_msgs+=("evidence citations sparse: found $EVIDENCE_COUNT, require >=3 (file:line, screenshot region, section:, line N)")
fi

# 5. Verdict
if ! grep -iE '(verdict|REBUILD|REFINE|SHIP|PASS|FAIL)' "$FILE" > /dev/null; then
  fail=1
  fail_msgs+=("missing verdict (no 'verdict', 'REBUILD/REFINE/SHIP', or 'PASS/FAIL' found)")
fi

if (( fail == 1 )); then
  echo "ERROR: critique artifact $FILE failed structure validation:" >&2
  for m in "${fail_msgs[@]}"; do echo "  - $m" >&2; done
  echo "" >&2
  echo "  The critique skill must produce structured output. Prose-only critiques fail this gate." >&2
  exit 2
fi

echo "Critique structure valid: $FILE"
echo "  Scoring: present"
echo "  Persona: present"
echo "  Anti-pattern section: present"
echo "  Evidence citations: $EVIDENCE_COUNT"
echo "  Verdict: present"
