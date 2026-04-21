Extract durable lessons from the current session (and recent tool-use log) and surface them as candidate feedback-memory entries or skill improvements.

This is NOT `/handoff` — handoff captures session state for resumption. `/learn` captures *patterns worth remembering across sessions*: mistakes you made and corrected, non-obvious tool behaviours you discovered, user preferences that became clearer, tool sequences that worked, and rules that should be mechanical rather than self-policed.

## What you analyse

1. **Current conversation transcript.** Look for:
   - Corrections from the user ("no", "don't", "stop doing X", "that's wrong")
   - Confirmations of non-obvious choices ("yes exactly", "good call", accepting an unusual approach without pushback)
   - Moments where you assumed wrong, then the user or a tool result corrected you
   - Tool sequences that failed then succeeded — what changed?
   - Tools / MCP servers / skills that returned unexpected data
   - Verification failures (HTTP 200 but wrong content, build passed but feature broken, etc.)

2. **Recent entries in `~/.claude/tool-use.log`** (last session worth). Look for:
   - Commands that failed then retried with a different approach
   - Unusual file paths or operations

## What you output

A single markdown block titled `# Lessons — <YYYY-MM-DD>`, with these sections (omit a section if empty — don't pad):

### Feedback-memory candidates
For each candidate, return the draft memory entry as you would save it, plus a recommendation:

```
[CANDIDATE] feedback_<slug>.md
Rule: <one sentence>
Why: <the reason, ideally citing the specific moment this session>
How to apply: <when/where it kicks in>
Recommendation: SAVE | UPDATE_EXISTING(<file>) | SKIP
```

Check existing memory at `C:\Users\Adam\.claude\projects\c--Users-Adam--claude-projects\memory\` before proposing SAVE — if there's already a matching entry, propose UPDATE_EXISTING instead.

### Skill / command gaps
Patterns that happened more than once and could become a skill, OR existing skills that need a fix.

```
[SKILL-GAP] <short name>
Observation: <what kept happening>
Proposal: <new skill | edit existing skill <name> | delete skill <name>>
```

### Mechanical enforcement candidates
Rules you keep having to re-police yourself on. These are hook candidates, not memory candidates.

```
[HOOK-CANDIDATE] <what the hook would do>
Trigger: PreToolUse | PostToolUse | UserPromptSubmit | Stop
Rationale: <why a hook beats a memory rule here>
```

### Project state updates
Facts about active projects that changed this session and should go into `project_<slug>.md`.

```
[PROJECT-UPDATE] project_<slug>.md
Change: <one line>
```

## What you do NOT output

- Generic "lessons learned" platitudes. Every entry must cite a specific moment.
- Style / tone preferences unless the user explicitly surfaced them.
- Recaps of work completed (that's `/handoff`).
- Anything from <private>...</private> blocks if present.
- Candidates where you're not >70% confident the pattern will repeat.

## Final step

After the report, ask exactly one question: *"Save which candidates?"* — then wait. Do not write memory files or skill edits without explicit approval.
