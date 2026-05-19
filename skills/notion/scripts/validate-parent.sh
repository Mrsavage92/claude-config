#!/usr/bin/env bash
# validate-parent.sh — refuses hub-root parent for project docs.
#
# The skill's first rule: any document related to a project goes under the Projects hub
# (32a116e8bef281d6bbcae0db73eede0b), never at the workspace root hub
# (32a116e8bef28030a0f6d0be522bf917).
#
# Usage:
#   validate-parent.sh <parent-id> [--allow-hub-root]
#
# Exit 0 if parent is valid (and not the hub root, OR --allow-hub-root passed)
# Exit 2 if parent is the hub root and --allow-hub-root NOT passed

set -euo pipefail

PARENT="${1:?usage: validate-parent.sh <parent-id> [--allow-hub-root]}"
ALLOW_HUB=""
if [[ "${2:-}" == "--allow-hub-root" ]]; then
  ALLOW_HUB="yes"
fi

# Normalize — strip hyphens for comparison
NORM="$(echo "$PARENT" | tr -d '-' | tr 'A-F' 'a-f')"
HUB_ROOT_NORM="32a116e8bef28030a0f6d0be522bf917"

# Validate UUID shape (32 hex chars after normalization)
if [[ ! "$NORM" =~ ^[0-9a-f]{32}$ ]]; then
  echo "ERROR: parent-id '$PARENT' is not a valid Notion UUID." >&2
  echo "  Expected 32 hex chars (with or without hyphens)." >&2
  exit 1
fi

if [[ "$NORM" == "$HUB_ROOT_NORM" ]]; then
  if [[ "$ALLOW_HUB" == "yes" ]]; then
    echo "WARN: parent is workspace hub root. --allow-hub-root passed; proceeding."
    exit 0
  else
    echo "ERROR: refusing to create page at workspace hub root ($PARENT)." >&2
    echo "  Project docs must go under Projects hub (32a116e8bef281d6bbcae0db73eede0b)." >&2
    echo "  If you genuinely need a top-level workspace page, re-invoke with --allow-hub-root." >&2
    exit 2
  fi
fi

echo "Parent OK: $PARENT"
exit 0
