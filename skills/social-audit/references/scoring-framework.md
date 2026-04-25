# Social Footprint Scoring Framework

Detailed scoring rubrics for the 8 categories that compose the Social Footprint Score.
Includes calibrated anchors from real brand data collected 2026-04-20.

---

## Composite Weighting

```
Social Footprint Score = (
    Presence_Breadth       * 0.15 +
    Profile_Quality        * 0.15 +
    Activity_Cadence       * 0.15 +
    Content_Quality        * 0.15 +
    Engagement_Depth       * 0.15 +
    Platform_Fit           * 0.10 +
    Competitive_Position   * 0.10 +
    Brand_Consistency      * 0.05
)
```

---

## Calibrated Scoring Anchors (Real Brand Data)

Use these as reference points when scoring. They are live-scrape validated.

| Brand | IG Followers | Posts/Year | FB Likes | TikTok | Pinterest | Composite Score | Grade |
|---|---|---|---|---|---|---|---|
| Evoque Makeup Artistry (@evoquemakeup) | 4,631 | ~21 | Active | None found | Unknown | ~52 | D |
| Sunshine Brides (@sunshinebrides) | 3,759 | ~83 | Active | None found | Unknown | ~60 | C |
| Tasleema Nigh (@tasleemanighmakeup) | 1,467 | ~98 | Active | None found | Unknown | ~55 | C |
| Gloss Beauty by Louise (@glossbeauty.bylouise) | 4,478 | ~20 | 36 likes (weak) | 16 followers (dormant) | Absent | 49 | D |

**Benchmarking notes:**
- Sunshine Coast bridal makeup: "solid C" = 1,500–4,000 IG followers + 60–100 posts/year + active FB + no TikTok
- "Strong B" for this segment would require: 5,000+ IG, 150+ posts/year, active TikTok (any presence), Pinterest boards
- "A" for this segment: 10,000+ IG, daily posting cadence, TikTok 1,000+ followers, Pinterest Rich Pins, press features

For sectors with higher social intensity (DTC fashion, SaaS, creator economy), multiply all benchmarks by 5–10x.

---

## Category 1: Presence Breadth (15%)

**What it measures:** Is the brand on the right platforms for their ICP and industry?

**Scoring anchors:**

| Score | Criteria | Real example |
|---|---|---|
| 90-100 | On all ★★★ platforms + most ★★, handles consistent, emerging claimed | Gymshark-tier |
| 75-89 | On all ★★★, most ★★, 1 gap max | Strong DTC brand |
| 60-74 | On most ★★★, missing 1 obvious ★★ | Evoque Makeup (~65) |
| 45-59 | On 3-4 platforms, missing 1 high-fit | Gloss Beauty by Louise (55 — IG+FB+TikTok claimed, missing Pinterest) |
| 30-44 | On 1-2 platforms only | Most solo local service businesses |
| 10-29 | 1 platform only or semi-present | Very early stage |
| 0-9 | No findable presence | Pre-launch |

---

## Category 2: Profile Quality (15%)

**Scoring method:** Score each active platform's profile out of 100, then average.

**Per-platform anchors (100 points each):**
- Bio complete + keyword-optimised + CTA: 25 pts
- Link strategy working: 15 pts
- Profile/banner imagery on-brand: 15 pts
- Verified status (where platform offers): 10 pts
- Pinned content strategic: 10 pts
- Platform-specific setup (Highlights/Featured/Playlists): 15 pts
- Correct account type (Business/Creator): 10 pts

| Score | Criteria |
|---|---|
| 80-100 | All profiles complete, on-brand, strategic pins, verified, link stack working |
| 60-79 | Most profiles solid, 1-2 platforms underinvested |
| 40-59 | Bios generic/missing, no pins, bare bio link | ← Gloss Beauty FB ~20 (36 likes, minimal setup) |
| 0-39 | Profiles empty or default |

---

## Category 3: Activity & Cadence (15%)

**Platform cadence benchmarks:**
| Platform | Minimum | Growth target |
|---|---|---|
| Instagram | 3/week | 5-7/week |
| TikTok | 5/week | 14/week |
| Facebook | 3/week | 5/week |
| Pinterest | 5/week | 15/week |
| LinkedIn | 3/week | 5/week |
| YouTube | 0.5/week | 1-2/week |

**Scoring anchors:**

| Score | Criteria | Real example |
|---|---|---|
| 80-100 | Meets growth cadence on all active platforms | Gymshark-tier |
| 60-79 | Meets minimum on most, growth on 2+ | Tasleema Nigh (~65 — 98 posts/yr ≈ 2/week IG) |
| 40-59 | Below minimum on 1+ platform, inconsistent | Sunshine Brides (~50 — 83 posts/yr) |
| 20-39 | Sporadic, 1+ platform dormant | Gloss Beauty by Louise (25 — 20 posts/yr IG, TikTok dormant, FB dead) |
| 0-19 | All platforms dormant | |

---

## Category 4: Content Quality (15%)

