# File Templates — web-scaffold

## `package.json`
```json
{
  "name": "project-name",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "serve": "serve -s dist -l $PORT"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "framer-motion": "^11.3.0",
    "lucide-react": "^0.453.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "@radix-ui/react-slot": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.5.3",
    "vite": "^5.4.1",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.11",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "serve": "^14.2.3"
  }
}
```
Add if backend needed: `"@supabase/supabase-js": "^2.45.0"`, `"@tanstack/react-query": "^5.56.0"`, `"@tanstack/react-query-devtools": "^5.56.0"`

---

## `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## `vite.config.ts` — ALWAYS include manual chunks
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 250,
  },
})
```
Only include vendor-query and vendor-supabase if those packages are in package.json.

---

## `postcss.config.js`
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

---

## `tailwind.config.ts`
Standard config with full color token set, type scale (display/hero/title), and animation keyframes. Font family uses the chosen font from design brief.

---

## `src/styles/index.css`
Complete token set from web-system-prompt.md. Set `--primary` to the chosen color. For enterprise: near-neutral primary with vivid `--brand` accent. Apply grain texture utility if dark-first.

---

## `src/lib/utils.ts`
Standard cn() helper.

---

## `src/lib/query-client.ts` (backend only)
Standard QueryClient with staleTime: 60000, retry: 1.

---

## `src/hooks/use-theme.ts`
Standard useTheme hook.

---

## `src/App.tsx`
BrowserRouter with route for `/` (Landing), `/auth` (Auth), and protected app routes. All app routes lazy-loaded.

---

## `CLAUDE.md`
```markdown
# [Product Name] — Claude Context

## Stack
React 18 + Vite + TypeScript + Tailwind CSS v3 + shadcn/ui + Framer Motion
Backend: [Supabase / FastAPI on Railway / none]

## Design System
- Design DNA: read ~/.claude/web-system-prompt.md before any UI work
- Style: enterprise | expressive
- Reference: [one site]
- Primary color: hsl([H] [S]% [L]%)
- COLOR JOB: primary is used ONLY for [CTA buttons] and [active nav indicator]
- Font: [choice]
- Mode: dark-first | light-first
- Radius: [value]

## Pages (from SCOPE.md)
[List every page route and one-sentence purpose]

## Conventions
- Named exports only
- Max 150 lines per component
- All colors via CSS variables
- EmptyState component for all empty states — always includes a CTA
- Status indicators: muted dot + text only — never colored badge fills
- Typography: use type scale (text-display/hero/title) not just text-sm everywhere

## shadcn/ui
Components in src/components/ui/ — never edit directly.
Add: npx shadcn@latest add [component]
```

---

## `vercel.json`
Always generate this at the project root — every React Router SPA needs it. Do not wait until deploy.
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## `.env.example`
List all VITE_* env vars the project needs. For SaaS products with auth always include:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRO_PRICE_ID=price_...   # Replace with real price ID before go-live
VITE_API_URL=https://your-railway-service.up.railway.app
```

---

## `vitest.config.ts`
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: { environment: 'jsdom', setupFiles: ['./src/tests/setup.ts'] },
})
```

## `src/tests/setup.ts`
```ts
import '@testing-library/jest-dom'
```

---

## `src/components/layout/AppLayout.tsx`
MUST include skip-nav as first element AND trial banner above content area:
```tsx
import { TrialBanner } from '@/components/layout/TrialBanner'

export function AppLayout() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex h-screen flex-col">
        <TrialBanner />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main id="main-content" className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
```

---

## `src/components/ui/EmptyState.tsx`
Reusable empty state — generated once, used everywhere:
```tsx
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  heading: string
  description: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ icon: Icon, heading, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-16 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="max-w-xs">
        <p className="text-sm font-medium text-foreground">{heading}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
