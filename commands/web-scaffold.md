# /web-scaffold

Bootstrap a production-ready React web application with enterprise-quality design from the ground up.

## When to Use
- Starting a new web project, SaaS, landing page, or dashboard
- Always run /web-scope first if starting a new product — scaffold uses SCOPE.md decisions

---

## Process

### Step 1 — Read Design DNA + Scope
Read `~/.claude/web-system-prompt.md` in full.
If `SCOPE.md` exists in project root: read it and use its design decisions. Skip Step 2.
If no SCOPE.md: run /web-scope first, then return here.

### Step 2 — Design Brief (only if no SCOPE.md)
Decide all of these yourself if the user says "just build it":

1. **Enterprise or expressive?** Professional/B2B tool = enterprise defaults (neutral palette, restrained color). Consumer/creative = expressive defaults.
2. **Tone:** Bold/Confident | Calm/Trustworthy | Playful/Modern | Premium | Technical
3. **Reference site:** pick ONE (linear.app | vercel.com | stripe.com | resend.com | clerk.com)
4. **Color:** For enterprise — near-neutral primary (deep slate/indigo). For expressive — vivid signature hue.
5. **Color job (critical):** "The primary color is used ONLY for [primary CTA buttons] and [active nav indicator]. Nothing else."
6. **Font, mode, border radius**

### Step 3 — Design System Decisions (document before coding)

Write these to CLAUDE.md before generating any component:
- Signature color HSL value
- Color job (the one sentence rule)
- Font name
- Mode (dark/light first)
- Border radius

### Step 4 — Generate All Files

#### `package.json`
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

#### `tsconfig.json`
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

#### `tsconfig.node.json`
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

#### `vite.config.ts` — ALWAYS include manual chunks
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

#### `postcss.config.js`
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

#### `tailwind.config.ts`
Standard config with full color token set, type scale (display/hero/title), and animation keyframes. Font family uses the chosen font from design brief.

#### `src/styles/index.css`
Complete token set from web-system-prompt.md. Set `--primary` to the chosen color. For enterprise: near-neutral primary with vivid `--brand` accent. Apply grain texture utility if dark-first.

#### `src/lib/utils.ts`
Standard cn() helper.

#### `src/lib/query-client.ts` (backend only)
Standard QueryClient with staleTime: 60000, retry: 1.

#### `src/hooks/use-theme.ts`
Standard useTheme hook.

#### `src/components/layout/TrialBanner.tsx`
Generated in every SaaS scaffold with auth. Hidden when subscription is active. Trial model from SCOPE.md determines default trial days.

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UpgradeButton } from '@/components/billing/UpgradeButton'

interface OrgRecord {
  trial_ends_at: string | null
  subscription_status: string | null
}

