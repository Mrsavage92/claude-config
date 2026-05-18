#!/usr/bin/env bash
# Phase C single-iter dispatcher. Multi-command structure: bash drives deterministic
# state/queue/verdict plumbing; orchestrator handles the Claude-tool calls (screenshots,
# Skill('web-page'), Skill('critique')) BETWEEN bash invocations.
#
# Usage:
#   iter-step.sh pre                       — pop next route, update loop-state, emit screenshot path
#   iter-step.sh apply-verdict <json-path> — parse critique JSON, apply KEEP|VOID|REVERT mechanically
#   iter-step.sh queue-empty               — exit 0 if no more work; non-0 if work remains
#
# Cardinal rules: 1 (token verdict via parse-verdict.sh), 3 (exit-code gates), 9 (loop-condition elsewhere).
# Uses python3 (no jq dependency).

set -e
export MSYS_NO_PATHCONV=1

USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"

PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
# Normalize MSYS-style PROJECT_PATH (/c/...) to Windows-style (C:/...) for python compatibility
if [[ "$PROJECT_PATH" =~ ^/([a-zA-Z])/ ]]; then
  drive="${BASH_REMATCH[1]^^}"
  PROJECT_PATH="${drive}:/${PROJECT_PATH:3}"
fi
SKILL_PATH="$USER_HOME/.claude/skills/web-evolve"
EVOLUTION="$PROJECT_PATH/.evolution"
STATE="$EVOLUTION/loop-state.json"

CMD="${1:-pre}"

case "$CMD" in
  pre)
    # Pop next priority. Update loop-state. Emit screenshot path for orchestrator.
