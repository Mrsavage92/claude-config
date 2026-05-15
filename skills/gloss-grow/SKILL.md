---
name: gloss-grow
description: Growth playbook for Gloss Beauty by Louise (Sunshine Coast bridal/event makeup, glossbeauty.com.au). Use when planning marketing, requesting reviews, drafting social content, planning photography shoots, picking directories, pricing changes, lead capture, or any task that aims to lift bookings or revenue for this specific business. Triggers: "grow gloss", "gloss growth", "Louise marketing", "Gloss Beauty next move", "gloss social plan", "/gloss-grow".
---

# /gloss-grow — Gloss Beauty Growth Playbook

This skill is the operational brain for growing Gloss Beauty by Louise. It exists because the business has a clear, well-bounded problem (mobile bridal/event MUA, Sunshine Coast, solo operator, ~$25–30k/yr ceiling at current state) and a load-bearing context that should drive every recommendation.

**ALWAYS read first:**
1. `C:/Users/Adam/Documents/Claude/glossbeauty.com.au/BUSINESS-PROFILE.md` — current snapshot (pricing, gaps, socials, blog, competitors).
2. `C:/Users/Adam/Documents/Claude/glossbeauty.com.au/repo/CLAUDE.md` — non-negotiable decisions (Lovable hosting, no hair, transparent pricing, no rebuild).

If either file is stale (>90 days) or contradicts an explicit user fact, **flag it** before proceeding.

---

## 0 · Non-negotiable rules (do NOT re-litigate)

| Rule | Why |
|---|---|
| **Hosting stays on Lovable.** Don't pitch Vercel/Netlify/migration. | Louise's workflow depends on Lovable's Publish button. |
| **No hair services.** | Brand stays focused. Refer hair, don't add it. |
| **Transparent pricing stays.** Don't move to "enquire for pricing". | Stated differentiator. Defensible. |
| **No rebuild pitch.** Money goes to photography first. | $5–10k rebuild is not ROI-positive at this stage. |
| **Edit `public/_headers`, not `vercel.json`.** | `vercel.json` is inert. Lovable parses Netlify-format `_headers`. |
| **Don't suggest adding hair, day rates, or studio location.** | All conflict with current positioning. |
| **Never claim deploy success without verifying `glossbeauty.com.au` returns the new content.** | Lovable requires Louise's manual Publish click. |

---

## 1 · The growth model (priorities locked in order)

Work top-down. Don't suggest a P2 lever while a P0 is unresolved.

### P0 — Credibility & conversion (do these first, in this order)

1. **Verify the contact form actually delivers.** Open `src/components/Contact*` or wherever Formspree is wired. If endpoint contains `REPLACE_WITH_YOUR_FORM_ID`, replace with live ID and send a test submission. Every day this stays broken = silent enquiry loss.
2. **Replace placeholder testimonials with real reviews.** `src/data/testimonials.ts` — 2 of 3 entries have `isPlaceholder: true`. Either pull real Google reviews (with permission) or remove placeholders entirely. Misrepresenting testimonials is brand-damaging.
3. **Professional portfolio shoot.** 8–10 hero shots: bride solo, bride + party, close-up makeup detail, candid getting-ready, hinterland/beach venue context. Budget $2–3k. Briefs go to Louise; Adam doesn't pick the photographer.

### P1 — Local discovery (each one compounds)

1. **Google Business Profile push.** Every booked client gets the review link (`g.page/r/Ccw-UJwq_aMBEBM/review`) in a same-day thank-you message. Target: 25 reviews in 90 days.
2. **Easy Weddings premium listing.** Dominant AU bridal directory. Listing + a few reviews flowing in = top-of-funnel that converts.
3. **ABIA registration + voting drive.** ABIA "Voted by Brides" badge is recognisable trust in AU bridal.
4. **WedShed / Hello May editorial submissions.** Aesthetic fit for soft-glam; even one feature pays back for years.

### P2 — Owned content & social

1. **Instagram cadence:** 3 posts/wk = 1 bride feature, 1 educational reel, 1 BTS/story-on-grid. Use the existing 12 blog posts as topical anchors — repurpose each post into 2–3 reels.
2. **Pinterest setup.** Brides actively *search* Pinterest. Set up business account, pin every blog post + portfolio shot with keyword-rich descriptions targeting "Sunshine Coast bride", "soft glam wedding makeup", "Maleny wedding", etc.
3. **TikTok lightweight test.** 1 reel/wk repurposed from IG, hashtags `#sunshinecoastbride #qldbride #softglam #bridalmakeup`. Local bridal TikTok is under-served — low cost to test.
4. **Email list.** Add a one-field email capture to the site footer ("Bridal beauty tips + first dibs on 2027 dates"). Use Resend or ConvertKit free tier. Send 1 email/month: blog roundup + 1 bride feature.

### P3 — Funnel mechanics & paid