export function TrialBanner() {
  const [org, setOrg] = useState<OrgRecord | null>(null)

  useEffect(() => {
    supabase
      .from('organizations')
      .select('trial_ends_at, subscription_status')
      .single()
      .then(({ data }) => setOrg(data))
  }, [])

  if (!org) return null
  if (org.subscription_status === 'active') return null
  if (!org.trial_ends_at) return null

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(org.trial_ends_at).getTime() - Date.now()) / 86_400_000)
  )

  if (daysLeft === 0) {
    return (
      <div className="flex items-center justify-center gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm">
        <span className="text-destructive font-medium">Your trial has expired.</span>
        <UpgradeButton priceId={import.meta.env.VITE_STRIPE_PRO_PRICE_ID} label="Upgrade now" size="sm" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3 border-b border-border bg-muted/40 px-4 py-2 text-sm">
      <span className="text-muted-foreground">
        <span className="font-medium text-foreground">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span> left in your free trial.
      </span>
      <UpgradeButton priceId={import.meta.env.VITE_STRIPE_PRO_PRICE_ID} label="Upgrade now" size="sm" variant="outline" />
    </div>
  )
}
```

**Rules:**
- Hidden when `subscription_status === 'active'` — never shown to paying customers
- Shown on ALL app pages inside AppLayout — never page-specific
- Upgrade link uses `VITE_STRIPE_PRO_PRICE_ID` env var — replace placeholder before go-live
- Trial expiry urgency: 0 days uses destructive color; 1-7 uses default warning tone; 8+ uses muted
- If product uses free-trial-no-card model, `trial_ends_at` is set at signup — no card required until upgrade

#### `src/components/layout/AppLayout.tsx`
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

#### `src/components/ui/EmptyState.tsx`
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

#### `src/components/landing/` + `src/pages/Landing.tsx`
Landing page is built during scaffold — not deferred. The hero is the most important file in the project.

**Before writing a single component: check for DESIGN-BRIEF.md in the project root.**

- **If DESIGN-BRIEF.md exists** → read the Component Lock table. Use the exact components listed there. Do NOT re-run MCP queries. The research phase already made these decisions.
- **If DESIGN-BRIEF.md is missing** → run `/web-design-research` first. Do not proceed without it.

The Component Lock table in DESIGN-BRIEF.md lists the exact 21st.dev component for every section. It also records the hero architecture pattern (Centered/Split-pane/Full-screen/Minimal). Follow it exactly — the choices were made based on this product's specific personality and competitor landscape.

Landing page section order: [Banner] → Nav → Hero (animated bg) → Logo Cloud → Stats → Features → Testimonials → Pricing → FAQ → Final CTA → Footer

**Build sequence for landing page:**

0. **Announcement Banner (optional)** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `announcement banner bar`. Use `Banner 1`. Mount above navbar. Include only when there's a real announcement (launch, beta, promo). If nothing real to announce, skip.

1. **Animated background** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `animated background gradient`. Use `BackgroundGradientAnimation` (interactive WebGL blobs). `opacity: 0.15-0.2`, `z-index: -1`, lazy-loaded. NO CSS fallback — this is mandatory.

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

**Rules:**
- `mcp__magic__21st_magic_component_inspiration` is called BEFORE writing any complex section — not after
- `BackgroundGradientAnimation` is mandatory — no CSS fallback accepted
- Product visual mockup is mandatory — shadcn components shaped like the real app, never a blob
- Stats/CountUp section is mandatory — install `react-countup` every build
- FAQ section is mandatory — minimum 5 questions before Final CTA
- All sections use `whileInView` + `viewport={{ once: true }}` — see `web-animations` skill Technique 3
- Landing page without Logo Cloud, Stats, Testimonials, FAQ, and Footer 2 is incomplete

#### `src/main.tsx` — Sentry error monitoring (SaaS products mandatory)
Add Sentry before `createRoot`. Skip for pure landing pages without auth.

```tsx
import * as Sentry from '@sentry/react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
  ],
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enabled: import.meta.env.PROD,
})

createRoot(document.getElementById('root')!).render(
  <Sentry.ErrorBoundary fallback={<p className="p-8 text-destructive">Something went wrong. Please refresh.</p>}>
    <App />
  </Sentry.ErrorBoundary>
)
```

Add to `.env.example`:
```
VITE_SENTRY_DSN=https://...@sentry.io/...   # Get from Sentry project settings
```

Add to Vercel dashboard: `VITE_SENTRY_DSN`

**Package:** `npm install @sentry/react`

**Rules:**
- `enabled: import.meta.env.PROD` — never sends events in dev
- Wrap root `<App />` in `<Sentry.ErrorBoundary>` — catches all unhandled React render errors
- `tracesSampleRate: 0.2` — 20% of transactions traced (keeps free tier comfortable)
- `replaysOnErrorSampleRate: 1.0` — always capture replay on error (critical for debugging)

#### `src/App.tsx`
BrowserRouter with route for `/` (Landing), `/auth` (Auth), and protected app routes. All app routes lazy-loaded.

#### `CLAUDE.md`
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

#### `vercel.json`
Always generate this at the project root — every React Router SPA needs it. Do not wait until deploy.
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### `.env.example`
List all VITE_* env vars the project needs. For SaaS products with auth always include:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRO_PRICE_ID=price_...   # Replace with real price ID before go-live
VITE_API_URL=https://your-railway-service.up.railway.app
```

#### `public/site.webmanifest` — PWA manifest (generated at scaffold time)

```json
{
  "name": "[Product Name]",
  "short_name": "[Slug]",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Add these two tags to `index.html` `<head>` immediately after the favicon link:
```html
<link rel="manifest" href="/site.webmanifest" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```

Log NEEDS_HUMAN: "Add icon-192.png and icon-512.png to /public — use a square version of the product logo."

### Step 5 — Install + shadcn Init

**Tests directory is created at scaffold time, not after pages are built.**

```bash
npm install
npx shadcn@latest init
npx shadcn@latest add button input label card dialog dropdown-menu sheet toast sonner separator badge skeleton avatar tabs table select textarea
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

After install, create `vitest.config.ts`:
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

Create `src/tests/setup.ts`:
```ts
import '@testing-library/jest-dom'
```

The `src/tests/` directory is the home for all test files written in Phase 4.5. Create it now so the path exists.

**shadcn v4 CSS overwrite guard (mandatory — do not skip):**
After running the above, check `src/styles/index.css` for the string `oklch(`. If found, shadcn v4 has overwritten the design system tokens with oklch-format values.

