# Social Footprint Scoring Framework

Detailed scoring rubrics for the 8 categories that compose the Social Footprint Score.

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

Weights rationale:
- First 5 categories (15% each) are the hard data — what the brand IS doing on social
- Platform_Fit + Competitive_Position (10% each) are the strategic analytical layer
- Brand_Consistency (5%) is the tie-breaker / polish layer

---

## Category 1: Presence Breadth (15%)

**What it measures:** Is the brand on the right platforms for their ICP and industry?

**Inputs:**
- Count of platforms brand is active on (posting in last 30 days)
- Count of high-fit platforms per `platform-fit-matrix.md`
- Gap between the two
- Handle consistency across platforms
- Defensive handle claims on emerging platforms

**Scoring anchors:**

| Score | Criteria |
|---|---|
| 90-100 | Active on all ★★★ platforms + most ★★ platforms for industry. Handles consistent. Defensive claims on emerging platforms. |
| 75-89 | Active on all ★★★ platforms, most ★★. 1 gap max. |
| 60-74 | Active on most ★★★ platforms. Missing 1 obvious ★★. |
| 45-59 | On 2-3 platforms, missing 2+ high-fit. |
| 30-44 | On 1-2 platforms, inactive on most. |
| 10-29 | Minimal presence, 1 platform only. |
| 0-9 | No meaningful social presence. |

**Worked example:** A DTC beauty brand active on Instagram (★★★), TikTok (★★★), Pinterest (★★★), Facebook (★★) with consistent @brandname handle and defensive Threads claim = **85** (on all must-haves + most high-fit + defensive plays).

---

## Category 2: Profile Quality (15%)

**What it measures:** Are the profiles themselves optimised on each platform?

**Inputs:** Per-platform profile checks — bio, link, imagery, verified, pinned, platform-specific setup (Highlights, Featured, Playlists, Collections, Rich Pins).

**Scoring method:** Score each active platform's profile out of 100, then average.

**Per-platform anchors (100 points each):**

- Bio complete + keyword-optimised + CTA: 25
- Link strategy working (stack or single + valid): 15
- Profile/banner imagery on-brand: 15
- Verified status (where platform offers): 10
- Pinned content strategic: 10
- Platform-specific setup complete (Highlights/Featured/Playlists/etc): 15
- Business/Creator account type correct: 10

**Composite:** Average across active platforms.

**Worked example:** Brand active on IG (profile score 75), LinkedIn (90), TikTok (50), YouTube (not active) → composite = (75+90+50)/3 = **72**.

---

## Category 3: Activity & Cadence (15%)

**What it measures:** Is the brand posting consistently at platform-appropriate frequency?

**Inputs:** Posts/week per platform over 90 days, variance, days since last post, platform cadence benchmark.

**Per-platform benchmark recap:**
| Platform | Min weekly | Growth weekly |
|---|---|---|
| LinkedIn | 3 | 5 |
| Instagram | 4 | 7 |
| TikTok | 5 | 14-21 (1-3/day) |
| YouTube long-form | 0.5 | 1-2 |
| YouTube Shorts | 2 | 7 |
| Facebook | 3 | 5 |
| X / Twitter | 5 | 21+ (3/day) |
| Pinterest | 5 | 15 |
| Threads | 3 | 7 |

**Scoring anchors:**

| Score | Criteria |
|---|---|
| 90-100 | Meets growth cadence on all active platforms, consistent, zero dormant |
| 75-89 | Meets min cadence everywhere, meets growth on 2+ platforms |
| 60-74 | Meets min cadence on most, slight gaps |
| 45-59 | Below min on 1+ platform, 1 platform dormant (14+ days) |
| 30-44 | Below min on most, 2+ platforms dormant |
| 10-29 | Sporadic, most dormant |
| 0-9 | All platforms dormant or no posts last 90 days |

---

## Category 4: Content Quality (15%)

**What it measures:** Is the content platform-native, well-crafted, and strategically pillared?

**Sub-factors (each weighted):**
1. Format mix aligned to platform (25%)
2. Content pillars present + identifiable (20%)
3. Hook/opening strength in video content (15%)
4. Caption quality + CTA presence (15%)
5. Hashtag strategy targeted (10%)
6. Audio strategy (TikTok/Reels) (10%)
7. Cross-posting adaptation vs lazy copy-paste (5%)

**Scoring anchors:**

| Score | Criteria |
|---|---|
| 90-100 | Platform-native content throughout. Reels-first on IG, trending audio on TikTok, threads on LinkedIn, playlists on YT. Strong hooks. Clear 3-5 pillars. Platform-adapted captions. |
| 75-89 | Good content on 2-3 platforms, clear pillars, hooks decent. Cross-posting exists but with adaptation. |
| 60-74 | Mixed quality. Content pillars fuzzy. Hooks inconsistent. |
| 45-59 | Lazy cross-posting. Same caption everywhere. Spray-and-pray hashtags. |
| 30-44 | Low-effort content. Product shots only. No pillars. |
| 10-29 | Dead-on-arrival posts, auto-generated captions. |
| 0-9 | No meaningful content. |

---

## Category 5: Engagement Depth (15%)

**What it measures:** Does the brand have a living community or is it broadcasting into the void?

