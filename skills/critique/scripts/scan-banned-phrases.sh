#!/usr/bin/env bash
# scan-banned-phrases.sh — refuses to emit a critique that uses banned self-praise.
# Same banned list as the rest of the harness ([feedback_no_self_quality_claims]).

set -euo pipefail

FILE="${1:?usage: scan-banned-phrases.sh <critique-artifact-path>}"

if [[ ! -f "$FILE" ]]; then
  echo "ERROR: file not found: $FILE" >&2
  exit 1
fi

BANNED='comprehensive|robust|production-ready|world-class|premium|perfect|10/10|shit hot|epic|best-in-class|enterprise-grade|battle-tested|deeply|holistic|seamless|cutting-edge'

HITS=$(grep -inE "\b($BANNED)\b" "$FILE" || true)

if [[ -n "$HITS" ]]; then
  echo "ERROR: critique contains banned self-praise phrases:" >&2
  echo "$HITS" >&2
  exit 3
fi

echo "Banned-phrase scan clean: $FILE"
