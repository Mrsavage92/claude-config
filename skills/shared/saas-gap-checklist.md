# SaaS Completeness Checklist

Used by `/saas-build` Phase 8 and `/saas-improve` to identify what a production SaaS is missing.
Run this checklist against the built product. Every NO is an improvement task to execute.

---

## 1. Foundation & Infrastructure

| # | Check | How to verify |
|---|---|---|
| 1.1 | `npm run build` passes with zero TypeScript errors | Run build, check output |
| 1.2 | All routes lazy-loaded with React.lazy + Suspense | Check App.tsx |
| 1.3 | ErrorBoundary wraps every lazy route | Check App.tsx |
| 1.4 | NotFoundPage exists at path="*" | Check App.tsx |
| 1.5 | vercel.json has SPA rewrites | Check project root |
| 1.6 | Bundle: no chunk exceeds 250KB gzipped | Check build output |
| 1.7 | Sentry initialised in main.tsx | Check main.tsx |
| 1.8 | VITE_SENTRY_DSN in .env.example | Check .env.example |
| 1.9 | No `console.log` in any src/ file | Grep src/ |
| 1.10 | No TypeScript `any` type | Grep src/ |

## 2. Design & Visual Quality

| # | Check | How to verify |
|---|---|---|
| 2.1 | Landing page animated background present | Check HeroSection |
| 2.2 | Product mockup is max-w-4xl minimum — never max-w-2xl | Check ProductMockup className |
| 2.3 | Mockup shows product DOING something: typewriter, animated counters, or sparklines | Check ProductMockup |
| 2.4 | AI products: split-pane mockup (inbox left, AI typewriter output right) — Technique 5 | Check ProductMockup layout |
| 2.5 | Hero headline minimum text-5xl sm:text-6xl lg:text-7xl with letterSpacing -0.03em | Check HeroSection headline |
| 2.6 | Hero entrance uses Technique 3 STAGGER (pill > headline > sub > CTAs > stats > mockup last) | Check HeroSection variants |
| 2.7 | Floating AI toast/badge slides in after mockup renders | Check HeroSection or ProductMockup |
| 2.8 | Features section has whileInView stagger animation | Check FeaturesSection |
| 2.9 | Color budget: no more than 3 primary uses per page (>3 is CRITICAL in /web-review) | Grep pages/ for text-primary bg-primary |
| 2.10 | Zero hardcoded hsl()/hex/rgb color values in components - CSS variables only | Grep src/ for hsl([0-9] and #[0-9a-f] |
| 2.11 | Zero raw Tailwind color classes (text-blue-500, bg-gray-900 etc.) | Grep src/ for text-[a-z]+-[0-9] |
| 2.12 | All fonts loaded from Google Fonts with font-display: swap | Check index.css |
| 2.13 | Typography has 2+ weight/size levels on each page | Visual audit |
| 2.14 | Spacing is generous - no cramped sections | Visual audit |
| 2.15 | Landing page has Stats/CountUp section with react-countup enableScrollSpy | Check LandingPage for stats section |

## 3. Authentication & User Flow

| # | Check | How to verify |
|---|---|---|
| 3.1 | /auth page exists | Check App.tsx routes |
| 3.2 | Auth form has labels on all inputs | Check AuthPage |
| 3.3 | Auth form has error states | Check AuthPage |
| 3.4 | Redirect-after-login works | Check AuthPage |
| 3.5 | ProtectedRoute wraps all app routes | Check App.tsx |
| 3.6 | ProtectedRoute shows skeleton while session loads | Check ProtectedRoute |
| 3.7 | /setup or /onboarding wizard exists | Check App.tsx routes |
| 3.8 | ProtectedRoute checks onboarding_complete, redirects to /setup if false | Check ProtectedRoute |
| 3.9 | AuthRoute (session check only) wraps /setup | Check App.tsx |
| 3.10 | Password reset flow exists (/reset-password) | Check App.tsx routes |

## 4. Onboarding

| # | Check | How to verify |
|---|---|---|
| 4.1 | Onboarding wizard max 4 steps | Check OnboardingPage |
| 4.2 | Progress bar visible during onboarding | Check OnboardingPage |
| 4.3 | Each step writes to Supabase immediately (not batched) | Check OnboardingPage |
| 4.4 | Final step activates trial: sets onboarding_complete, trial_ends_at, subscription_status = 'trial' | Check OnboardingPage |
| 4.5 | AnimatePresence slide transition between steps | Check OnboardingPage |
| 4.6 | New user with zero data sees correct empty states (not broken UI) | Check all app pages |

## 5. Trial & Billing

| # | Check | How to verify |
|---|---|---|
| 5.1 | AppLayout trial banner present when subscription_status = 'trial' | Check AppLayout |
| 5.2 | Trial banner shows days remaining + Upgrade button | Check AppLayout |
| 5.3 | Trial banner hidden when subscription_status = 'active' | Check AppLayout |
| 5.4 | Stripe checkout session endpoint exists (FastAPI or edge function) | Check services/api or supabase functions |
| 5.5 | Webhook handler covers: checkout.session.completed, subscription.updated, subscription.deleted | Check webhook handler |
| 5.6 | UpgradeButton component wires to checkout session | Check UpgradeButton |
| 5.7 | PricingCards component shows correct plans | Check PricingCards or landing page |
| 5.8 | Settings Billing tab redirects to Stripe Customer Portal (not custom UI) | Check SettingsPage |
| 5.9 | VITE_STRIPE_PUBLISHABLE_KEY + VITE_STRIPE_PRO_PRICE_ID in .env.example | Check .env.example |

## 6. App Pages — Quality

| # | Check | How to verify |
|---|---|---|
| 6.1 | Every page calls useSeo (title + description) | Grep pages/ for useSeo |
| 6.2 | Auth/settings/onboarding pages use noIndex: true | Check those pages |
| 6.3 | Every empty state has a CTA button | Check all pages |
| 6.4 | Every data fetch has a loading skeleton (not blank or spinner) | Check all data pages |
| 6.5 | Every data fetch has an error state + retry | Check all data pages |
| 6.6 | No page is broken/empty for a brand-new user | Check all pages |
| 6.7 | User knows what to do next on every page | UX review |
| 6.8 | Dashboard pages use KpiCard + Sparkline (not ad-hoc stat boxes) | Check dashboard pages |
| 6.9 | List pages use TanStack Table with skeleton rows | Check list pages |
| 6.10 | List pages have FilterBar + Export CSV in header | Check list pages |

## 7. Settings Page

| # | Check | How to verify |
|---|---|---|
| 7.1 | /settings page exists | Check App.tsx |
| 7.2 | Profile tab: full_name, company_name editable (email read-only) | Check SettingsPage |
| 7.3 | Password change works | Check SettingsPage |
| 7.4 | Billing tab redirects to Stripe Portal | Check SettingsPage |
| 7.5 | Team tab: member list, invite by email + role, remove member | Check SettingsPage |
| 7.6 | Danger Zone: account deletion with typed confirmation | Check SettingsPage |

## 8. Email Flows

| # | Check | How to verify |
|---|---|---|
| 8.1 | Welcome email sent on signup | Check email templates |
| 8.2 | Trial-ending email: 7-day, 3-day, 1-day reminders | Check trial_reminders.py or edge function |
| 8.3 | Team invite email template exists | Check email templates |
| 8.4 | Password reset email works | Check auth flow |
| 8.5 | Invoice/receipt email on subscription upgrade | Check Stripe webhook handler |

## 9. Accessibility

| # | Check | How to verify |
|---|---|---|
| 9.1 | All interactive elements keyboard navigable | Tab through UI |
| 9.2 | All interactive elements have focus-visible:ring-2 | Grep src/ for focus-visible |
| 9.3 | All icon-only buttons have aria-label | Grep src/ for icon buttons |
| 9.4 | All decorative icons have aria-hidden="true" | Grep src/ |
| 9.5 | All form inputs have associated <label> | Check all forms |
| 9.6 | All animations wrapped in prefers-reduced-motion | Grep src/ for motion |
| 9.7 | Skip-nav link as first element in AppLayout AND LandingNav | Check AppLayout and LandingNav |
| 9.8 | Modal close buttons have aria-label="Close" | Check all modals |
| 9.9 | Modals close on Escape key | Check all modals |

## 10. Mobile & Responsive

| # | Check | How to verify |
|---|---|---|
| 10.1 | Landing page works at 375px | Resize browser |
| 10.2 | All app pages work at 375px | Resize browser |
| 10.3 | Sidebar collapses to Sheet drawer on mobile (<768px) | Check AppLayout |
| 10.4 | Data tables collapse to card stack on mobile | Check list pages |
| 10.5 | Touch targets minimum 44px | Check all buttons/links |
| 10.6 | Secondary columns hidden on mobile in tables | Check table columns |

## 11. SEO & Meta

| # | Check | How to verify |
|---|---|---|
| 11.1 | index.html has og:title, og:description, og:image, twitter:card | Check index.html |
| 11.2 | Landing page hero image has alt + explicit dimensions | Check HeroSection |
| 11.3 | All images have alt, loading="lazy", width, height | Grep src/ |
| 11.4 | Hero LCP image uses loading="eager" | Check HeroSection |
| 11.5 | Semantic HTML on landing page (header, main, footer, nav, section) | Check LandingPage |

## 12. Marketing Pages

| # | Check | How to verify |
|---|---|---|
| 12.1 | /privacy page exists with privacy policy | Check App.tsx routes |
| 12.2 | /terms page exists with terms of service | Check App.tsx routes |
| 12.3 | Footer links to /privacy and /terms | Check Footer |
| 12.4 | Footer has product name, tagline, nav links | Check Footer |
| 12.5 | Landing page has pricing section | Check LandingPage |
| 12.6 | Landing page has social proof (testimonials or stat numbers) | Check LandingPage |
| 12.7 | Landing page CTA is visible above the fold | Check HeroSection |
| 12.8 | /blog or /changelog exists (for SEO) | Check App.tsx routes |
| 12.9 | Landing page has comparison table vs top 3 competitors | Check LandingPage for ComparisonTable or FeaturesTable component |
| 12.10 | Landing page has FAQ accordion section | Check LandingPage for FAQ or Faqs component |

## 13. Backend & API Security (skip section if frontend-only SaaS with no FastAPI backend)

| # | Check | How to verify |
|---|---|---|
| 13.1 | CORS locked to production domain — never `*` | Check FastAPI CORS middleware |
| 13.2 | All API endpoints require authentication (no public data mutation routes) | Check route decorators for auth dependency |
| 13.3 | Input validation on all POST/PUT/PATCH endpoints (Pydantic models) | Check route handlers |
| 13.4 | SQL queries use parameterized inputs — no string concatenation | Check any raw SQL usage |
| 13.5 | Rate limiting on auth endpoints (login, signup, password reset) | Check for slowapi or similar |
| 13.6 | Stripe webhook signature verified before processing | Check webhook handler for `stripe.Webhook.construct_event` |
| 13.7 | Webhook handler is idempotent (re-processing same event is safe) | Check webhook handler for duplicate event handling |
| 13.8 | Auth tokens expire — no infinite-lived JWTs | Check JWT expiry configuration |
| 13.9 | Secrets loaded from environment variables — none hardcoded in source | Grep for hardcoded API keys |
| 13.10 | `.env` is in `.gitignore` | Check .gitignore |
| 13.11 | Health check endpoint exists at `/health` returning 200 | Check routes |
| 13.12 | Error responses don't expose stack traces in production | Check error handler |

## 14. Supabase RLS (skip if no Supabase)

| # | Check | How to verify |
|---|---|---|
| 14.1 | RLS enabled on every table | Check Supabase dashboard or migration |
| 14.2 | Users can only read their own org's data | Check SELECT policies |
| 14.3 | Users can only write to their own org's data | Check INSERT/UPDATE/DELETE policies |
| 14.4 | service_role key is never exposed to frontend | Grep src/ for service_role |
| 14.5 | anon key only used for auth — not direct data access from client | Check supabase.ts client setup |

## 15. Testing

| # | Check | How to verify |
|---|---|---|
| 15.1 | Auth flow tests exist (sign up, sign in, protected route redirect) | Check src/tests/ |
| 15.2 | Onboarding flow tests exist (steps complete, trial activates) | Check src/tests/ |
| 15.3 | Empty state tests exist (data query returns empty, CTA renders) | Check src/tests/ |
| 15.4 | Error state tests exist (data query errors, error component renders) | Check src/tests/ |
| 15.5 | All tests pass: `npx vitest run` exits 0 | Run tests |

---

## Scoring

Count YES answers. Total items: 123.

| Score | Status |
|---|---|
| 113-123 | Ship-ready |
| 96-112 | Minor gaps - fix before launch |
| 81-95 | Significant gaps - improvement loop needed |
| < 81 | Foundational issues - fix critical path first |

When used by saas-build or saas-improve: every NO becomes an improvement task.
Priority order: 1 (Foundation) > 13 (Backend security) > 14 (RLS) > 3 (Auth) > 4 (Onboarding) > 15 (Tests) > 6 (App quality) > 9 (a11y) > rest.