RESULT=$(python3 - "$STATE" "$EVOLUTION" <<'PYEOF'
import json, os, subprocess, sys
state_path, evolution = sys.argv[1], sys.argv[2]
project_path = os.path.dirname(evolution)
with open(state_path) as f: d = json.load(f)

rebuild_q = os.path.join(evolution, 'rebuild-queue.txt')
refine_q = os.path.join(evolution, 'refine-queue.txt')
baselines_path = os.path.join(evolution, 'page-baselines.json')

route = ''; fix_skill = ''; fix_type = ''
if os.path.exists(rebuild_q):
    with open(rebuild_q) as f: lines = [l.strip() for l in f if l.strip()]
    if lines:
        route = lines[0]
        fix_skill = 'web-page'; fix_type = 'REBUILD'
        # Pop the line we took
        with open(rebuild_q, 'w') as f: f.write('\n'.join(lines[1:]) + ('\n' if lines[1:] else ''))
if not route and os.path.exists(refine_q):
    with open(refine_q) as f: lines = [l.strip() for l in f if l.strip()]
    if lines:
        route = lines[0]
        fix_type = 'REFINE'
        # Look up recommended skill from page-baselines
        if os.path.exists(baselines_path):
            with open(baselines_path) as f: b = json.load(f)
            entry = next((r for r in b.get('routes', []) if r.get('route') == route), None)
            if entry: fix_skill = entry.get('recommended_skill', 'polish')
        if not fix_skill: fix_skill = 'polish'
        with open(refine_q, 'w') as f: f.write('\n'.join(lines[1:]) + ('\n' if lines[1:] else ''))

if not route:
    # No work — set halt flag
    d['halt_flag'] = True
    d['halt_reason'] = 'queue_empty'
    with open(state_path, 'w') as f: json.dump(d, f, indent=2)
    print("QUEUE_EMPTY")
    sys.exit(0)

iter_n = int(d.get('iteration', 0)) + 1
slug = route.replace('/', '-').strip('-') or 'home'
try:
    base_head = subprocess.check_output(
        ['git', '-C', project_path, 'rev-parse', 'HEAD'],
        text=True,
        stderr=subprocess.DEVNULL,
    ).strip()
except Exception:
    base_head = ''
d['iteration'] = iter_n
d['current_route'] = route
d['current_fix_type'] = fix_type
d['current_fix_skill'] = fix_skill
d['current_base_head'] = base_head
d['current_pre_screenshot'] = os.path.join(evolution, f'iter-{iter_n}-before-{slug}.png')
d['current_post_screenshot'] = os.path.join(evolution, f'iter-{iter_n}-after-{slug}.png')
with open(state_path, 'w') as f: json.dump(d, f, indent=2)

print(f"ITER={iter_n}")
print(f"ROUTE={route}")
print(f"FIX_TYPE={fix_type}")
print(f"FIX_SKILL={fix_skill}")
print(f"PRE_SCREENSHOT={d['current_pre_screenshot']}")
print(f"POST_SCREENSHOT={d['current_post_screenshot']}")
PYEOF
    )
    echo "$RESULT"
    # If queue empty, exit non-zero so the orchestrator's loop-condition picks it up
    if echo "$RESULT" | grep -q "^QUEUE_EMPTY$"; then
      exit 7
    fi
    exit 0
    ;;

  apply-verdict)
    VERDICT_PATH="$2"
    [ -f "$VERDICT_PATH" ] || { echo "REJECT: verdict file $VERDICT_PATH missing" >&2; exit 1; }

    # First validate the verdict JSON via parse-verdict.sh
    VALIDATION=$(cat "$VERDICT_PATH" | bash "$SKILL_PATH/references/parse-verdict.sh")
    VALIDATION_RC=$?
    if [ $VALIDATION_RC -ne 0 ]; then
      echo "REJECT: verdict failed parse-verdict.sh validation" >&2
      echo "$VALIDATION" >&2
      exit 1
    fi

    # Apply verdict mechanically
    APPLY=$(python3 - "$STATE" "$VERDICT_PATH" <<'PYEOF'
import json, sys
with open(sys.argv[1]) as f: state = json.load(f)
with open(sys.argv[2]) as f: verdict_doc = json.load(f)

verdict = verdict_doc.get('verdict', '')
iter_n = state.get('iteration', 0)
route = state.get('current_route', '')

# Map critique tokens to action tokens.
# An iter that resolved prior violations on its way to a lower-severity verdict
# is improvement, not failure — KEEP the work and requeue at the new tier.
# Otherwise apply strict rollback (cover-agent pattern).
prior_resolved = len(verdict_doc.get('prior_violations_resolved', []) or [])
new_regressions = len(verdict_doc.get('regressions_introduced', []) or [])

if verdict == 'PASS':
    action = 'KEEP'
elif verdict == 'FAIL_REFINE' and prior_resolved >= 1 and new_regressions == 0:
    # iter took the route from FAIL_REBUILD-tier to FAIL_REFINE-tier — that IS the improvement
    action = 'KEEP_REQUEUE_REFINE'
elif verdict in ('FAIL_REBUILD', 'FAIL_REFINE'):
    # no prior violations resolved, or new regressions introduced — strict rollback
    action = 'REVERT'
elif verdict == 'FAIL_VOID':
    action = 'VOID'
else:
    action = 'VOID'  # default safe

if action == 'KEEP':
    state['real_iterations'] = state.get('real_iterations', 0) + 1
    state['last_iter_action'] = 'KEEP'
elif action == 'KEEP_REQUEUE_REFINE':
    state['real_iterations'] = state.get('real_iterations', 0) + 1
    state['last_iter_action'] = 'KEEP_REQUEUE_REFINE'
    state['last_iter_requeued_to'] = 'refine-queue'
elif action == 'VOID':
    state['void_count'] = state.get('void_count', 0) + 1
    state['last_iter_action'] = 'VOID'
elif action == 'REVERT':
    state['real_iterations'] = state.get('real_iterations', 0) + 1
    state['last_iter_action'] = 'REVERT'

with open(sys.argv[1], 'w') as f: json.dump(state, f, indent=2)
print(f"ACTION={action}")
print(f"ITER={iter_n}")
print(f"ROUTE={route}")
PYEOF
    )
    echo "$APPLY"
    ACTION=$(echo "$APPLY" | grep "^ACTION=" | cut -d= -f2)
    case "$ACTION" in
      KEEP)
        # Orchestrator should commit; bash emits instruction
        echo "ORCHESTRATOR_DO: git commit -am 'iter $(python3 -c "import json; print(json.load(open(r'$STATE')).get('iteration',0))") KEEP route=$(python3 -c "import json; print(json.load(open(r'$STATE')).get('current_route',''))")'"
        ;;
      KEEP_REQUEUE_REFINE)
        # Iter resolved prior violations -> keep + move route to refine-queue for follow-up polish
        ROUTE_NOW=$(python3 -c "import json; print(json.load(open(r'$STATE')).get('current_route',''))")
        ITER_N=$(python3 -c "import json; print(json.load(open(r'$STATE')).get('iteration',0))")
        python3 - "$EVOLUTION" "$ROUTE_NOW" <<'PYEOF'
