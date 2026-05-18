#!/usr/bin/env bash
# lint-staged-skills.sh
#
# Pre-commit gate: lint every skill that has staged changes. Exits non-zero
# if any skill has blocking errors (missing frontmatter, banned phrases,
# disallowed frontmatter keys, etc.) so the commit is blocked.
#
# Install as a git hook:
#   cp scripts/lint-staged-skills.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# Or run manually:
#   ./scripts/lint-staged-skills.sh
#
# The lint script itself lives in the working copy of claude-config at
# skills/skill-forge/scripts/lint_skill.py. The pre-commit hook needs it
# accessible, so we resolve the path from the repo root.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
LINT_SCRIPT="$REPO_ROOT/skills/skill-forge/scripts/lint_skill.py"

if [ ! -f "$LINT_SCRIPT" ]; then
    echo "pre-commit: lint script not found at $LINT_SCRIPT — skipping" >&2
    exit 0
fi

if ! command -v python >/dev/null 2>&1; then
    echo "pre-commit: python not on PATH — skipping skill lint" >&2
    exit 0
fi

# Collect affected skill directories from staged changes.
# Skill = any folder under skills/ that contains SKILL.md.
# A staged change under skills/foo/* triggers a lint on skills/foo/.
staged=$(git diff --cached --name-only --diff-filter=ACMR | grep '^skills/' || true)

if [ -z "$staged" ]; then
    exit 0
fi

# Reduce to unique skill folders (one level deep under skills/).
skill_dirs=$(echo "$staged" | awk -F/ '{print $1"/"$2}' | sort -u)

errors=0
linted=0
for dir in $skill_dirs; do
    full="$REPO_ROOT/$dir"
    # Only lint folders that look like real skills (have a SKILL.md).
    if [ ! -f "$full/SKILL.md" ]; then
        continue
    fi
    linted=$((linted + 1))
    set +e
    output=$(python "$LINT_SCRIPT" "$full" 2>&1)
    code=$?
    set -e
    if [ "$code" -eq 2 ]; then
        echo "" >&2
        echo "=== BLOCKING: $dir ===" >&2
        echo "$output" >&2
        errors=$((errors + 1))
    elif [ "$code" -eq 1 ]; then
        # Warnings — print but don't block.
        echo "" >&2
        echo "=== warnings: $dir ===" >&2
        echo "$output" >&2
    fi
done

echo "" >&2
echo "pre-commit lint: $linted skills checked, $errors blocking" >&2

if [ "$errors" -gt 0 ]; then
    echo "" >&2
    echo "Commit blocked. Fix the errors above and re-stage." >&2
    echo "To bypass for emergencies only: git commit --no-verify" >&2
    exit 1
fi

exit 0
