---
name: refine
disable-model-invocation: true
description: Single entry point for all visual refinement. Diagnoses which dimension is most off (typography, layout, color, motion, delight, clarity), loads context once, then routes to the right specialist. Use when something looks wrong but you are not sure which specialist to invoke, or when the user says "make this better", "refine this", "improve the design", "something feels off".
argument-hint: "[target]"
---

# /refine

The shared entry point for all visual refinement work. Loads context once, diagnoses the target, routes to the specialist that will close the biggest gap.

**Do not invoke the specialist skills yourself and call it refine.** The value here is in the diagnosis — routing to the wrong specialist wastes a turn. If the target has broken typography AND broken layout, route to typeset first (typography is the faster visual signal).

---

## Step 1 — Load context (shared, done once)

**Read in this order, stop at the first match:**

1. `tokens.lock.json` at project root → replication mode active. Every refinement must stay within the lock. Pass `lock: tokens.lock.json` as the first arg to whichever specialist you route to.
2. `.agents/context.json` or `DESIGN-CONTEXT.md` → read for design constraints.
3. Neither exists → **HALT with NEEDS_HUMAN:** "No design context. Run `Skill('style-mirror')` against a reference URL first, or create `DESIGN-CONTEXT.md` with palette, typography, and tone."

Note: the original context-loading skill (impeccable) is no longer installed. This step covers its role for the entire refinement pass.

---

## Step 2 — Diagnose the target

Screenshot the target (or read the file if no browser MCP). Apply the following checks in order:

| Check | Symptom | Specialist |
|---|---|---|
| Typography | Font wrong, scale off, hierarchy unclear, tight/loose line-height | `Skill('typeset')` |
| Layout | Cramped, monotonous grid, bad rhythm, inconsistent spacing | `Skill('layout')` |
| Color | Flat, single-hue, primary overused, contrast wrong | `Skill('colorize')` |
| Motion | Missing or wrong timing, no entrance animation, jank | `Skill('animate')` |
| Delight | Generic, no personality, nothing memorable | `Skill('delight')` |
| Clarity | Confusing copy, bad labels, unclear errors | `Skill('clarify')` |
| Multiple dimensions failing | Run `/critique` first, get a ranked list, then route the top finding | `Skill('critique')` → route top finding |

**Pick ONE.** The single most broken dimension. If two dimensions are equally broken, use the tiebreaker: typography > layout > color > motion > delight > clarity (fix foundational before decorative).

---

## Step 3 — Route

Pass the context you loaded in Step 1 as the first part of the specialist's args:

```
# Replication mode:
Skill('typeset', args='lock: tokens.lock.json | reference: <url> | [target description]')

# Non-replication mode:
Skill('layout', args='[target description] | context: DESIGN-CONTEXT.md')
```

The specialist MUST enter its "skip MANDATORY PREPARATION — context in args" branch. Do NOT let it re-run the context-loading step.

---

## Step 4 — Verify

After the specialist completes:
- Screenshot the result (or re-read the file).
- Confirm the targeted dimension improved.
- If the second most broken dimension is still significantly off, route to its specialist. One specialist per turn — do not chain without checking.

---

## Anti-patterns

- Running all specialists on the same target in one pass. Each specialist makes targeted edits; running them all introduces conflicts.
- Routing to a specialist before loading context. The lock or context file shapes every decision — load it first, every time.
- Calling this skill when the request is clearly scoped: user says "fix the colors" → call `Skill('colorize')` directly.
- Diagnosing without looking. Screenshot or read the file before picking a specialist. "It probably needs typeset" is not a diagnosis.
