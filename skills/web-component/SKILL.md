# /web-component

Generate a single production-quality UI component with enterprise-level design.

## When to Use
- Adding a new component to an existing project
- User describes a specific UI element (card, nav, pricing table, testimonial, stat block, etc.)

---

## Process

### Step 1 — Read Context
Read `~/.claude/web-system-prompt.md`. Then read the project's:
- `src/styles/index.css` — active color tokens and fonts
- `tailwind.config.ts` — type scale, custom values
- `CLAUDE.md` (if present in project root) — project-specific conventions

### Step 2 — Classify the Component

**Standard interactive component** (button, input, dialog, dropdown, badge, tooltip, tabs, card, form, table, sheet, select, checkbox, switch, avatar, skeleton)
- Always check shadcn/ui first: `npx shadcn@latest add [component]`
- Customise via `cva()` variant system — never rebuild from scratch
- Never edit files in `src/components/ui/`

**Complex visual/marketing component** (pricing table, feature grid, testimonial carousel, stat counter, timeline, logo cloud, comparison table, step indicator)
- **First: check DESIGN-BRIEF.md Component Lock table** — if this component is a landing page section (hero, logo cloud, features, testimonials, pricing, FAQ, stats, footer), the exact 21st.dev component is already chosen. Use it. Do NOT re-run MCP.
- If the component is NOT in the Component Lock (e.g. a new in-app component, dashboard widget): `mcp__magic__21st_magic_component_inspiration` — find reference designs, then `mcp__magic__21st_magic_component_builder` — generate it
- If logos needed: `mcp__magic__logo_search`

**Layout / structural component** (hero section, navbar, footer, section background, page wrapper, sidebar)
- Build with Tailwind + Framer Motion
- Apply Visual Signature Elements from web-system-prompt.md (gradient mesh, grain, grid lines, glassmorphism, border glow)
- Choose the right element for the project tone: gradient mesh for marketing, grid lines for SaaS/dev tools, grain for dark premium

### Step 3 — Design Intention Check
Before generating, answer internally:
1. What does the best version of this component look like on Linear, Stripe, or Vercel?
2. What makes it distinctive vs generic AI output?
3. What micro-interaction (hover, focus, scroll trigger) would elevate it?
4. Should it use a Visual Signature Element (gradient mesh, border glow, glassmorphism)?

### Step 4 — Generate the Component

Non-negotiable rules:
- Under 150 lines — split into sub-components if needed
- Named export only — no default exports
- TypeScript interface for all props, `className?: string` always included
- All colors via CSS variables (`hsl(var(--primary))`, `text-foreground`) — never hardcoded hex/rgb
- No raw Tailwind color classes (`text-gray-500`, `bg-white`) — use semantic tokens
- `cn()` from `@/lib/utils` for all conditional classes
- Framer Motion `whileInView` + `fadeUp` pattern for all non-trivial components
- Hover state on every interactive element
- Mobile-first responsive: base styles for 375px, then `sm:`, `md:`, `lg:`
- `prefers-reduced-motion` is handled globally in index.css — no need to repeat per component

### Step 5 — Standard Component Template

```tsx
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface [ComponentName]Props {
  // define all props explicitly
  className?: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

export function [ComponentName]({ className, ...props }: [ComponentName]Props) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground',
        // always semantic tokens — never hardcoded colors
        className
      )}
    >
      {/* content */}
    </motion.div>
  )
}
```

### Step 6 — Stagger Pattern (for lists and grids)

```tsx
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

// Parent
<motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {items.map(item => (
    <motion.div key={item.id} variants={fadeUp}>
      {/* item */}
    </motion.div>
  ))}
</motion.div>
```

### Step 7 — Adapt to Project Design System
After generating (especially after 21st Magic output):
1. Replace any hardcoded hex/rgb with `hsl(var(--token))`
2. Replace raw Tailwind colors (`text-gray-500`) with semantic tokens (`text-muted-foreground`)
3. Apply the project's font family via `font-sans` class
4. Match border radius to `rounded-lg` / `rounded-md` (these reference `--radius`)
5. Confirm dark mode works — `.dark` class variants should activate via CSS variables automatically

### Step 8 — Output
- Write file to `src/components/[category]/[ComponentName].tsx`
  - shadcn → `ui/`
  - Layout/nav/footer → `layout/`
  - Page sections → `sections/`
  - Feature-specific → `[feature-name]/`
- Print shadcn install command if new shadcn components were needed
- Show the import path and a usage example

---

## Rules
- shadcn/ui FIRST for any interactive component — never rebuild what already exists
- 21st Magic FIRST for visual/marketing components — check inspiration before building
- Framer Motion scroll animation on every non-trivial component
- Max 150 lines — split before hitting the limit, not after
- Both light and dark mode must work without any additional effort (CSS variables handle it)
