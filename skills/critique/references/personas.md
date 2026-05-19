# Personas — critique skill required source

Every critique invocation must include at least one persona walkthrough with NAMED pain points. The persona is NOT a generic "user" — it is a specific person with constraints.

Pick from this set (or define a new one with the same shape if these don't fit the target audience). Each persona has: name, role, age band, context, top-3 pain points when encountering a generic interface, what would make them bounce in <10s, what they read first.

---

## 1. Sarah — SMB owner (Australia, trades)

- **Role:** Director, family electrical contracting business (4 vans, 9 staff)
- **Age:** 42
- **Context:** Reads at desk between site visits; uses laptop (Windows, Edge); checks phone during lunch
- **Top pain points:**
  1. Walls of text without scannable headings — closes tab
  2. Generic stock photos of "happy professionals" — flags as fake
  3. CTAs that ask her to "book a discovery call" before she knows the price
- **Bounces in <10s if:** hero is generic SaaS-blue + abstract pattern; no concrete proof of work for trades-adjacent businesses
- **Reads first:** the hero headline, then the first H2, then the pricing page if she's interested

## 2. James — Solo SaaS founder

- **Role:** Founder of a 1-person AI consulting + audit business
- **Age:** 31
- **Context:** Discovers products via LinkedIn / Twitter / HN; pays for tools that demonstrably remove a manual step
- **Top pain points:**
  1. "Enterprise" positioning when he's a one-person shop — feels excluded
  2. No live demo or interactive element — bounces to a competitor's
  3. Pricing pages that hide tiers behind "contact sales"
- **Bounces in <10s if:** there's a customer logo bar full of brands he doesn't recognise; no "free tier" or "$X/mo" within first scroll
- **Reads first:** headline, then jumps to pricing, then comes back for features

## 3. Priya — Procurement lead (mid-market B2B)

- **Role:** Procurement manager at a 600-person services firm
- **Age:** 38
- **Context:** Evaluating 3-5 vendors against a checklist; needs to write a recommendation memo
- **Top pain points:**
  1. No security/compliance page — DSGVO, SOC 2, ISO 27001 absent
  2. No published SLA or uptime number
  3. No contractual export — can the org get its data out?
- **Bounces in <10s if:** no /security or /trust page in the footer
- **Reads first:** footer (looking for legal / compliance / contact), then security page, then pricing

## 4. Tom — Engineering manager (mid-market SaaS)

- **Role:** EM, 8-engineer team, evaluating dev tools
- **Age:** 35
- **Context:** Will test the product hands-on for 30 min before recommending; cares about API quality and docs
- **Top pain points:**
  1. No API docs link in nav — assumes there's no API
  2. Marketing copy with "AI-powered" but no architecture diagram or technical post
  3. No GitHub presence — feels untested
- **Bounces in <10s if:** "Magic AI" or "Synergy" language in the hero; no /docs or /api in nav
- **Reads first:** /docs (if present), then GitHub, then back to landing

## 5. Aisha — Senior designer (creative agency)

- **Role:** Lead designer, 12-person agency
- **Age:** 34
- **Context:** Visual taste is calibrated; uses tools that look as well-crafted as the work she ships
- **Top pain points:**
  1. Default Tailwind/shadcn aesthetic — feels like a $0 template
  2. Mismatched type (Inter heading + Inter body, no contrast)
  3. Uniform spacing/radius/shadows across all components
- **Bounces in <10s if:** sees a centered hero + gradient blob + 3-column feature grid; or dark navy + gold
- **Reads first:** scrolls the landing top-to-bottom once at speed, judging by feel

## 6. Marcus — CFO (Series A SaaS, 30 staff)

- **Role:** CFO, 30-person SaaS
- **Age:** 45
- **Context:** Approves software spend over $5K/year; wants payback period
- **Top pain points:**
  1. ROI claims with no math shown (no "we save you 5 hours per week × $X/hr")
  2. No case study with a real company name + a real number
  3. "Schedule a demo" instead of a transparent price
- **Bounces in <10s if:** pricing page redirects to a contact form
- **Reads first:** pricing, then case studies, then back to hero

## 7. Lena — Solo consultant (productivity / OS)

- **Role:** Operations consultant, 1-person firm, 6 retained clients
- **Age:** 39
- **Context:** Trying to decide if a tool will save her enough time to be worth the monthly fee
- **Top pain points:**
  1. Demo videos longer than 90s — closes
  2. Onboarding requiring 5+ fields before showing any value
  3. Features that all look the same — can't tell what's actually different
- **Bounces in <10s if:** "Sign up for a 14-day free trial" is the only CTA; no try-without-account path
- **Reads first:** hero, then product screenshot/video, then pricing

## 8. David — Public-sector procurement (UK/AU local government)

- **Role:** ICT procurement officer, district council
- **Age:** 51
- **Context:** Statutory requirements: accessibility (WCAG 2.1 AA minimum), data residency, security questionnaire
- **Top pain points:**
  1. No accessibility statement
  2. No data-residency commitment (where does the data live?)
  3. Pricing in USD only — needs GBP or AUD
- **Bounces in <10s if:** site fails axe-core basic scan; no /accessibility-statement page
- **Reads first:** footer (legal/accessibility/compliance), then about page

---

## How to use in a critique

For every critique invocation:

1. **Pick the 1-2 personas most relevant to the target.** Don't run all 8 — pick the ICPs that match the product's claimed audience.
2. **Walk the persona through the site as briefed.** What does Sarah see in the first 5 seconds on the hero? Does she find what she's looking for? What makes her bounce?
3. **Cite the persona's actual pain points by line.** Not "users want clarity" — write "Sarah's pain #2 (generic stock photos of happy professionals — flags as fake) is hit at hero/secondary section: the photo is a stock shot of a smiling man in a polo shirt."
4. **The persona walkthrough is a section in the output** — it has a header, a flow description, and 2-3 concrete observations tied to the persona's pain points.
5. **If you cannot find a matching persona,** define a new one in this file with the same shape (name, role, age, context, 3 pain points, bounce trigger, reads-first). Do NOT use a generic "user" placeholder.
