# Landing Page Rules Reference

## Mandatory Landing Page Sections (all required, in this order)

[Banner] → Nav → Hero (with animated bg) → Logo Cloud → Stats → Features → Testimonials → Pricing → FAQ → Final CTA → Footer

Note: Banner is optional — include when there's a real announcement. All other sections are mandatory.

---

## Non-Negotiables (enforced on every build)

### 0. Announcement Banner (optional — include when there's a real announcement)
- Use `Banner 1` from 21st.dev (searchQuery: `announcement banner bar`) — mounts above the navbar
- Use for product launches, beta access, major feature drops, or promotions
- Style: muted bg, small pill label ("New" / "Beta" / "Now live"), one-line message, optional arrow link
- If no real announcement exists: omit this section entirely — never fake an announcement

### 1. Animated Background
- Use `BackgroundGradientAnimation` from 21st.dev (searchQuery: `animated background gradient`) — NOT a CSS grid fallback
- `opacity: 0.15-0.2`, `z-index: -1`, lazy-loaded (`React.lazy`), wrapped in `useReducedMotion` check
- This is the interactive WebGL blob animation — it is what separates the output from AI slop

### 2. Product Visual Mockup
- Built from shadcn primitives shaped like the real app — NEVER a gradient blob
- Browser chrome: 3 colored dots (`bg-destructive/50`, `bg-yellow-400/50`, `bg-green-500/50`) + URL bar showing `app.[product].com.au`
- Sidebar: column of muted icon-shaped divs, first one `bg-primary/80` (active state)
- Content: 3 stat cards + 3-4 data table rows with colored dot + muted line divs + status pill
- Glow wrapper: `absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand/15 to-transparent blur-2xl`
- This is NOT optional. Every hero must have this.

### 3. Hero Entrance Animation
Technique 3 STAGGER (Framer Motion) — entrance order is always:
Pill → headline → subheadline → CTAs → trust stats → product visual (0.6s delay — loads last for effect)

Implementation pattern:
```tsx
const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } } };
// Wrap section in <motion.div variants={container} initial="hidden" animate="show">
// Wrap each element in <motion.div variants={item}>
// Product visual gets delay={0.6} override
```
Full detail: `/web-animations` Technique 3.

### 4. Logo Cloud (mandatory between hero and features)
- Use `Logo Cloud 3` or `Logo Cloud 4` from 21st.dev (searchQuery: `logo cloud marquee`)
- `Logo Cloud 4` preferred — `InfiniteSlider` + `ProgressiveBlur` fade on both edges
- Source logo SVGs from `svgl.app` — search by tool/brand name
- Heading pattern: muted text "Trusted by teams at" above the marquee

### 4b. Stats / CountUp Section (mandatory between Logo Cloud and Features)
- Use `CaseStudies` component from 21st.dev (searchQuery: `stats metrics counter`)
- Install `react-countup` — use with `enableScrollSpy: true` so numbers animate when scrolled into view
- Minimum 3 stats pulled from real product value prop (e.g. "10,000+ businesses", "98% satisfaction", "2 min setup")
- Layout: large bold animated number + small muted label. Dark section bg to visually separate from logo cloud.
- This section is what builds trust before Features — do not skip it.

### 5. Features Section
- Use `Features 4` from 21st.dev (searchQuery: `features grid section`) — border-grid layout with icon + title + 2-sentence body
- 3-6 cards, `whileInView` stagger from web-animations Technique 3
- Alternative: use `BentoGrid` (searchQuery: `bento grid layout`) when one feature needs visual emphasis — hero feature spans 2 columns with screenshot/animation, supporting features fill the grid

### 5b. Testimonials (mandatory between features and pricing)
- Use `TestimonialSlider` from 21st.dev (searchQuery: `testimonials social proof`)
- Framer Motion `AnimatePresence` with photo, star rating, dot indicator navigation
- Minimum 3 testimonials with realistic names and roles

### 5c. Pricing
- Use `PricingCard` from 21st.dev (searchQuery: `pricing cards section`) — glass-effect cards with `backdrop-blur`
- 3 tiers. Center card: `border-primary/50 bg-primary/5 shadow-lg` + "Popular" badge. Each: name, price, description, feature list with `CheckCircle2`, CTA button.
- For pre-launch products: replace Pricing with Waitlist section (see 5f)

### 5d. FAQ Section (mandatory before Final CTA)
- Use `Faqs 1` from 21st.dev (searchQuery: `FAQ accordion`) — rounded card with shadcn Accordion component
- Alternative: `RuixenAccordian02` for two-column layout with General / Billing / Technical categories
- Minimum 5 questions. Write answers as real conversational copy — not corporate non-answers.
- Section heading: "Frequently asked questions" with short muted subheading