```

---

## Landing Page — `src/components/landing/` + `src/pages/Landing.tsx`

Landing page is built during scaffold — not deferred. The hero is the most important file in the project.

**Before writing a single component: check for DESIGN-BRIEF.md in the project root.**

- **If DESIGN-BRIEF.md exists** → read the FULL brief, not just the Component Lock. Required sections to load and execute:
  - **Aesthetic Direction** (brutalist/maximalist/luxury/etc.) — drives implementation complexity. Maximalist needs elaborate code with extensive animations; minimalist needs restraint and precision.
  - **Memorability hook** — the one detail that must be unforgettable. Build it deliberately, do not water down.
  - **Component Lock table** — use the exact components listed. Do NOT re-run MCP queries.
  - **Visual Atmosphere & Motion** — background atmosphere, motion strategy, surprise hover element, and decorative detail layer are MANDATORY to implement. The brief overrides the hardcoded defaults below.
- **If DESIGN-BRIEF.md is missing** → run `/web-design-research` first. Do not proceed without it.

**Brief-vs-default precedence:** The hardcoded defaults below (BackgroundGradientAnimation, ProductMockup, etc.) are ONLY fallbacks for when the brief doesn't lock a choice. If the brief locks a Background Atmosphere = "Noise/grain" or "Photographic backdrop", do NOT install BackgroundGradientAnimation — execute what the brief says. Same for Motion Strategy and the Surprise Hover element.

Landing page section order: [Banner] → Nav → Hero (animated bg) → Logo Cloud → Stats → Features → Testimonials → Pricing → FAQ → Final CTA → Footer

**Build sequence:**

0. **Announcement Banner (optional)** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `announcement banner bar`. Use `Banner 1`. Mount above navbar. Include only when there's a real announcement.

1. **Animated background** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `animated background gradient`. Use `BackgroundGradientAnimation` (interactive WebGL blobs). `opacity: 0.15-0.2`, `z-index: -1`, lazy-loaded. NO CSS fallback — mandatory.

2. **Hero section** — structure: Nav (extract from `HeroSection 2`) → background → headline → subheadline → CTAs → trust stats → product visual. Apply Framer Motion staggered entrance from `web-animations` skill Technique 3.

3. **Product visual** — a simulated UI mockup showing the actual app. Built from shadcn Card, Skeleton, Badge. Includes browser chrome (three colored dots + URL bar), a sidebar column of muted icon shapes, and a content area with mock stat cards + a data table row. Adapt KPI labels to the product. Never just a gradient blob. Wrap in a glow div: `absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand/15 to-transparent blur-2xl`.

**ProductMockup template (adapt labels per product):**
```tsx
export function ProductMockup() {
  return (
    <div className="relative mx-auto max-w-2xl">
      {/* Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand/15 to-transparent blur-2xl" />
      {/* Browser chrome */}
      <div className="relative rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/30 px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
          <div className="ml-3 h-4 flex-1 max-w-[160px] rounded bg-muted/60 text-[10px] text-muted-foreground flex items-center px-2">
            app.[product].com
          </div>
        </div>
        <div className="flex h-48">
          {/* Sidebar */}
          <div className="flex w-10 flex-col items-center gap-2 border-r border-border/30 bg-muted/20 py-3">
            {[true, false, false, false].map((active, i) => (
              <div key={i} className={`h-5 w-5 rounded ${active ? 'bg-primary/80' : 'bg-muted/60'}`} />
            ))}
          </div>
          {/* Content */}
          <div className="flex-1 p-3 space-y-2">
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2">
              {[['KPI 1', '124'], ['KPI 2', '89%'], ['KPI 3', '12']].map(([label, val]) => (
                <div key={label} className="rounded border border-border/40 bg-background/60 p-2">
                  <div className="text-[9px] text-muted-foreground">{label}</div>
                  <div className="text-xs font-semibold text-foreground">{val}</div>
                  <div className="mt-1 h-0.5 w-full rounded bg-primary/40" />
                </div>
              ))}
            </div>
            {/* Table rows */}
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2 rounded border border-border/20 bg-muted/10 px-2 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500/70" />
                <div className="h-2 flex-1 rounded bg-muted/50" />
                <div className="h-3 w-8 rounded-full bg-muted/40 text-[8px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```
Swap `[product]`, `KPI 1/2/3` labels, and dot colors to match the actual product before using.

4. **Logo Cloud** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `logo cloud marquee`. Use `Logo Cloud 4` (`InfiniteSlider` + `ProgressiveBlur`). Source SVGs from `svgl.app`. Heading: "Trusted by teams at" in `text-muted-foreground`.

4b. **Stats / CountUp** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `stats metrics counter`. Use `CaseStudies`. Install `react-countup` with `enableScrollSpy: true`. Minimum 3 stats from product value prop. Dark bg section to visually break from logo cloud.

5. **Features section** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `features grid section`. Use `Features 4` (border-grid, icon + title + body). Apply `whileInView` stagger from `web-animations` Technique 3. Alternative: `BentoGrid` (searchQuery: `bento grid layout`) when a hero feature needs colSpan emphasis.

6. **Testimonials** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `testimonials social proof`. Use `TestimonialSlider` (Framer Motion `AnimatePresence`, photo, stars, dots). Minimum 3 testimonials.

7. **Pricing section** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `pricing cards section`. Use `PricingCard` (glass-effect, `backdrop-blur`). 3 tiers, center: `border-primary/50 bg-primary/5 shadow-lg` + "Popular" badge. Pre-launch: skip Pricing, go to step 7b instead.

7b. **Waitlist (pre-launch only — replaces Pricing + Final CTA)** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `waitlist email capture`. Use `WaitlistHero` or `WaitlistForm`. Connect to Supabase `waitlist` table. Show position number on submit.

8. **FAQ** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `FAQ accordion`. Use `Faqs 1` (rounded card + shadcn Accordion). Alternative: `RuixenAccordian02` (two-column, General/Billing/Technical). Minimum 5 questions with real answers.

9. **Final CTA** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `call to action section`. Use `Cta 4`.

10. **Footer** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `footer website`. Use `Footer 2` (multi-column with legal row).

**Landing page rules:**
- `mcp__magic__21st_magic_component_inspiration` is called BEFORE writing any complex section — not after
- `BackgroundGradientAnimation` is mandatory — no CSS fallback accepted
- Product visual mockup is mandatory — shadcn components shaped like the real app, never a blob
- Stats/CountUp section is mandatory — install `react-countup` every build
- FAQ section is mandatory — minimum 5 questions before Final CTA
- All sections use `whileInView` + `viewport={{ once: true }}` — see `web-animations` skill Technique 3
- Landing page without Logo Cloud, Stats, Testimonials, FAQ, and Footer 2 is incomplete
