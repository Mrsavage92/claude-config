# /web-page

Build a complete, production-quality page by composing sections and components with enterprise-level design.

## When to Use
- Adding a new page to an existing project
- Building: landing page, pricing page, dashboard, auth (sign in/up), settings, about, blog, docs

## Process

### Step 1 — Read Design DNA + Project Context
Read `~/.claude/web-system-prompt.md`. Then read:
- `src/styles/index.css` (color tokens, fonts)
- `tailwind.config.ts` (type scale, custom values)
- `src/components/` directory listing (what already exists — reuse before rebuilding)

### Step 2 — Page Type Playbook

**Landing Page**
Structure: Hero > Social Proof (logos) > Features (3-col grid) > How It Works > Testimonials > Pricing > CTA > Footer
Inspiration study: stripe.com, framer.com, linear.app/landing
Key elements: gradient mesh hero, animated headline, screenshot/product visual, logo bar, feature cards with icons, pricing table

**Dashboard / App**
Structure: Sidebar nav + Header + Main content area + Stats row + Data tables/charts
Inspiration study: linear.app, vercel.com/dashboard, planetscale.com
Key elements: sidebar with icon+label nav, header with search+user menu, stat cards with trend indicators, data tables with sorting

**Auth (Sign In / Sign Up)**
Structure: Split layout (brand left, form right) OR centered card
Inspiration study: clerk.com, linear.app/login, vercel.com/login
Key elements: full-height layout, brand gradient left panel, clean form right, social auth buttons, trust signals

**Pricing Page**
Structure: Header > Toggle (monthly/annual) > Pricing cards > Feature comparison table > FAQ > CTA
Key elements: highlighted recommended plan, annual discount badge, feature tick list, comparison table with shadcn Table

**Settings Page**
Structure: Sidebar nav + Content area with sections
Key elements: settings groups with dividers, form inputs using shadcn Form, save states with toast feedback

**About / Team**
Structure: Hero > Mission statement > Team grid > Values > CTA
Key elements: team member cards with hover effects, editorial typography, timeline component

### Step 3 — Section-by-Section Build

For each section:
1. Check if a matching component exists in `src/components/sections/` — reuse before rebuilding
2. If not, generate it inline using these rules:
   - **Standard interactive element** (button, input, badge, card, table): use shadcn/ui — `npx shadcn@latest add [component]`, never rebuild from scratch
   - **Complex visual section** (testimonials, pricing, feature grid, stat counter): run `mcp__magic__21st_magic_component_inspiration` first, then `mcp__magic__21st_magic_component_builder`, then adapt to project CSS tokens
   - **Layout section** (hero, navbar, footer): build with Tailwind + Framer Motion, apply a Visual Signature Element from `~/.claude/web-system-prompt.md`
   - All components: TypeScript interface with `className?: string`, named export only, `cn()` from `@/lib/utils`, all colors via CSS variables (`hsl(var(--token))`), max 150 lines
3. Apply scroll-triggered animations to every section (Framer Motion `whileInView` + `fadeUp` pattern):
   ```tsx
   const fadeUp = {
     hidden: { opacity: 0, y: 24 },
     visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
   }
   // Parent with stagger for grids/lists:
   const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
   ```
4. Mobile-first responsive: base styles for 375px, then `sm:`, `md:`, `lg:`

### Step 4 — Page Composition Rules

```tsx
// Every page follows this structure
export function [PageName]Page() {
  return (
    <main>
      {/* Sections stacked vertically */}
      {/* Each section: full-width, owns its own padding */}
      {/* Alternating background: background > muted > background */}
    </main>
  )
}
```

- Alternating section backgrounds create visual rhythm without effort
- Every section gets `py-16 md:py-24 lg:py-32` vertical padding
- Max content width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Add `id` anchors to sections for scroll navigation

### Step 5 — Performance
- Use `React.lazy` + `Suspense` for below-fold sections
- Images: `loading="lazy"`, explicit `width` + `height`
- Add route to `src/App.tsx` router

### Step 6 — SEO Meta
Add to the page component:
```tsx
// Update document title and meta description
useEffect(() => {
  document.title = `${pageTitle} | ${siteName}`
}, [])
```

Or if using react-helmet:
```tsx
<Helmet>
  <title>{pageTitle} | {siteName}</title>
  <meta name="description" content={description} />
</Helmet>
```

### Step 7 — Output
- Write all new section components to `src/components/sections/`
- Write the page to `src/pages/[PageName].tsx`
- Add route to App.tsx
- List every new file created

## Page Quality Checklist
- [ ] Hero has a strong visual statement (gradient/texture/animation)
- [ ] Every section has scroll-triggered entrance animation
- [ ] Alternating section backgrounds for rhythm
- [ ] Mobile layout tested at 375px mentally
- [ ] CTA appears at least twice (hero + bottom)
- [ ] Loading/error states on any async data
- [ ] SEO meta tags set
