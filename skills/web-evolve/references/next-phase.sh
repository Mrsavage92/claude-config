#!/usr/bin/env bash
# Single source of truth for "what does /web-evolve do next in this project?"
#
# Reads .evolution/loop-state.json's `next_phase` field and emits a structured plan
# the orchestrator follows literally. Replaces the multi-command "remember to run X
# then Y then Z" pattern with a stateful dispatcher: every phase exit sets
# next_phase, the orchestrator reads next-phase.sh on entry, no memorization needed.
#
# Usage:
#   bash references/next-phase.sh           # emit plan for current state
#   bash references/next-phase.sh --json    # machine-readable
#
# Exit codes: always 0 (the orchestrator decides what to do with the plan).

set +e
export MSYS_NO_PATHCONV=1

PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
if [[ "$PROJECT_PATH" =~ ^/([a-zA-Z])/ ]]; then
  drive="${BASH_REMATCH[1]^^}"
  PROJECT_PATH="${drive}:/${PROJECT_PATH:3}"
fi
EVOLUTION="$PROJECT_PATH/.evolution"
STATE="$EVOLUTION/loop-state.json"

FORMAT="${1:-text}"

python3 - "$STATE" "$EVOLUTION" "$FORMAT" "$PROJECT_PATH" <<'PYEOF'
import json, os, sys

state_path, evolution, fmt, project_path = sys.argv[1:5]

# Determine plan from disk state alone — no orchestrator judgment involved
plan = {}

if not os.path.exists(state_path):
    # Fresh project — start from Phase 0
    plan = {
        "next_phase": "phase_0_boot",
        "user_visible": "Fresh project. Will run boot gates, taste-cache fetch, then audit every public route.",
        "next_command": "bash references/boot-gates.sh",
        "estimated_tokens": 5000,
        "after_this_phase": "phase_0_5_taste",
        "blocking": []
    }
else:
    with open(state_path) as f: state = json.load(f)
    next_phase = state.get('next_phase', '')
    iteration = state.get('iteration', 0)
    halt_flag = state.get('halt_flag', False)
    phase_d_verified = state.get('phase_d_verified', False)
    last_iter_commit = state.get('last_iter_commit')

    # Queue counts
    def lines(p):
        if not os.path.isfile(p): return 0
        with open(p) as f: return sum(1 for x in f if x.strip())
    rebuild_n = lines(os.path.join(evolution, 'rebuild-queue.txt'))
    refine_n = lines(os.path.join(evolution, 'refine-queue.txt'))

    if halt_flag:
        plan = {
            "next_phase": "phase_f_retro",
            "user_visible": f"Halt flag set ({state.get('halt_reason', 'unknown')}). Need to dispatch RetroAgent for Phase F.",
            "next_command": "Agent(subagent_type=general-purpose) with retro-agent-brief.md",
            "estimated_tokens": 60000,
            "after_this_phase": "complete",
            "blocking": []
        }
    elif last_iter_commit and not phase_d_verified:
        plan = {
            "next_phase": "phase_d_deploy",
            "user_visible": f"Iter {iteration} commit {last_iter_commit} is on local main but not deployed/verified. Push + verify live URL before any more iters.",
            "next_command": "bash references/deploy-and-verify.sh",
            "estimated_tokens": 8000,
            "after_this_phase": "phase_c_next_iter" if (rebuild_n + refine_n) > 0 else "phase_f_retro",
            "blocking": ["DEPLOY_DEBT"]
        }
    elif next_phase == 'phase_0_5_taste' or not os.path.exists(os.path.join(evolution, 'taste-rules.md')):
        plan = {
            "next_phase": "phase_0_5_taste",
            "user_visible": "Need to load taste rules via TasteFetcher sub-agent (Phase 0.5).",
            "next_command": "Agent(subagent_type=general-purpose) invoking Skill('taste-skill', args='mode: load-for-web-evolve | output_path: .evolution/taste-rules.md')",
            "estimated_tokens": 15000,
            "after_this_phase": "phase_a1_enumerate",
            "blocking": []
        }
    elif next_phase == 'phase_a1_enumerate' or not os.path.exists(os.path.join(evolution, 'route-list.json')):
        plan = {
            "next_phase": "phase_a1_enumerate",
            "user_visible": "Crawl sitemap + homepage to enumerate routes (cap 20).",
            "next_command": "bash references/enumerate-routes.sh",
            "estimated_tokens": 3000,
            "after_this_phase": "phase_a2_critique",
            "blocking": []
        }
    elif next_phase == 'phase_a2_critique' or not os.path.exists(os.path.join(evolution, 'page-baselines.json')):
        plan = {
            "next_phase": "phase_a2_critique",
            "user_visible": "Screenshot every enumerated route + dispatch parallel critique sub-agents.",
            "next_command": "node .evolution/capture-routes.mjs (screenshots) then Agent(subagent_type=general-purpose) batches of 5 routes each invoking Skill('critique')",
            "estimated_tokens": 200000,
            "after_this_phase": "phase_a4_verify",
            "blocking": []
        }
    elif next_phase == 'phase_a4_verify':
        plan = {
            "next_phase": "phase_a4_verify",
            "user_visible": "Live-HTML verify every baseline route via puppeteer probe.",
            "next_command": "for r in $(cat .evolution/route-list.json | python3 -c \"import sys,json; [print(x.get('route','')) for x in json.load(sys.stdin).get('routes',[])]\"); do bash references/verify-live-html.sh \"$r\"; done",
            "estimated_tokens": 8000,
            "after_this_phase": "phase_r_rebuild_gate",
            "blocking": []
        }
    elif next_phase == 'phase_r_rebuild_gate' or (next_phase == '' and rebuild_n + refine_n == 0):
        plan = {
            "next_phase": "phase_r_rebuild_gate",
            "user_visible": "Read page-baselines.json. If rebuild_queue >= 1 enter REBUILD mode; else signature pick.",
            "next_command": "bash references/rebuild-gate.sh",
            "estimated_tokens": 2000,
            "after_this_phase": "phase_c_next_iter",
            "blocking": []
        }
    elif rebuild_n + refine_n > 0:
        # Phase C next iter
        queue_file = 'rebuild-queue.txt' if rebuild_n > 0 else 'refine-queue.txt'
        with open(os.path.join(evolution, queue_file)) as f:
            next_route = next((l.strip() for l in f if l.strip()), '?')
        is_rebuild = rebuild_n > 0
        iter_n = iteration + 1
        plan = {
            "next_phase": f"phase_c_iter_{iter_n}",
            "user_visible": f"Iter {iter_n}: {'REBUILD' if is_rebuild else 'REFINE'} route '{next_route}' (rebuild_queue={rebuild_n}, refine_queue={refine_n})",
            "next_command": "bash references/iter-step.sh pre  # then Skill('web-page' or refinement skill) then critique then iter-step.sh apply-verdict",
            "estimated_tokens": 180000,
            "after_this_phase": "phase_d_deploy" if is_rebuild else f"phase_c_iter_{iter_n+1}",
            "blocking": []
        }
    else:
        # No queue, no halt, no deploy debt — run complete
        plan = {
            "next_phase": "complete",
            "user_visible": "Run is complete. Queues empty, last iter deployed and verified. Next /web-evolve invocation starts a fresh audit cycle.",
            "next_command": "(none — dispatch RetroAgent for final Phase F retro if not yet written)",
            "estimated_tokens": 60000,
            "after_this_phase": "fresh_run",
            "blocking": []
        }

