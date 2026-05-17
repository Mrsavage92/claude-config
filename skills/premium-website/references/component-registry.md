# 21st.dev Component Registry

**Every section on a landing page must be sourced from 21st.dev — never invented from scratch.**

Component choices are made ONCE during `/web-design-research` and locked in DESIGN-BRIEF.md as a Component Lock table. Build skills read that table — they do NOT re-run MCP queries. The registry below is used by `/web-design-research` to understand defaults and selection criteria. It is a research reference, not a build-time instruction.

---

## Component Selection Criteria

Before calling MCP, classify the product:

| Product type | Characteristics | Component style to select |
|---|---|---|
| **Enterprise B2B SaaS** | Compliance, finance, HR, legal, operations | Clean grid layouts, minimal animation, structured typography, no gradients in features. Prefer: Features 4, simple FAQ, Footer 2 standard. |
| **Developer / technical tool** | APIs, DevOps, data infrastructure, code tools | Dark-first, mono-spaced accents, code snippets in features, grid lines. Prefer: BentoGrid with code preview, minimal testimonials, technical FAQ. |
| **Consumer / growth SaaS** | SMB tools, productivity, scheduling, marketing | Warmer palette, testimonials prominent, animated stats, friendly copy. Prefer: BentoGrid or Features 4, TestimonialSlider prominent, WaitlistHero if pre-launch. |
| **AI product** | AI writing, automation, agents, chatbots | Split-pane mockup, typewriter animation in hero, stats on tokens/speed/accuracy. Prefer: CaseStudies stats with AI numbers, BentoGrid showing AI output. |
| **Marketplace / platform** | Two-sided networks, directories, aggregators | Social proof heavy, logo cloud prominent, testimonials from both sides. Prefer: TestimonialSlider + CaseStudies combo. |

When MCP returns multiple options: pick the one whose visual weight and animation level matches the product type above. Heavy animations suit consumer/AI products. Clean/static layouts suit enterprise. Never pick based on personal preference — pick based on the product type criteria.

Then call `mcp__magic__21st_magic_component_builder` to generate it, then adapt tokens.

---

## Component Registry Table

| Section | searchQuery | Default | Notes |
|---|---|---|---|
| Announcement banner | `announcement banner bar` | `Banner 1` | Mounts above navbar. Use for launches, feature flags, promotions. Optional — include when there's a real announcement. |
| Animated background | `animated background gradient` | `BackgroundGradientAnimation` | Interactive WebGL blobs. Opacity 0.15-0.2, z-index -1. Wrap in `useReducedMotion` check. |
| Navigation | `navigation header navbar` | `HeroSection 2` (extract its `HeroHeader`) | Scroll-aware blur header. `useScroll` from motion/react. |
| Hero section | `hero section landing page` | `HeroSection 2` | `AnimatedGroup` spring blur entrance built-in. Adapt stagger order to Technique 3. |
| Logo cloud | `logo cloud marquee` | `Logo Cloud 3` or `Logo Cloud 4` | `InfiniteSlider` + mask fade edges. Use `Logo Cloud 4` when ProgressiveBlur suits the style. |
| Stats / metrics | `stats metrics counter` | `CaseStudies` (CountUp layout) | `react-countup` with `enableScrollSpy`. Sits between Logo Cloud and Features. Minimum 3 numbers. |
| Features | `features grid section` | `Features 4` | Border-grid layout with icon + title + 2-sentence body. `whileInView` stagger. Use `BentoGrid` as alternative when a hero feature needs colSpan emphasis. |
| Testimonials | `testimonials social proof` | `TestimonialSlider` | Framer Motion `AnimatePresence` with photo, star rating, dot indicators. |
| Pricing | `pricing cards section` | `PricingCard` component | Glass-effect cards with `backdrop-blur`. Center card gets `border-primary/50`. |
| FAQ | `FAQ accordion` | `Faqs 1` or `RuixenAccordian02` | `Faqs 1` for single-column rounded-card style. `RuixenAccordian02` for two-column General/Billing/Technical layout. Mandatory before Final CTA. |
| CTA section | `call to action section` | `Cta 4` | Muted bg container, checklist on right, arrow button CTA. |
| Waitlist CTA | `waitlist email capture` | `WaitlistHero` or `WaitlistForm` | Use as primary CTA for pre-launch products. `WaitlistHero` = full-screen rotating rings + confetti. `WaitlistForm` = AnimatePresence input + confetti on submit. Replaces pricing section on waitlist builds. |
| Footer | `footer website` | `Footer 2` | Multi-column: logo+tagline left, 4 link columns, legal row at bottom. |

---

## Adapt Rules After Every 21st.dev Component

1. Replace hardcoded hex/rgb with `hsl(var(--token))`
2. Replace raw Tailwind color classes (`text-gray-500`) with semantic tokens (`text-muted-foreground`)
3. Apply the project font via `font-sans`
4. Match `rounded-lg` to `--radius`
5. Verify dark mode works via CSS variables