import os, sys
evolution, route = sys.argv[1], sys.argv[2]
refine_path = os.path.join(evolution, 'refine-queue.txt')
existing = []
if os.path.exists(refine_path):
    with open(refine_path) as f: existing = [l.strip() for l in f if l.strip()]
if route and route not in existing:
    existing.insert(0, route)
    with open(refine_path, 'w') as f: f.write('\n'.join(existing) + '\n')
    print(f"REQUEUED: {route} -> refine-queue")
else:
    print(f"NOOP: {route} already in refine-queue or empty")
PYEOF
        echo "ORCHESTRATOR_DO: git commit -am 'iter $ITER_N KEEP_REQUEUE_REFINE route=$ROUTE_NOW'"
        ;;
      VOID)
        BASE_HEAD=$(python3 -c "import json; print(json.load(open(r'$STATE')).get('current_base_head',''))")
        [ -n "$BASE_HEAD" ] || { echo "REJECT: current_base_head missing; refusing destructive rollback" >&2; exit 1; }
        cd "$PROJECT_PATH"
        HEAD_NOW=$(git rev-parse HEAD)
        if [ "$HEAD_NOW" = "$BASE_HEAD" ]; then
          echo "REJECT: no iteration commit found after base $BASE_HEAD; refusing reset" >&2
          exit 1
        fi
        PARENT_NOW=$(git rev-parse HEAD^ 2>/dev/null || true)
        if [ "$PARENT_NOW" != "$BASE_HEAD" ]; then
          echo "REJECT: HEAD is not a single iteration commit on top of base $BASE_HEAD; refusing reset" >&2
          exit 1
        fi
        git reset --hard "$BASE_HEAD" 2>&1 | head -3
        echo "BASH_DID: git reset --hard $BASE_HEAD (VOID)"
        ;;
      REVERT)
        BASE_HEAD=$(python3 -c "import json; print(json.load(open(r'$STATE')).get('current_base_head',''))")
        [ -n "$BASE_HEAD" ] || { echo "REJECT: current_base_head missing; refusing revert" >&2; exit 1; }
        cd "$PROJECT_PATH"
        HEAD_NOW=$(git rev-parse HEAD)
        if [ "$HEAD_NOW" = "$BASE_HEAD" ]; then
          echo "REJECT: no iteration commit found after base $BASE_HEAD; refusing revert" >&2
          exit 1
        fi
        PARENT_NOW=$(git rev-parse HEAD^ 2>/dev/null || true)
        if [ "$PARENT_NOW" != "$BASE_HEAD" ]; then
          echo "REJECT: HEAD is not a single iteration commit on top of base $BASE_HEAD; refusing revert" >&2
          exit 1
        fi
        git revert "$HEAD_NOW" --no-edit 2>&1 | head -3
        echo "BASH_DID: git revert $HEAD_NOW --no-edit (REVERT)"
        ;;
    esac
    exit 0
    ;;

  queue-empty)
    # Count non-empty lines via python (avoids bash arithmetic on multi-line grep output)
    COUNTS=$(python3 - "$EVOLUTION" <<'PYEOF'
import os, sys
ev = sys.argv[1]
def count(p):
    if not os.path.isfile(p): return 0
    with open(p) as f: return sum(1 for line in f if line.strip())
rb = count(os.path.join(ev, 'rebuild-queue.txt'))
rf = count(os.path.join(ev, 'refine-queue.txt'))
print(f"{rb} {rf}")
PYEOF
    )
    REBUILD_LINES=$(echo "$COUNTS" | awk '{print $1}')
    REFINE_LINES=$(echo "$COUNTS" | awk '{print $2}')
    TOTAL=$((REBUILD_LINES + REFINE_LINES))
    if [ "$TOTAL" -eq 0 ]; then
      echo "QUEUE_EMPTY"
      exit 0
    fi
    echo "QUEUE_HAS_WORK: rebuild=$REBUILD_LINES refine=$REFINE_LINES"
    exit 1
    ;;

  *)
    echo "USAGE: iter-step.sh {pre|apply-verdict <json-path>|queue-empty}" >&2
    exit 2
    ;;
esac
