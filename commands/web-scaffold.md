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

#### `src/components/layout/AppLayout.tsx`
MUST include skip-nav as first element:
```tsx
<>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground"
  >
    Skip to content
  </a>
  <div className="flex h-screen">
    <Sidebar />
    <main id="main-content" className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
</>
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

**Build sequence for landing page:**

1. **Animated background** — run `mcp__magic__21st_magic_component_inspiration` searching for "animated background hero [enterprise/dark/grid]". Then `mcp__magic__21st_magic_component_builder` to generate. Adapt colors to `hsl(var(--brand))`. Apply `z-index: -1`, `opacity: 0.2-0.3` (subtle — background, not foreground). Wrap in `prefers-reduced-motion` check from `web-animations` skill.

2. **Hero section** — structure: Nav → background → headline → subheadline → CTAs → trust stats → product visual. Apply Framer Motion staggered entrance from `web-animations` skill Technique 3 (FADE_UP + STAGGER on children).

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

4. **Features section** — run `mcp__magic__21st_magic_component_inspiration` for "feature grid cards [dark/enterprise]". Use `mcp__magic__21st_magic_component_builder`. Apply `whileInView` stagger from `web-animations` Technique 3.

5. **Pricing section** — 3 tiers. Center tier: `border-primary/50 bg-primary/5 shadow-lg`. Each: name, price, description, feature list with Check icons, CTA. Use `mcp__magic__21st_magic_component_inspiration` for "pricing table SaaS" if a better layout exists.

6. **Other sections** — How It Works (3 numbered steps with connector), Footer (logo+tagline left, links center, legal right).

**Rules:**
- `mcp__magic__21st_magic_component_inspiration` is called BEFORE writing any complex section — not after
- Animated background is mandatory — CSS grid pattern minimum, 21st.dev animated canvas preferred
- Product visual mockup is mandatory — shadcn components shaped like the real app, never a blob
- All sections use `whileInView` + `viewport={{ once: true }}` — see `web-animations` skill Technique 3

#### `src/App.tsx`
BrowserRouter with route for `/` (Landing), `/signin` (Auth), and protected app routes. All app routes lazy-loaded.

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
List all VITE_* env vars the project needs.

### Step 5 — Install + shadcn Init
```bash
npm install && npx shadcn@latest init && npx shadcn@latest add button input label card dialog dropdown-menu sheet toast sonner separator badge skeleton avatar tabs table select textarea
```

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

## Rules
- vite.config.ts MUST always include manualChunks — no exceptions
- tsconfig.json MUST always include "types": ["vite/client"]
- vercel.json MUST be generated at project root — every React Router SPA needs it from day one
- EmptyState component MUST be generated in every scaffold
- AppLayout MUST include skip-nav
- CLAUDE.md MUST include the color job sentence
- Landing page route MUST exist in App.tsx from day one (even if page not built yet)