**Sub-factors (weighted):**
1. Format mix aligned to platform (25%) — Reels-first on IG, video on TikTok
2. Content pillars identifiable (20%)
3. Hook/opening strength (15%)
4. Caption quality + CTA (15%)
5. Hashtag strategy (10%)
6. Audio strategy — TikTok/Reels (10%)
7. No lazy cross-posting (5%)

**Scoring anchors:**

| Score | Criteria |
|---|---|
| 80-100 | Platform-native content, Reels-first on IG, trending audio on TikTok, clear pillars, adapted captions |
| 60-79 | Good on 1-2 platforms, pillars identifiable, some cross-posting OK |
| 40-59 | Generic cross-posted content, no pillars, static-heavy on IG | ← Estimated range for most Sunshine Coast MUAs |
| 0-39 | Low-effort posts, no pillars, dead-on-arrival content |

**Scope note:** Content Quality requires Puppeteer scraping of individual posts (captions, format icons, hashtags). If only OG-meta was available, mark as "estimated" and note in report scope banner. Range: assume 40-60 unless evidence is higher/lower.

---

## Category 5: Engagement Depth (15%)

**Engagement rate benchmarks (by platform):**
| Platform | Weak | Good | Strong |
|---|---|---|---|
| Instagram | <0.5% | 1-3% | >3% |
| TikTok | <2% | 5-9% | >9% |
| LinkedIn | <1% | 2-3% | >3% |
| Facebook | <0.3% | 0.5-2% | >2% |
| Pinterest | <1% save rate | 1-3% | >3% |
| YouTube | <2% | 4-5% | >5% |

**Scoring anchors:**

| Score | Criteria |
|---|---|
| 80-100 | Above-benchmark ER on most platforms, replies within 24hr, positive community, strong UGC |
| 60-79 | Benchmark ER, occasional replies, alive community |
| 40-59 | Below-benchmark ER, rare replies, sparse community | ← Typical SMB solo artist |
| 0-39 | Near-zero engagement, no replies |

**Scope note:** True ER requires post-level data (Puppeteer). OG-meta gives follower+post count only. If post-level data is unavailable, mark Engagement Depth as estimated; use follower-retention proxy (followers ÷ years active = retention signal).

---

## Category 6: Platform-Fit (10%)

See `platform-fit-matrix.md` for industry × platform logic.

| Score | Criteria |
|---|---|
| 80-100 | On all ★★★ platforms for ICP, absent from irrelevant ones |
| 60-79 | 1 obvious gap or 1 wasted effort |
| 40-59 | Missing Pinterest (for DTC beauty) OR on platforms ICP doesn't use | ← Gloss Beauty (55 — missing Pinterest) |
| 0-39 | Wrong platforms entirely |

---

## Category 7: Competitive Position (10%)

**Scoring anchors (Sunshine Coast bridal makeup segment — calibrated 2026-04-20):**

| Competitor | IG Followers | Rough score |
|---|---|---|
| Evoque Makeup | 4,631 | Mid-pack leader |
| Gloss Beauty by Louise | 4,478 | Mid-pack |
| Sunshine Brides | 3,759 | Mid-pack |
| Tasleema Nigh | 1,467 | Trailing |

| Score | Criteria |
|---|---|
| 80-100 | Leading competitor set on 3+ signals (followers, cadence, format innovation) |
| 60-79 | Top quartile of competitive set |
| 55-65 | Mid-pack — matching competitors on followers, behind on cadence | ← Gloss Beauty Louise vs competitors |
| 40-54 | Behind on 2+ signals |
| 0-39 | Clearly outclassed |

---

## Category 8: Brand Consistency (5%)

| Score | Criteria | Real example |
|---|---|---|
| 80-100 | Same handle, tight visual, consistent voice + CTA | |
| 60-79 | Minor inconsistencies, mostly aligned | |
| 40-59 | Handle suffix mismatch OR different voice on platforms | ← Gloss Beauty (45 — `bylouise` vs `bylouise1`) |
| 0-39 | Fragmented, different brand on each platform | |

---

## Grade Bands (Composite)

| Composite | Grade | Meaning | Real example |
|---|---|---|---|
| 85-100 | A | Sector-leading | Gymshark, Duolingo, Canva |
| 70-84 | B | Strong | Mid-size DTC with consistent cadence |
| 55-69 | C | Average | Sunshine Brides (~60), Tasleema Nigh (~55) |
| 40-54 | D | Below average | Gloss Beauty by Louise (49), Evoque Makeup (~52) |
| 0-39 | F | Critical | Pre-launch or fully dormant |

---

## Scoring Integrity Rules

1. **No score without evidence.** Every category score must have a quoted/scraped/Puppeteer-evidenced basis.
2. **Never inflate for effort.** Posting daily on TikTok = high cadence there; if wrong platform for ICP, Platform-Fit is still low.
3. **Scope tags mandatory.** Any score based on indirect inference (no Puppeteer, OG-meta only) must include `<!-- Estimated — OG-meta only -->` HTML comment. In the client report, add scope banner if 3+ categories are estimated.
4. **Competitor comparisons use the same method.** Don't compare Puppeteer-scraped brand data to OG-meta competitor data without noting the methodology difference.
5. **Re-run check before scoring.** Run Phase 3.5 sanity checks before committing any final score.
