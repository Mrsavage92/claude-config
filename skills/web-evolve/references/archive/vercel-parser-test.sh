#!/usr/bin/env bash
# Vercel CLI parser fixture validation.
# Runs the same field-extraction logic that deploy-and-verify.sh uses against synthetic
# `vercel env ls --format json` output, and asserts the parser correctly identifies
# OK / WRONG_BRANCH / MISSING for each of the 3 fixture scenarios.
#
# Cardinal Rule 3: ground-truth reward function — the parser is tested mechanically
# without needing a live Vercel project.

set +e
export MSYS_NO_PATHCONV=1

USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"

FIXTURE="$USER_HOME/.claude/skills/web-evolve/references/schemas/vercel-env-fixture.json"
[ -f "$FIXTURE" ] || { echo "REJECT: fixture $FIXTURE missing" >&2; exit 1; }

python3 - "$FIXTURE" <<'PYEOF'
import json, sys
with open(sys.argv[1]) as f:
    fixture = json.load(f)

current_branch = fixture['current_branch']
prod_envs = fixture['production_envs_for_comparison']
prod_names = {e['key'] for e in prod_envs}

def classify(preview_envs):
    """Replicates the parsing logic in deploy-and-verify.sh — must match exactly."""
    preview_map = {e['key']: e for e in preview_envs if e.get('key')}
    missing = []
    branch_scoped = []
    for name in prod_names:
        pv = preview_map.get(name)
        if pv is None:
            missing.append(name)
            continue
        git_branch = pv.get('gitBranch') or pv.get('branch')
        if git_branch and git_branch != current_branch:
            branch_scoped.append(f"{name}:branch={git_branch}")
    if missing:
        return f"MISSING:{','.join(sorted(missing))}"
    if branch_scoped:
        return f"WRONG_BRANCH:{','.join(sorted(branch_scoped))}"
    return "OK"

fails = 0
for name, scenario in fixture['fixtures'].items():
    result = classify(scenario['envs'])
    expected = scenario['expected_parser_result']
    # Match prefix (e.g. "MISSING" matches "MISSING:DATABASE_URL,API_KEY")
    passed = result.startswith(expected)
    status = "PASS" if passed else "FAIL"
    print(f"  [{status}] {name}: expected={expected}, got={result}")
    if not passed: fails += 1

if fails > 0:
    print(f"vercel-parser-test: {fails} fixture(s) failed")
    sys.exit(1)
print(f"vercel-parser-test: all {len(fixture['fixtures'])} fixtures OK")
sys.exit(0)
PYEOF
RC=$?
exit $RC
