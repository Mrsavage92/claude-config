#!/usr/bin/env bash
# Phase F retro writer (cardinal rule 6).
# Takes RetroAgent's JSON output, validates schema, appends to trajectory.json.
# Orchestrator invokes this; orchestrator does NOT write the JSON content itself.
# Uses python3 (no jq dependency).

set +e  # capture python's exit code explicitly; do not let set-e abort before RC check
export MSYS_NO_PATHCONV=1

USER_HOME="${USERPROFILE:-$HOME}"
USER_HOME="${USER_HOME//\\//}"

# Normalize MSYS-style PROJECT_PATH to Windows-style for python compatibility
PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
if [[ "$PROJECT_PATH" =~ ^/([a-zA-Z])/ ]]; then
  drive="${BASH_REMATCH[1]^^}"
  PROJECT_PATH="${drive}:/${PROJECT_PATH:3}"
fi
RETRO_PATH="$1"
[ -n "$RETRO_PATH" ] || { echo "USAGE: append-retro.sh <path-to-retroagent-output.json>"; exit 2; }
[ -f "$RETRO_PATH" ] || { echo "REJECT: $RETRO_PATH missing"; exit 1; }

SCHEMA="$USER_HOME/.claude/skills/web-evolve/references/trajectory-schema.json"
[ -f "$SCHEMA" ] || { echo "REJECT: trajectory-schema.json missing"; exit 1; }

RESULT=$(python3 - "$RETRO_PATH" "$SCHEMA" "$PROJECT_PATH/.evolution/trajectory.json" "$PROJECT_PATH/.evolution/next-run-priorities.json" "$PROJECT_PATH/.evolution/.hashes.json" <<'PYEOF'
import json, re, hashlib, sys, os, base64, datetime

retro_path, schema_path, traj_path, next_path, hash_path = sys.argv[1:6]

with open(retro_path) as f: retro = json.load(f)
with open(schema_path) as f: schema = json.load(f)

required = schema.get('required', [])
missing = [k for k in required if k not in retro]
if missing:
    print(f"REJECT:missing fields:{missing}"); sys.exit(1)

# Status vocab
status = retro.get('status', '')
if not re.match(r'^(PASS|halted_before_phase_c|halted_at_iter_\d+|deviation_cap_exceeded|taste_pre_flight_failed)$', status):
    print(f"REJECT:status {status!r} not in constrained vocab"); sys.exit(1)

# Cardinal Rule 6 declarative enforcement.
# The retro MUST come from a separate Agent dispatch (RetroAgent), not the orchestrator.
# Without a tool-use.log signal we cannot cryptographically verify the agent identity,
# but we require declarative fields so an orchestrator that bypasses Phase F must lie
# explicitly. Lies are visible in the trajectory record and accumulate as audit evidence.
agent_role = retro.get('agent_role', '')
agent_tool_use_id = retro.get('agent_tool_use_id', '')
if agent_role != 'RetroAgent':
    print(f"REJECT:agent_role must be 'RetroAgent' (got {agent_role!r}). Phase F retro must be written by a separate Agent(subagent_type=general-purpose) dispatch — see references/retro-agent-brief.md. Cardinal Rule 6."); sys.exit(1)
# Harness agent-id format: 'a' + 16 lowercase hex chars (e.g. 'a72031897166059c2', 'a7c9b3b27a1722ce4').
# Strict regex prevents fabricated ids like 'a1RetroAgent8x' which the prior loose regex accepted.
if not re.match(r'^a[0-9a-f]{16}$', agent_tool_use_id):
    print(f"REJECT:agent_tool_use_id {agent_tool_use_id!r} is not a harness agent-id (pattern: ^a[0-9a-f]{{16}}$ — 'a' followed by 16 lowercase hex chars, e.g. 'a72031897166059c2'). The agent-id is visible in the Agent tool invocation context. Fabricating an id is a Cardinal Rule 6 bypass attempt."); sys.exit(1)

# Banned-phrase scan
BANNED = base64.b64decode("Y29tcHJlaGVuc2l2ZXxyb2J1c3R8cHJvZHVjdGlvbi1yZWFkeXx3b3JsZC1jbGFzc3xwcmVtaXVtfHBlcmZlY3R8MTAvMTB8c2hpdCBob3R8YmVzdC1pbi1jbGFzc3xlbnRlcnByaXNlLWdyYWRlfGJhdHRsZS10ZXN0ZWQ=").decode()
text = json.dumps(retro)
if re.search(BANNED, text, re.IGNORECASE):
    hits = sorted(set(re.findall(BANNED, text, re.IGNORECASE)))
    print(f"REJECT:banned phrase(s):{hits}"); sys.exit(1)

# Load or init trajectory
if os.path.exists(traj_path):
    with open(traj_path) as f: traj = json.load(f)
else:
    os.makedirs(os.path.dirname(traj_path), exist_ok=True)
    traj = {'runs': []}

run_id = retro.get('run_id')
if any(r.get('run_id') == run_id for r in traj.get('runs', [])):
    print(f"REJECT:run_id {run_id} already exists"); sys.exit(1)

traj['runs'].append(retro)
with open(traj_path, 'w') as f: json.dump(traj, f, indent=2)

# next-run-priorities.json
next_data = {
    'generated_at': datetime.datetime.utcnow().isoformat() + 'Z',
    'generated_by_run_id': run_id,
    'priorities': retro.get('next_run_priorities', []),
    'corrective_actions_pending': retro.get('corrective_actions_pending', []),
}
with open(next_path, 'w') as f: json.dump(next_data, f, indent=2)

# Update hashes
def sha(p):
    with open(p, 'rb') as f: return hashlib.sha256(f.read()).hexdigest()
t_hash = sha(traj_path); n_hash = sha(next_path)
if os.path.exists(hash_path):
    with open(hash_path) as f: hd = json.load(f)
else:
    hd = {'files': []}
files = hd.get('files', [])
files = [e for e in files if e.get('file') not in ('trajectory.json', 'next-run-priorities.json')]
files = [
    {'file': 'trajectory.json', 'sha256': t_hash, 'written_by': 'append-retro.sh'},
    {'file': 'next-run-priorities.json', 'sha256': n_hash, 'written_by': 'append-retro.sh'},
] + files
hd['files'] = files
with open(hash_path, 'w') as f: json.dump(hd, f, indent=2)

print(f"OK:run={run_id} status={status} t_hash={t_hash[:12]} n_hash={n_hash[:12]}")
sys.exit(0)
PYEOF
)
RC=$?
echo "$RESULT"
exit $RC