Restore using the Complete Token Set from the **Color System** section of `~/.claude/web-system-prompt.md` (already read in Step 1 — it is in memory). Apply these rules when restoring:
- Replace `--primary` with the project's chosen HSL value from the design brief
- Replace `--brand` with the project's signature color HSL value
- Replace the `@import` URL with the chosen Google Font
- Keep all other token names and structure exactly as in the template

The restored file must contain only HSL space-separated values — no `oklch()`, no `rgb()`, no hex. This check is required every scaffold.

### Step 6 — Output
```
Scaffolded: [name]
Style: enterprise | expressive | reference: [site]
Primary: hsl([value]) — used for CTA + active nav only
Font: [choice] | Mode: [dark/light] | Radius: [value]

Files generated: [count]
Landing page: included (built in Phase 4 of /saas-build)

Next: /web-supabase (if backend) → /web-page (landing first)
```

#### `src/hooks/useSeo.ts` — Per-page SEO

```ts
// src/hooks/useSeo.ts
import { useEffect } from 'react'

interface SeoOptions {
  title: string
  description?: string
  image?: string    // absolute URL for OG image
  noIndex?: boolean
}

export function useSeo({ title, description, image, noIndex }: SeoOptions) {
  useEffect(() => {
    // Title
    document.title = title ? `${title} | [ProductName]` : '[ProductName]'

    // Description
    const desc = document.querySelector('meta[name="description"]')
    if (desc && description) desc.setAttribute('content', description)

    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDesc = document.querySelector('meta[property="og:description"]')
    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogTitle) ogTitle.setAttribute('content', document.title)
    if (ogDesc && description) ogDesc.setAttribute('content', description)
    if (ogImage && image) ogImage.setAttribute('content', image)

    // noIndex
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    if (noIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta')
        robotsMeta.name = 'robots'
        document.head.appendChild(robotsMeta)
      }
      robotsMeta.content = 'noindex, nofollow'
    } else if (robotsMeta) {
      robotsMeta.content = 'index, follow'
    }
  }, [title, description, image, noIndex])
}
```

Seed `index.html` with base meta tags (replace placeholders during scaffold):
```html
<!-- in <head> -->
<title>[ProductName]</title>
<meta name="description" content="[One-sentence product description]" />
<meta property="og:title" content="[ProductName]" />
<meta property="og:description" content="[One-sentence product description]" />
<meta property="og:image" content="[ProductURL]/og-image.png" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="robots" content="index, follow" />
```

Usage on every page:
```tsx
useSeo({
  title: 'Dashboard',
  description: 'Monitor your [product] performance.',
})
```

**Auth/settings/onboarding pages: always set `noIndex: true`** — only public pages should be indexed.

---

#### `src/pages/NotFoundPage.tsx` — 404

```tsx
// src/pages/NotFoundPage.tsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  useEffect(() => { document.title = 'Page not found' }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-muted-foreground/20 mb-4 select-none">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="gap-2">
          <Link to="/"><ArrowLeft className="h-4 w-4" />Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
```

Register in `App.tsx` as the catch-all route:
```tsx
const NotFoundPage = React.lazy(() =>
  import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage }))
)

// Always last route in router
<Route path="*" element={
  <Suspense fallback={null}>
    <NotFoundPage />
  </Suspense>
} />
```

---

## Rules
- vite.config.ts MUST always include manualChunks — no exceptions
- tsconfig.json MUST always include "types": ["vite/client"]
- vercel.json MUST be generated at project root — every React Router SPA needs it from day one
- EmptyState component MUST be generated in every scaffold
- AppLayout MUST include skip-nav AND TrialBanner (SaaS with auth)
- TrialBanner MUST be generated in every SaaS scaffold — hidden by subscription_status, not removed
- Sentry MUST be initialised in main.tsx for every SaaS product — skip only for pure landing pages without auth
- CLAUDE.md MUST include the color job sentence
- Landing page route MUST exist in App.tsx from day one (even if page not built yet)
- Landing page MUST use specific 21st.dev components by name — see Component Registry in `premium-website.md`
- `BackgroundGradientAnimation` is the ONLY acceptable animated background — CSS grid is not sufficient
- Logo Cloud, Testimonials, Final CTA, and Footer 2 sections are all mandatory — a landing page without them is incomplete
- `useSeo` hook MUST be generated in every scaffold and called on every page
- `NotFoundPage` MUST be generated in every scaffold and registered as the `path="*"` catch-all route
- `index.html` MUST include base OG + Twitter meta tags — replace placeholders during scaffold
- Auth, settings, and onboarding pages MUST set `noIndex: true` in useSeo
- `vitest.config.ts` + `src/tests/setup.ts` MUST be created at scaffold time — never deferred to after pages are built
- `public/site.webmanifest` MUST be generated at scaffold time with `<link rel="manifest">` + `<link rel="apple-touch-icon">` added to `index.html`
