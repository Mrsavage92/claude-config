# Opt-In Features

Features that require explicit activation. Set to ON/OFF below.

| Feature | Status | Notes |
|---|---|---|
| Notion context fetch | ON | Runs at SessionStart via python3 fetch-notion-context.py |
| GateGuard (read-before-write) | ON | PreToolUse hook via pretool-router.py |
| Config protection | ON | PreToolUse hook via pretool-router.py |
| Tokens lock enforce | ON | PreToolUse hook via pretool-router.py |
| Tool use logging | ON | PostToolUse hook → ~/.claude/tool-use.log |
| Auto git sync | ON | SessionStart pull + Stop push to claude-config |
| Claude-skills sync | ON | SessionStart reset --hard origin/main |

## Override env vars
- `CLAUDE_GATEGUARD_OFF=1` — disable read-before-write enforcement
- `CLAUDE_CONFIG_PROTECT_OFF=1` — allow editing lint/format configs
- `CLAUDE_TOKENS_LOCK_OFF=1` — disable design token lock enforcement
