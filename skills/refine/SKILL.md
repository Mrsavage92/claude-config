---
name: refine
description: "Refinement router for design improvements — typography, layout, color, motion, simplify, calmer, joy, copy, bolder. Use when the user wants any kind of incremental design pass: 'fix the typography', 'tighten spacing', 'add more color', 'add motion', 'simplify this', 'tone down', 'add personality', 'fix the copy', 'make it bolder'. Single entry point that dispatches to the right specialist; replaces calling typeset/layout/colorize/animate/distill/quieter/delight/clarify/bolder directly."
---

# /refine — Refinement Router

One entry point for all small-to-medium design improvements. Routes to the right specialist based on the mode argument so the user doesn't need to remember nine separate skill names.

## Why this exists

Before `/refine`, nine refinement skills (typeset, layout, colorize, animate, distill, quieter, delight, clarify, bolder) competed for the user's attention in the slash-command list. Each had near-identical scaffolding and all shared `/impeccable` as MANDATORY PREPARATION. The user couldn't remember which name to use; the model frequently picked the wrong one or paraphrased the work.

Now: `/refine <mode> [target]`. The router invokes the correct specialist via `Skill()` and passes through args. The specialists keep working unchanged for direct programmatic use (e.g. `saas-build` Phase 5a still calls `Skill('typeset')` by name).

## Modes

| Mode | Specialist | Use when the user wants… |
|---|---|---|
| `typography` / `type` / `font` | `typeset` | Better fonts, hierarchy, sizing, weight, readability |
| `layout` / `spacing` / `grid` | `layout` | Tighter spacing, fixed grids, better rhythm, alignment |
| `color` / `colour` / `palette` | `colorize` | More color, less monochrome, better palette, expressive accents |
| `motion` / `animation` / `animate` | `animate` | Animations, transitions, micro-interactions, scroll effects |
| `simplify` / `reduce` / `distill` | `distill` | Strip complexity, remove noise, get to essence |
| `calmer` / `quieter` / `tone-down` | `quieter` | Reduce intensity, soften aggressive design, less stimulation |
| `joy` / `delight` / `personality` | `delight` | Add character, surprise, moments of charm |
| `copy` / `microcopy` / `clarity` | `clarify` | Improve UX copy, error messages, labels, instructions |
| `bolder` / `amplify` / `stronger` | `bolder` | More visual impact, more confidence, less safe |

## Process

1. Parse the first arg as the mode. If unrecognised, ask the user which mode they meant from the table above.
2. Match the mode to its specialist via the lookup table.
3. Invoke the specialist via `Skill('<specialist>')` with the remaining args passed through verbatim.
4. The specialist runs its own `MANDATORY PREPARATION` (which is now lock-aware via the impeccable Step 0 gate).
5. Return the specialist's output unchanged.

This is a thin router. Do NOT do the refinement work in this skill — invoke the specialist. Paraphrasing the specialist's body in the router context is a phase failure.

## TOKENS LOCK GATE

If `tokens.lock.json` exists at the project root, replication mode is active. The router still dispatches to the same specialist — the specialist's lock awareness (via `/impeccable` Context Gathering Step 0) handles the rest. Do not strip or alter the user's args based on lock presence; the specialist decides what to do.

## When NOT to use

- For full-page rebuilds → `/web-page` or `/web-component`
- For final pre-ship sweep → `/polish` (separate skill, not part of this router because it's a different pattern: whole-product, not single-aspect)
- For score-driven iterative improvement → `/web-evolve` (orchestrator that calls these specialists in targeted mode with `checks:` and `fail_proof:` args)
- For initial design direction → `/impeccable craft` (commits to an aesthetic direction; refinement comes after)

## Anti-Patterns (do NOT do these)

- **Doing the refinement in this skill.** The router invokes the specialist. If you find yourself writing CSS or component code in this context, stop and call `Skill('<specialist>')`.
- **Picking a mode without checking with the user.** If the request is ambiguous ("make this better"), ask which mode they want — don't guess. "Better" is not a mode.
- **Calling multiple specialists in sequence from this router.** That's `/polish` or `/web-evolve`'s job. This router does ONE specialist per invocation.
- **Adding new modes here without adding the specialist.** The router is a lookup, not a place to invent new refinement types.

## Related skills

- The 9 specialists remain user-invocable for backward compatibility but `/refine <mode>` is the preferred entry point.
- `/impeccable` — required preparation, called by every specialist.
- `/polish` — multi-aspect final sweep (different pattern; calls many specialists).
- `/web-evolve` — score-driven loop that calls specialists in targeted mode.
- `/saas-build` Phase 5a — calls polish + typeset + colorize + animate + distill in parallel by name (do NOT change to /refine — the phase requires verifiable Skill() calls to each).
