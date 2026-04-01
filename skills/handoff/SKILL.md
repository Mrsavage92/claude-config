Generate a comprehensive session handoff document and save it as `whats-next.md` in the current project directory.

This command preserves complete context so work can be resumed seamlessly in a fresh session or by another Claude instance with zero information loss.

## Document Sections (all required)

### 1. Original Task
The initial request or goal — scope and intent as stated.

### 2. Work Completed
Everything accomplished in this session:
- Files created, modified, or deleted (with paths)
- Decisions made (and the reasoning)
- Commands run and their outcomes
- Key findings or discoveries

### 3. Work Remaining
Precise next steps with dependencies:
- What needs to happen next (ordered)
- Which steps depend on other steps
- Estimated scope of remaining work

### 4. Attempted Approaches
What was tried and didn't work — so the next session doesn't repeat dead ends:
- Approach tried
- Why it failed or was abandoned
- What was learned

### 5. Critical Context
Essential knowledge that isn't obvious from the files:
- Key decisions and their rationale
- Constraints that shaped the approach
- Non-obvious gotchas or edge cases
- Assumptions that were made

### 6. Current State
Exact status of the project right now:
- What's in a working state
- What's partially complete
- What's broken or needs fixing
- Where in the workflow things stand

## Quality Standard

Comprehensive detail and precision over brevity. The reader has zero context from this session. Write as if explaining to a competent engineer who is starting fresh.

## Output

Save the handoff as `whats-next.md` in the current working directory, then confirm: "Handoff saved to whats-next.md — ready for next session."