# Always write a plain-English WHATS-NEXT.md the user can glance at
import datetime
wn_path = os.path.join(evolution, 'WHATS-NEXT.md')
os.makedirs(evolution, exist_ok=True)
wn_content = f"""# What's next for /web-evolve in this project

_Updated {datetime.datetime.now(datetime.timezone.utc).isoformat()} by next-phase.sh_

## Current state
- **Next phase:** `{plan['next_phase']}`
- **What that means:** {plan['user_visible']}
- **Estimated cost of next phase:** ~{plan['estimated_tokens']:,} tokens
- **After this phase, dispatcher will route to:** `{plan['after_this_phase']}`
"""
if plan['blocking']:
    wn_content += f"\n## ⚠ Blocking\n\n- {chr(10).join('- ' + b for b in plan['blocking'])}\n"
wn_content += f"""
## How to advance
Re-invoke `/web-evolve` (or say "continue" mid-conversation). The orchestrator will:
1. Run `bash references/boot-gates.sh` — verify nothing's broken
2. Run `bash references/next-phase.sh` — read this state again
3. Execute the dispatcher's `next_command`
4. Write updated `next_phase` for the following turn

The user does not need to remember which phase to run. The dispatcher decides.

## Raw plan (for the orchestrator)
```
{plan['next_command']}
```
"""
# Write via temp + rename so any concurrent reader sees a consistent file
tmp = wn_path + '.tmp'
with open(tmp, 'w', encoding='utf-8') as f: f.write(wn_content)
os.replace(tmp, wn_path)

if fmt == '--json':
    print(json.dumps(plan, indent=2))
else:
    print("=" * 70)
    print(f"NEXT PHASE: {plan['next_phase']}")
    print("=" * 70)
    print(f"  What happens: {plan['user_visible']}")
    print(f"  Next command: {plan['next_command']}")
    print(f"  Estimated cost: ~{plan['estimated_tokens']:,} tokens")
    print(f"  After this phase: {plan['after_this_phase']}")
    if plan['blocking']:
        print(f"  Blocking: {', '.join(plan['blocking'])}")
    print(f"  Plain-English handover written to: .evolution/WHATS-NEXT.md")
    print()

sys.exit(0)
PYEOF
