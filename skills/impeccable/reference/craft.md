# Craft Flow

Build a feature with impeccable UX and UI quality through a structured process: shape the design, load the right references, then build and iterate visually until the result is delightful.

---

## Step 0: Source Mandate (READ FIRST — refinement-contract.md integration)

`/impeccable craft` is **the production engine** for the web suite's refinement contract (`~/.claude/skills/shared/refinement-contract.md`). When invoked by `/web-evolve` Phase C or by a refinement skill (`/typeset`, `/colorize`, `/layout`, `/animate`, `/polish`, `/optimize`, `/adapt`, `/clarify`, `/overdrive`, `/delight`, `/calibrate-amplitude`), craft MUST receive AT LEAST ONE of these in args, or HALT:

- `reference: <url>` — live URL whose tokens to mirror (fire `Skill('style-mirror', args='extract | urls: [...]')` first if not yet extracted)
- `extract: <path>` — path to a pre-extracted JSON at `.evolution/extracts/<slug>.json` or `tokens.lock.json`
- `taste_section: <id>` — pointer into `~/.claude/skills/taste-skill/SKILL.md` (e.g. `8.6` for kinetic typography arsenal)
- `memorable_choice: <string>` — locked at `/web-evolve` Phase A.4

**Direct-user-invocation exception:** if a human invokes `/impeccable craft` directly (not via another skill), the source mandate is RELAXED — Step 1 (`/shape`) becomes the de-facto context source. But the HALT-without-source rule applies to programmatic invocations from refinement skills or `/web-evolve`.

If invoked programmatically with no source → HALT: `"impeccable craft requires reference / extract / taste_section / memorable_choice in args (refinement-contract.md §1). The orchestrator should pass sources from .evolution/refinement-sources.json."`

### The Reach Test (`// SOURCE:` comments — refinement-contract §3)

Every file craft touches MUST start with one or more `// SOURCE:` comments naming the input that drove the change:

```tsx
// SOURCE: extract:.evolution/extracts/linear-app.json (color.brand_accent, typography.heading_family)
// SOURCE: taste-skill:Section 8.6 (kinetic typography — variable-axis on scroll)
// SOURCE: memorable_choice "one-word kinetic display that re-types on scroll into view"

export function Hero() { ... }
```

`/web-evolve` Phase C iter-acceptance scans diffs for these comments. Missing `// SOURCE:` → iter VOIDed + reverted (Principle 7).

### Per-dimension Reflex-Reject lists (auto-FAIL unless source contains the pattern)

The font-selection procedure in `/impeccable` is rigorous about training-data defaults. Apply the same rigor to color, layout, motion. Defer to `taste-skill` Section 7 (banned fonts/colors/content) as the canonical list. Quick reference:

**Typography reflex-rejects:** Inter, DM Sans, Plus Jakarta, Outfit, Instrument, IBM Plex (all), Fraunces, Newsreader, Playfair, Cormorant. Geist allowed ONLY with Geist Mono for technical UIs.

**Color reflex-rejects:** shadcn defaults (slate/zinc/neutral/stone/gray), cyan-on-dark, purple-to-blue gradients, neon-on-dark, #000 / #fff (always tint).

**Layout reflex-rejects:** uniform card grid (3+ identical cards in a row), bento grid as default features pattern, hero-metric template (big-number + small-label + supporting-stats), centered everything.

**Motion reflex-rejects:** Framer Motion as the only motion library, bounce/elastic easing, layout-property animations (width/height/top/left), generic scroll-progress bar, generic AOS-style fade-on-scroll on every section.

**Visual-detail reflex-rejects:** side-stripe borders (border-left 3-4px colored), gradient text via background-clip, rounded rectangles with generic drop shadow, glassmorphism-everywhere, sparklines-as-decoration.

If the source explicitly contains a reflex-reject (e.g. extract shows the reference uses Inter), replication wins. Otherwise these are auto-FAIL.

