#!/usr/bin/env bash
# verify-counts.sh — re-read manifest.json after it's written, ensure the report's
# claimed counts match. Refuses to emit a summary report if mismatch.
#
# Mechanical fix for the 178-vs-175 count drift caught in the forge baseline.

set -euo pipefail

MANIFEST="${1:?usage: verify-counts.sh <manifest.json> <commands_claimed> <agents_claimed> <skills_claimed>}"
CMD_CLAIMED="${2:?commands_claimed required}"
AGT_CLAIMED="${3:?agents_claimed required}"
SKL_CLAIMED="${4:?skills_claimed required}"

if [[ ! -f "$MANIFEST" ]]; then
  echo "ERROR: manifest file not found: $MANIFEST" >&2
  exit 1
fi
if ! command -v jq > /dev/null; then
  echo "ERROR: jq required" >&2
  exit 1
fi

CMD_ACTUAL=$(jq -r '.counts.commands' "$MANIFEST")
AGT_ACTUAL=$(jq -r '.counts.agents' "$MANIFEST")
SKL_ACTUAL=$(jq -r '.counts.skills' "$MANIFEST")

mismatch=""
[[ "$CMD_CLAIMED" != "$CMD_ACTUAL" ]] && mismatch+="commands ($CMD_CLAIMED claimed vs $CMD_ACTUAL in manifest), "
[[ "$AGT_CLAIMED" != "$AGT_ACTUAL" ]] && mismatch+="agents ($AGT_CLAIMED claimed vs $AGT_ACTUAL in manifest), "
[[ "$SKL_CLAIMED" != "$SKL_ACTUAL" ]] && mismatch+="skills ($SKL_CLAIMED claimed vs $SKL_ACTUAL in manifest), "

if [[ -n "$mismatch" ]]; then
  echo "ERROR: report-vs-manifest count mismatch: ${mismatch%, }" >&2
  echo "  Reload counts from $MANIFEST before emitting the summary report." >&2
  exit 2
fi

echo "Counts verified: commands=$CMD_ACTUAL agents=$AGT_ACTUAL skills=$SKL_ACTUAL"
