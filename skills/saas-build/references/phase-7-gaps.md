### Phase 7 — Gap Analysis Loop (post-build self-improvement)

**This phase runs after every deploy. It does not require human instruction to begin.**

If resuming: read GAP-REPORT.md. If it exists and shows 0 P1 and 0 P2 gaps, skip to Phase 8.

The purpose is to answer: "What does a production-ready SaaS have that we haven't built yet?"

**Loop:**
1. Read `~/.claude/skills/shared/saas-gap-checklist.md` in full. If the file does not exist: use the P1/P2/P3/P4 gap definitions in the "What counts as a gap" sections below as the checklist — do not skip this phase.
2. Audit the current codebase against every checklist item
3. Write `GAP-REPORT.md` to the project root with:
   - Every NO item (what's missing)
   - Priority bucket for each: P1 (Foundation/Auth/Security) | P2 (UX/Quality) | P3 (Marketing/SEO) | P4 (Nice-to-have)
   - Estimated fix complexity: Quick (< 30 min) | Medium (30-90 min) | Large (90+ min)
4. If no P1 or P2 gaps remain: exit loop and proceed to Phase 8
5. Execute ALL P1 gaps first (never skip a P1 gap)
6. Execute ALL P2 gaps
7. Execute P3 gaps that are quick or medium complexity
8. After each batch of fixes: commit, re-read checklist, update GAP-REPORT.md
9. Return to step 4

**What counts as a P1 gap:**
- Missing /privacy page
- Missing /terms page
- Missing password reset flow
- No onboarding wizard
- Trial banner missing
- ProtectedRoute not checking onboarding_complete
- Any broken mobile layout
- Any missing empty state CTA
- TypeScript errors in build
- console.log in src/

**What counts as a P2 gap (Design/Code quality — fix after P1):**
- Hardcoded hex colors (zero hardcoded hex/rgb in any component)

**What counts as a P2 gap:**
- Missing useSeo on any page
- Any loading state is a blank screen or spinner (not skeleton)
- Any error state is a white screen
- Settings page missing tabs
- Any icon-only button missing aria-label
- Social proof section missing from landing page
- Pricing section missing from landing page

**What counts as a P3 gap (Marketing/SEO):**
- robots.txt missing from /public
- sitemap.xml missing from /public (or not registered in robots.txt)
- og:image still using placeholder — re-run Phase 2 icon generation block to auto-generate og-image.jpg
- Landing page missing FAQ section (LLM citability — AIs cite pages with Q&A)
- Landing page missing comparison table vs competitors
- No analytics snippet (Google Analytics or PostHog) in index.html
- No structured data (JSON-LD schema) on landing page
- sitemap.xml domain is still placeholder — needs updating once domain is live

**What counts as a P4 gap (Nice-to-have):**
- Dark mode toggle not accessible in AppLayout header
- CMD+K palette not implemented (product has 8+ nav items)
- PWA icons (icon-192.png, icon-512.png) need replacing with brand-accurate version (auto-generated in Phase 2 but may need refinement)
- Error page links back to home AND to status page
- Empty states use illustrations rather than icon + text
- Toast notification on every destructive user action (delete, remove)
- Keyboard shortcut hints visible in UI (e.g. button tooltips showing Ctrl+S)

**Execution rules:**
- Do not ask whether to fix gaps — just fix them
- Do not batch changes — one gap = one commit
- If a gap requires credentials (email API key, etc): log NEEDS_HUMAN and skip, continue with others
- Never stop because there are many gaps — that is the point of this phase

**After gap fixes complete — run CRO analysis on landing page:**

Run `/page-cro` targeting the `/` route (landing page). This applies the 7-section CRO framework (hero, value prop, social proof, features, objection handling, CTA, footer) with conversion benchmarks and A/B test hypotheses. Add findings to GAP-REPORT.md as P2/P3 items. Fix any P2 findings before proceeding to Phase 8.

**Run `/impeccable extract` after all page fixes:**

Extract reusable components and design tokens from the built pages into the design system. This prevents patterns from being reinvented in future sessions and keeps the system consistent. Run: `/impeccable extract` — it reads all files in `src/components/` and `src/pages/` and outputs reusable primitives to `src/components/ui/` and updates token definitions in `src/styles/index.css`.

If `/impeccable` skill is unavailable: log NEEDS_HUMAN "Run /impeccable extract to consolidate design system after Phase 7" and proceed.

Log: "Phase 7 gap analysis — [N] gaps found, [N] fixed, [N] skipped (credentials needed), CRO analysis complete, design system extracted" to BUILD-LOG.md.

---