### Output contract for programmatic invocations

Return a structured response, not prose:

```json
{
  "mode": "craft",
  "files_changed": ["app/(marketing)/page.tsx", "app/globals.css", ...],
  "sources_used": [
    {"type": "extract", "ref": ".evolution/extracts/linear-app.json", "tokens_consumed": ["color.brand_accent", "typography.heading_family"]},
    {"type": "taste_section", "ref": "8.6"},
    {"type": "memorable_choice", "ref": "kinetic display that re-types on scroll"}
  ],
  "reach_test_comments_added": 4,
  "reflex_rejects_avoided": ["Inter substitution", "shadcn slate default"],
  "summary": "Hero rebuilt with Geist + Geist Mono pairing, SplitText character animation on scroll, brand_accent applied to single CTA only."
}
```

---

## Step 1: Shape the Design

Run /shape, passing along whatever feature description the user provided.

Wait for the design brief to be fully confirmed before proceeding. The brief is your blueprint, and every implementation decision should trace back to it.

If the user has already run /shape and has a confirmed design brief, skip this step and use the existing brief.

## Step 2: Load References

Based on the design brief's "Recommended References" section, consult the relevant impeccable reference files. At minimum, always consult:

- [spatial-design.md](spatial-design.md) for layout and spacing
- [typography.md](typography.md) for type hierarchy

Then add references based on the brief's needs:
- Complex interactions or forms? Consult [interaction-design.md](interaction-design.md)
- Animation or transitions? Consult [motion-design.md](motion-design.md)
- Color-heavy or themed? Consult [color-and-contrast.md](color-and-contrast.md)
- Responsive requirements? Consult [responsive-design.md](responsive-design.md)
- Heavy on copy, labels, or errors? Consult [ux-writing.md](ux-writing.md)

## Step 3: Build

Implement the feature following the design brief. Work in this order:

1. **Structure first**: HTML/semantic structure for the primary state. No styling yet.
2. **Layout and spacing**: Establish the spatial rhythm and visual hierarchy.
3. **Typography and color**: Apply the type scale and color system.
4. **Interactive states**: Hover, focus, active, disabled.
5. **Edge case states**: Empty, loading, error, overflow, first-run.
6. **Motion**: Purposeful transitions and animations (if appropriate).
7. **Responsive**: Adapt for different viewports. Don't just shrink; redesign for the context.

### During Build
- Test with real (or realistic) data at every step, not placeholder text
- Check each state as you build it, not all at the end
- If you discover a design question, stop and ask rather than guessing
- Every visual choice should trace back to something in the design brief

## Step 4: Visual Iteration

**This step is critical.** Do not stop after the first implementation pass.

Open the result in a browser window. If browser automation tools are available, use them to navigate to the page and visually inspect the result. If not, ask the user to open it and provide feedback.

Iterate through these checks visually:

1. **Does it match the brief?** Compare the live result against every section of the design brief. Fix discrepancies.
2. **Does it pass the AI slop test?** If someone saw this and said "AI made this," would they believe it immediately? If yes, it needs more design intention.
3. **Check against impeccable's DON'T guidelines.** Fix any anti-pattern violations.
4. **Check every state.** Navigate through empty, error, loading, and edge case states. Each one should feel intentional, not like an afterthought.
5. **Check responsive.** Resize the viewport. Does it adapt well or just shrink?
6. **Check the details.** Spacing consistency, type hierarchy clarity, color contrast, interactive feedback, motion timing.

After each round of fixes, visually verify again. **Repeat until you would be proud to show this to the user.** The bar is not "it works"; the bar is "this delights."

## Step 5: Present

Present the result to the user:
- Show the feature in its primary state
- Walk through the key states (empty, error, responsive)
- Explain design decisions that connect back to the design brief
- Ask: "What's working? What isn't?"

Iterate based on feedback. Good design is rarely right on the first pass.
