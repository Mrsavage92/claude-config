# @adam/web-animations-kit

Runnable, tested components for the `/web-animations` skill. Used by `web-scaffold` and `web-page` as a copy-source instead of regenerating snippets each time.

## Install

This kit lives in `~/.claude/skills/web-animations/kit/`. To install:

```bash
cd ~/.claude/skills/web-animations/kit
npm install
```

Peer dependencies in the consuming project:

```bash
npm install motion gsap lenis
```

## Use — three integration paths

### Path A: copy individual files (simplest, works in any project)

```bash
# From inside the consuming project, after npm install motion gsap lenis
SRC="$HOME/.claude/skills/web-animations/kit/src"
DEST="./src/components/motion"

mkdir -p "$DEST"
cp "$SRC/tier1/FadeUp.tsx" "$DEST/"
cp "$SRC/tier1/StaggerContainer.tsx" "$DEST/"
cp "$SRC/tier1/variants.ts" "$DEST/"
cp "$SRC/utils/easings.ts" "$DEST/"

# Add more components as needed — preserve the `// web-animations: Tier N` marker
```

Then in your project:

```tsx
import { FadeUp } from './components/motion/FadeUp'
import { StaggerContainer } from './components/motion/StaggerContainer'
```

Path A is the recommended adoption pattern for `web-scaffold` / `web-page` downstream skills — the markers travel with the file, the grader sees them, no peer-dep negotiation.

### Path B: local file dependency (kit lives in-tree)

```jsonc
// Consuming project's package.json
{
  "dependencies": {
    "@adam/web-animations-kit": "file:../path/to/skills/web-animations/kit"
  }
}
```

```bash
npm install
```

Then import:

```tsx
import { FadeUp, StaggerContainer, MagneticButton, NumberTicker } from '@adam/web-animations-kit'
import { PinnedSection, SmoothScroll, ClipReveal } from '@adam/web-animations-kit'
```

Path B keeps the kit as a single canonical copy. Trade-off: a project move breaks the file path; the kit's own peerDeps must align with the project's React + motion versions.

### Path C: monorepo workspace

If your project is in a workspace (turborepo, pnpm workspaces, nx):

```jsonc
// Root package.json
{
  "workspaces": ["apps/*", "packages/*", "skills/web-animations/kit"]
}
```

Then symlink or include the kit as a workspace package. Same import as Path B.

## Required peerDeps in the consuming project

```bash
# Tier 1–2
npm install motion

# Add for Tier 3 JS-driven
npm install gsap lenis

# Already pinned in kit's peerDependencies; consuming project supplies the versions
```

If using the zero-JS Tier 3 components (`CSSScrollReveal`, `CSSScrollProgress`, `TransitionLink`), no extra deps — only `react` and `react-dom`.

## Tier reference

| Tier | Components |
|---|---|
| 1 — Baseline | `FadeUp`, `StaggerContainer` |
| 2 — Escalation | `SpringButton`, `MagneticButton`, `NumberTicker`, `SplitReveal`, `Marquee`, `AnimatedModal`, `SharedLayoutCard` |
| 3 — Signature | `PinnedSection`, `SmoothScroll`, `ClipReveal`, `CursorParallax`, `CardStack`, `TiltCard`, `StickyHeader` |
| 4 — Overdrive | See `/overdrive` skill — not included in this kit |

See `~/.claude/skills/web-animations/SKILL.md` for the decision matrix, performance contract, and full pattern reference.

## Test

```bash
npm test           # vitest unit tests
npm run test:e2e   # playwright reduced-motion compliance spec (requires a dev server at PLAYWRIGHT_BASE_URL)
npm run typecheck  # tsc --noEmit
```

## Marker convention

Generated code that uses kit components MUST include a marker comment so the `audit-animations.mjs` grader can verify tier compliance:

```tsx
// web-animations: Tier 2 (T2.2 MagneticButton)
<MagneticButton>Click</MagneticButton>
```

Run the grader against any project:

```bash
node ~/.claude/skills/web-animations/grader/audit-animations.mjs ./path/to/project
```

Non-zero exit code indicates motion code without a tier marker.
