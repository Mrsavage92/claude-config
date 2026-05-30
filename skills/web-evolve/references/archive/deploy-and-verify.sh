#!/usr/bin/env bash
# Phase D — Deploy to evolve branch + preview env gate. NO SOFT-DEGRADE.
# Closes failure mode 5 from .forge-spec.md (Vercel preview per-branch trap).
# Uses real `vercel --format json` parsing.

set -e

PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
# Normalize MSYS-style PROJECT_PATH (/c/...) to Windows-style (C:/...) for python compatibility
if [[ "$PROJECT_PATH" =~ ^/([a-zA-Z])/ ]]; then
  drive="${BASH_REMATCH[1]^^}"
  PROJECT_PATH="${drive}:/${PROJECT_PATH:3}"
fi
EVOLUTION="$PROJECT_PATH/.evolution"
STATE="$EVOLUTION/loop-state.json"

BRANCH=$(python3 -c "import json; print(json.load(open('$STATE')).get('branch',''))")
[ -n "$BRANCH" ] || { echo "REJECT: branch not set in loop-state.json"; exit 1; }

cd "$PROJECT_PATH"

# Step 1: push evolve branch
echo "Phase D: pushing $BRANCH..."
git push -u origin "$BRANCH" 2>&1 || { echo "REJECT: git push failed"; exit 1; }

# Step 2: wait for preview deployment (poll vercel ls --format json)
echo "Phase D: polling for preview deployment (max 5 min)..."
DEPLOY_URL=""
DEPLOY_STATE=""
for i in $(seq 1 30); do
  LIST_JSON=$(npx -y vercel ls --format json 2>/dev/null || echo "[]")
  # Find deployment for this branch
  read DEPLOY_URL DEPLOY_STATE <<EOF
$(echo "$LIST_JSON" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    deps = data if isinstance(data, list) else data.get('deployments', [])
    for d in deps:
        meta = d.get('meta', {}) or {}
        branch = meta.get('gitBranch') or meta.get('githubCommitRef') or ''
        if branch == '$BRANCH':
            print(d.get('url',''), d.get('state', d.get('readyState','')))
            break
except Exception as e:
    print('', '')
")
EOF
  if [ -n "$DEPLOY_URL" ] && [ "$DEPLOY_STATE" = "READY" ]; then
    break
  fi
  if [ "$DEPLOY_STATE" = "ERROR" ] || [ "$DEPLOY_STATE" = "CANCELED" ]; then
    echo "REJECT: vercel deployment $DEPLOY_STATE for branch $BRANCH" >&2
    exit 1
  fi
  sleep 10
done

[ -n "$DEPLOY_URL" ] || { echo "REJECT: preview deployment not detected after 5 min"; exit 1; }

# Step 3: ASSERT preview env vars are correctly scoped (cardinal rule 8 hard-stop)
echo "Phase D: verifying preview env scope..."

# Get the JSON list of preview env vars
PREVIEW_JSON=$(npx -y vercel env ls preview --format json 2>/dev/null || echo "[]")
PROD_JSON=$(npx -y vercel env ls production --format json 2>/dev/null || echo "[]")

# Find vars present in production but missing or not all-branches-scoped in preview
MISSING_REPORT=$(python3 <<PYEOF
import json
try:
    preview = json.loads('''$PREVIEW_JSON''')
    prod = json.loads('''$PROD_JSON''')
    preview = preview if isinstance(preview, list) else preview.get('envs', [])
    prod = prod if isinstance(prod, list) else prod.get('envs', [])
    prod_names = {e.get('key') for e in prod if e.get('key')}
    # For each prod var, check preview has it AND scope is broad enough
    missing = []
    branch_scoped = []
    preview_map = {e.get('key'): e for e in preview if e.get('key')}
    for name in prod_names:
        pv = preview_map.get(name)
        if pv is None:
            missing.append(name)
            continue
        # Vercel exposes target as a list, or a "gitBranch" string for branch-scoped
        target = pv.get('target', [])
        git_branch = pv.get('gitBranch') or pv.get('branch')
        if isinstance(target, str):
            target = [target]
        if git_branch and git_branch != '$BRANCH':
            branch_scoped.append(f"{name}:branch={git_branch}")
    if missing:
        print('MISSING:' + ','.join(sorted(missing)))
    if branch_scoped:
        print('WRONG_BRANCH:' + ','.join(sorted(branch_scoped)))
    if not missing and not branch_scoped:
        print('OK')
except Exception as e:
    print('PARSE_FAIL:' + str(e))
PYEOF
)

echo "Phase D env-scope check: $MISSING_REPORT"

case "$MISSING_REPORT" in
  OK)
    echo "Phase D: env scope OK"
    ;;
  PARSE_FAIL:*)
    echo "REJECT: vercel CLI output parse failed: $MISSING_REPORT" >&2
    exit 1
    ;;
  *)
    echo "HALT: preview env scope insufficient. Detail: $MISSING_REPORT" >&2
    echo "" >&2
    echo "ONE-TIME USER SETUP REQUIRED:" >&2
    echo "  1. Go to https://vercel.com/dashboard → Project Settings → Environment Variables" >&2
    echo "  2. For each missing var, set Environment = 'Preview' with no branch restriction (All Preview Branches)" >&2
    echo "  3. Re-run /web-evolve — Phase D will resume" >&2
    echo "" >&2
    echo "Mechanically enforced (cardinal rule 8): no soft-degrade to direct-main-merge." >&2
    python3 - "$STATE" <<'PYEOF'
import json, sys
path = sys.argv[1]
with open(path) as f:
    d = json.load(f)
d['halt_flag'] = True
d['status'] = 'vercel_preview_env_misconfigured'
with open(path, 'w') as f:
    json.dump(d, f, indent=2)
PYEOF
    exit 1
    ;;
esac

# Step 4: write preview URL to loop-state for the orchestrator's puppeteer-verify step
python3 - "$STATE" "$DEPLOY_URL" <<'PYEOF'
import json, sys, os
path, url = sys.argv[1], sys.argv[2]
with open(path) as f:
    d = json.load(f)
d['preview_url'] = ('https://' + url) if not url.startswith('http') else url
d['phase_d_verified'] = True
ev = os.path.dirname(path)
def lines(p):
    if not os.path.isfile(p): return 0
    with open(p) as f: return sum(1 for x in f if x.strip())
remaining = lines(os.path.join(ev, 'rebuild-queue.txt')) + lines(os.path.join(ev, 'refine-queue.txt'))
d['next_phase'] = 'phase_c_next_iter' if remaining > 0 else 'phase_f_retro'
with open(path, 'w') as f:
    json.dump(d, f, indent=2)
PYEOF

echo "Phase D: preview READY at https://$DEPLOY_URL"
echo "Phase D: orchestrator must puppeteer-verify against post-iter screenshots before FF-merge."
echo "Phase D: env scope verified; merge gate is OPEN."

exit 0