1. **Embed Instagram feed** on homepage just above the testimonials block. Live social proof + reduces bounce.
2. **Meta pixel + Google tag** for retargeting. Set up audiences before running any ads.
3. **Geo-targeted Meta ads** ($300–500/month) — soft-glam reel creatives → contact page. Only after P0 + P1 are done; otherwise paying to send traffic into a leaky funnel.
4. **Defensible price increase.** Once 8+ real portfolio photos + 10+ Google reviews are live, raise bridal base to $280–295. Communicate as inclusion uplift, not just a price hike.

---

## 2 · Standard response templates

When the user asks one of these recurring questions, use these templates as the starting answer (then tailor).

### 2.1 "What should I post on Instagram this week?"
- Lead post: a recent real bride (if photography permits) with a 2-line caption that names the venue and one specific detail of the look.
- Mid-week reel: pick one blog post → distill to 3 tips on camera (or text overlay) → 30s vertical.
- Story: BTS of preview kit, calendar peek showing "booked Saturdays" (scarcity signal).

### 2.2 "Draft a post-wedding thank-you that asks for a review"
> Hi [Bride name] — it was such a joy being part of your morning at [venue]. Wishing you both the most incredible start.
> When you have a quiet 2 minutes, I'd love it if you could share a few words about your experience here: [Google review link]
> It genuinely helps other brides find me. Lots of love, Lou x

### 2.3 "We need a blog post about X"
- Confirm Sunshine Coast / QLD angle (climate, venue, light, season) — local SEO is the moat.
- Length: 1,000–1,800 words.
- Pillar tags: BRIDAL / SKINCARE / TIPS / WEDDINGS.
- Always include FAQ-style H3s for AI Overview citability.
- Schema is already wired site-wide — no manual JSON-LD needed per post.

### 2.4 "Should we add hair?"
**No.** Refer out. (See rule 0.)

### 2.5 "Should we move off Lovable?"
**No.** (See rule 0.)

### 2.6 "Photographer brief"
- Shotlist: bride at vanity (close + wide), makeup application BTS, bridal party getting-ready, hero portrait golden hour, kit flatlay (premium product brand cameos OK), Louise in frame (1–2 shots), candid laughter.
- Wardrobe: white/cream bride; bridesmaids in muted earth tones; avoid logo-heavy clothing.
- Location: Hinterland venue (Maleny/Montville) OR beach (Mooloolaba/Noosa) — pick one, save the other for shoot #2.
- Deliverables: 30+ edited high-res + 15+ web-optimised under 250kb each + 10 vertical crops for IG/TikTok.

### 2.7 "Price increase?"
Hold until 10+ Google reviews and 8+ portfolio shots are live. Then $280–295 base, framed as "now includes [specific add]" — never bare hike.

---

## 3 · Sub-skill routing

| Task | Skill to invoke |
|---|---|
| Full site SEO audit / single blog post optimise | `/seo-strategy` |
| Visual / CRO audit of a single page | `/page-cro` |
| Compositional / brand-voice copy for ads, emails, IG | `/copywriting` |
| New blog post (1k–1.8k words, SC-localised) | `/copywriting` then `/seo-strategy optimize` |
| Full marketing audit (re-baseline) | `/market-audit` against `https://glossbeauty.com.au/` |
| Reputation status check | `/reputation-audit` |
| GEO/AI-search re-check | `/geo-audit` |

**Do not** invoke `/saas-build`, `/web-scaffold`, or any rebuild skill — see rule 0.

---

## 4 · Verification before reporting work complete

Match Adam's global rule: *verify outcome, not surface.*

- **Site change pushed?** Confirm: (a) commit on `main` of `Mrsavage92/glossbeautycomau`, (b) Lovable picked up the commit, (c) **Louise pressed Publish**, (d) `curl -sI https://glossbeauty.com.au` returns 200, (e) the changed string is in the live HTML.
- **AI crawler test:** `curl -A "GPTBot" -s https://glossbeauty.com.au | grep -i "BeautySalon"` returns non-empty (Cloudflare Worker still serving schema).
- **Form change?** Submit a real test enquiry and confirm receipt before declaring success.
- **Social campaign drafted?** State explicitly which platform Louise needs to post it on; do not claim it "shipped" until she confirms.

If verification isn't possible in the current environment, say so. Never imply success.

---

## 5 · Open questions to confirm with Louise (resolve over time)

These shape revenue math and prioritisation. Update `BUSINESS-PROFILE.md` Section 11 once answered.

- [ ] Real annual revenue and wedding count for 2025?
- [ ] Average bridal party size (drives true per-wedding revenue)?
- [ ] Current % of enquiries from each channel (Google / IG / FB / referral / directory)?
- [ ] Marketing spend in 2025 and willingness for 2026 (caps any paid plan)?
- [ ] Photography budget + timeline (P0 lever — needs a date)?
- [ ] Existing past-bride email list size (for review request campaign)?

---

## 6 · When this skill is *not* the right tool

- Code-only refactors of the React site with no growth tie-in → use general dev tools.
- Cross-project portfolio questions (AuditHQ, GrowLocal, BDR) → use respective project context. Gloss Beauty is client work and **does not block** Adam's portfolio gate.
- Brand-new product idea unrelated to Louise's makeup business → trigger `/product-validator`, not this.
