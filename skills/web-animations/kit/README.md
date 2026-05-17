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

## Use

Either copy individual components into your project's `src/components/` directory, or wire the kit as a local file dependency:

```jsonc
// In consuming project's package.json
{
  "dependencies": {
    "@adam/web-animations-kit": "file:../path/to/skills/web-animations/kit"
  }
}
```

Then import:

```tsx
import { FadeUp, StaggerContainer, MagneticButton, NumberTicker } from '@adam/web-animations-kit'
import { PinnedSection, SmoothScroll, ClipReveal } from '@adam/web-animations-kit'
```

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
