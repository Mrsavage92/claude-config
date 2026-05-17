---
name: stitch-design
description: >
  Design Systems Lead for the Stitch MCP server. Transforms vague UI requests into structured,
  professional prompts. Routes between text-to-design, design-editing, and design system
  documentation workflows. Maintains .stitch/DESIGN.md as the visual source of truth.
  Use BEFORE /web-design-research when doing canvas-based aesthetic exploration.
allowed-tools:
  - "stitch*:*"
  - "Read"
  - "Write"
---

# Skill: /stitch-design

Design Systems Lead specializing in the Stitch MCP server. Use this skill to explore aesthetic directions on the Stitch canvas before locking them in DESIGN-BRIEF.md.

---

## Primary Functions

1. **Text-to-Design** — Transform descriptions into screen mockups via Stitch
2. **Edit-Design** — Refine existing screens iteratively
3. **Generate-Design-MD** — Create `.stitch/DESIGN.md` design system documentation

---

## Prompt Enhancement Process

Before using any Stitch MCP tool:

1. Analyze project context (read existing `.stitch/DESIGN.md` if present)
2. Refine terminology using professional design vocabulary
3. Structure the request with explicit parameters:
   - **Platform** — web / mobile / desktop
   - **Color palette** — named colors with hex values and semantic roles
   - **Stylistic details** — mood, atmosphere, aesthetic direction
   - **Page structure** — numbered sections with component descriptions
4. Surface the enhanced prompt to the user before executing

---

## Workflow Routing

| User intent | Route to |
|---|---|
| "Design a [page]" | Text-to-Design workflow |
| "Change / update / fix [element]" | Edit-Design workflow |
| "Document the design" / "Create design system" | Generate-Design-MD workflow |

---

## Text-to-Design Workflow

1. Run `/enhance-prompt` on the user's description
2. Confirm enhanced prompt with user
3. Call `[stitch_prefix]:generate_screen_from_text` with enhanced prompt
4. Download output to `.stitch/designs/{page}.html` and `.stitch/designs/{page}.png`
5. Present screenshot to user
6. Offer iteration: "Want to refine this, or lock it as the direction?"

---

## Edit-Design Workflow

1. Identify the target screen (from `.stitch/metadata.json` or user description)
2. Describe the edit precisely — one change at a time
3. Call `[stitch_prefix]:edit_screen` with the screen ID and edit prompt
4. Download updated assets
5. Update `.stitch/metadata.json` with new screen metadata

---

## Generate-Design-MD Workflow

After at least one screen is generated and approved:

1. Read the screen's design theme from `.stitch/metadata.json`
2. Download the screen HTML and extract design tokens (colors, fonts, radius, spacing)
3. Write `.stitch/DESIGN.md` with:
   - Color palette (hex values + semantic roles)
   - Typography (font family, weights, scale)
   - Roundness and spacing system
   - Component style notes
   - Section 6: "Design System Notes for Stitch Generation" (copy-paste block for baton prompts)

---

## Key Principles

- **Iterate, don't regenerate** — refine existing screens rather than starting over
- **Semantic naming** — describe colors by role ("primary action", "surface elevated"), not appearance
- **Explicit atmosphere** — always define the mood/vibe in prompts to guide generation quality
- **Consistency via DESIGN.md** — establish `.stitch/DESIGN.md` early; every screen references it

---

## Integration with Your Pipeline

After aesthetic direction is locked in Stitch:

1. `.stitch/DESIGN.md` exists → `/web-design-research` reads it at Step 2 to pre-populate color/typography decisions
2. Run `/web-design-research` to complete competitor research, component lock, and output `DESIGN-BRIEF.md`
3. Pipeline continues normally: `/web-scope` → `/web-scaffold` → `/web-page`

---

## Related Skills

- `/enhance-prompt` — polishes Stitch prompts before generation
- `/stitch-loop` — autonomous multi-page build loop
- `/remotion` — generate walkthrough videos from Stitch screens
- `/web-design-research` — reads `.stitch/DESIGN.md` as aesthetic pre-brief