**Sub-factors:**
1. Engagement rate vs platform benchmark (30%)
2. Reply rate to comments (25%)
3. Community sentiment in comments (20%)
4. UGC volume (tagged posts + branded hashtag) (15%)
5. Conversation vs broadcast balance (10%)

**Engagement rate benchmarks:**
| Platform | Weak | Benchmark | Strong |
|---|---|---|---|
| Instagram | <0.5% | 1-3% | >3% |
| TikTok | <2% | 5-9% | >9% |
| LinkedIn | <1% | 2-3% | >3% |
| YouTube | <2% | 4-5% | >5% |
| Facebook | <0.3% | 0.5-2% | >2% |
| X / Twitter | <0.2% | 0.5-1% | >1% |
| Pinterest | save-based | >1% save rate | >3% save rate |

**Scoring anchors:**

| Score | Criteria |
|---|---|
| 90-100 | Above-benchmark ER on most platforms. Replies to most comments within 24h. Positive community in comments. Active UGC. |
| 75-89 | Benchmark ER. Responds sometimes. Community alive. |
| 60-74 | Below-benchmark ER on 1+ platform. Rare replies. Mixed community. |
| 45-59 | Weak ER. Ignores comments. Dead threads. |
| 30-44 | Very weak engagement. No replies. |
| 10-29 | Posts get 0-1 comments. Zero community. |
| 0-9 | No engagement, no community. |

---

## Category 6: Platform-Fit (10%)

**What it measures:** Strategic alignment between platforms used and ICP/industry.

See full logic in `platform-fit-matrix.md`.

**Scoring anchors:**

| Score | Criteria |
|---|---|
| 90-100 | Platform selection perfectly matches ICP + industry. No wasted effort on wrong-fit platforms, no gaps on high-fit. |
| 75-89 | Mostly matched. 1 small gap or 1 minor wasted effort. |
| 60-74 | Matched on core, 1 obvious gap or 1 obvious wrong-fit investment. |
| 45-59 | Multiple gaps or multiple wrong-fit investments. |
| 30-44 | Platform selection feels random or default. |
| 10-29 | On platforms ICP doesn't use, missing platforms ICP lives on. |
| 0-9 | Complete mismatch. |

---

## Category 7: Competitive Position (10%)

**What it measures:** How the brand ranks against 3 competitors across key social signals.

**Sub-factors:**
1. Follower count share vs competitor avg (30%)
2. Posting cadence share (25%)
3. Format innovation (using newer formats first) (20%)
4. Paid creative presence (15%)
5. Engagement rate vs competitors (10%)

**Scoring anchors:**

| Score | Criteria |
|---|---|
| 90-100 | Leading competitor set on 3+ signals. Innovating formats before competitors. |
| 75-89 | Top quartile of competitor set. |
| 60-74 | Matching competitor avg. |
| 45-59 | Behind competitor avg on 2+ signals. |
| 30-44 | Clearly behind competitors. |
| 10-29 | Not visible in competitive set. |
| 0-9 | Outclassed across the board. |

**Note:** In small competitor sets (3), treat "leading" as clearly ahead of all 3, "matching" as middle of pack, "behind" as worst of 3.

---

## Category 8: Brand Consistency (5%)

**What it measures:** Visual + voice + identity consistency across platforms.

**Sub-factors:**
1. Handle consistency (same @ everywhere) (30%)
2. Visual identity consistency (logo, colours, imagery style) (30%)
3. Voice consistency (caption tone across platforms) (25%)
4. Bio/CTA consistency (15%)

**Scoring anchors:**

| Score | Criteria |
|---|---|
| 90-100 | Identical handle, tight visual system, consistent voice + CTA across every platform. |
| 75-89 | Minor inconsistencies. Mostly aligned. |
| 60-74 | 1 handle mismatch or noticeable voice drift. |
| 45-59 | 2+ inconsistencies. Looks like a portfolio not a brand. |
| 30-44 | Fragmented. Different handles, different voices, different visual systems. |
| 10-29 | Unrecognisable as the same brand. |
| 0-9 | No brand system at all. |

---

## Grade Bands (Composite)

| Composite Score | Grade | Meaning |
|---|---|---|
| 85-100 | A | Sector-leading. Minor refinements. |
| 70-84 | B | Strong. Clear high-ROI gaps. |
| 55-69 | C | Average. Losing share of voice to competitors. |
| 40-54 | D | Below average. Social is a liability. |
| 0-39 | F | Critical. No meaningful presence. |

---

## Scoring Integrity Rules

1. **No score without evidence.** Every category score must be backed by quoted/screenshot/scraped evidence in the detailed section.
2. **Don't inflate for effort.** Posting daily on the wrong platform doesn't earn high Activity score — it may earn high Activity but low Platform-Fit, which is the correct signal.
3. **Be honest about dormancy.** A platform with 500k followers but no post in 6 months scores badly on Activity — reach the brand could have is not reach they have.
4. **Don't double-penalise.** A brand missing TikTok gets hit in Presence Breadth AND Platform-Fit. That's correct — it's two different problems (coverage gap + strategic gap) and both are real.
5. **Score per-platform profiles honestly.** A brand with one great LinkedIn and five empty shells gets ~40 on Profile Quality, not 85 for the LinkedIn alone.