### 5e. Final CTA Section
- Use `Cta 4` from 21st.dev (searchQuery: `call to action section`) — muted bg container, checklist on right, arrow button

### 5f. Waitlist Form (replaces Pricing + Final CTA for pre-launch products)
- Use `WaitlistHero` from 21st.dev (searchQuery: `waitlist email capture`) for full-screen treatment
- Alternative: `WaitlistForm` — `AnimatePresence` input with confetti on submit
- Connect to Supabase `waitlist` table (email, created_at). Show position number after sign-up.
- This is the PRIMARY CTA for any product that doesn't have live pricing yet

### 5g. Footer
- Use `Footer 2` from 21st.dev (searchQuery: `footer website`) — multi-column: logo+tagline left, 4 link columns, legal bottom row
- No color in footer — pure `text-muted-foreground`. Include social icons.

### 6. Color Discipline
- **Landing page**: primary color used exactly twice — CTA button + feature icon backgrounds. Never more.
- **App/dashboard pages**: primary color allowed for active nav items, primary action buttons, and progress/score indicators only. Max 2 uses per page (same budget as landing page).
- **PRIMARY COLOR BUDGET rule**: count every `text-primary`, `bg-primary`, `border-primary`, `ring-primary` on the page. If the count exceeds 2: replace ambient/decorative uses with `text-muted-foreground`, `bg-muted`, or `text-brand`. Never use primary as a neutral fill.
- Enterprise design = restraint. If in doubt, use `text-muted-foreground` and `border-white/[0.07]`.

---

## Per-Page Quality Checklist (13 items)

Every page must pass before moving to the next:

```
[ ] Zero-data state: page makes sense with no data
[ ] Empty state: has CTA button (not just text)
[ ] Loading state: skeleton layout (not blank or spinner)
[ ] Error state: inline error + retry button
[ ] Color budget: count text-primary/bg-primary/border-primary/ring-primary — total <= 2. If > 2: replace with text-muted-foreground or bg-muted.
[ ] useSeo: called on this page — title + description set; noIndex: true on auth/settings/onboarding pages
[ ] document.title: never set at render scope — useSeo handles it via useEffect
[ ] User knows next action: clear without reading docs
[ ] Typography: at least 2 size/weight levels (not all text-sm)
[ ] Mobile: layout works at 375px
[ ] Focus rings: all interactive elements have focus-visible:ring-2
[ ] Aria labels: all icon-only buttons have aria-label
[ ] Modals (if any): close button aria-label="Close", Escape closes
```

Landing page additional checks:
```
[ ] BackgroundGradientAnimation present — not a CSS grid fallback
[ ] Logo Cloud present (InfiniteSlider + ProgressiveBlur)
[ ] Stats/CountUp section present with react-countup + enableScrollSpy
[ ] Features section uses Features 4 (border-grid) or BentoGrid
[ ] Testimonials section present (TestimonialSlider, min 3)
[ ] FAQ section present before Final CTA (min 5 questions)
[ ] Footer uses Footer 2 multi-column layout with social icons
[ ] Pre-launch products: Waitlist form present + connects to Supabase
```

"It renders" is not done. A page passes when a designer seeing it for the first time would not want to fix it.

---

## Two-Pass Self-Review (enforced per page in web-page)

Every page requires two passes before moving to the next:
- **Pass 1**: 13-item checklist (or 28-item dashboard checklist). Fix all failures.
- **Pass 2**: Fresh eyes — 5 questions: Would I know what to do? Does the empty state have a reason to act? Does loading feel intentional? Is the color doing one job? Would I be embarrassed to show this to a designer? Fix anything that fails.

Both passes are required. Pass 1 alone is not sufficient.

---

## Category-Specific Override Notes

### Onboarding & Trial Gate (SaaS products with auth — mandatory)
- Every SaaS product with auth MUST have a `/setup` or `/onboarding` wizard built as the 3rd page (after landing + auth)
- The wizard MUST collect product-specific business profile data before the user reaches the dashboard
- Final wizard step MUST activate the trial or present Stripe Checkout — never let users skip straight to dashboard
- `ProtectedRoute` MUST check `onboarding_complete` on the org record and redirect to `/setup` if false
- AppLayout MUST include a trial banner when trial is active: persistent top bar showing days remaining + "Upgrade now" button
- The trial banner is hidden only when the user is on an active paid plan

### Auth Pages
- Auth pages (login, signup, reset-password) are exempt from the product visual mockup rule
- Auth pages quality bar: form labels, error states, redirect-after-login, mobile layout at 375px

### Dashboard Pages
Read `/dashboard-design` skill before building any dashboard, analytics view, monitoring screen, or data management list. The skill's 28-item Pre-Ship Checklist replaces the standard 13-item per-page checklist.
