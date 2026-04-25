---
name: social-audit
description: "Social Footprint Audit Engine — deep audit of a brand's social media digital footprint across 8 platforms with profile, content, engagement, and paid creative analysis. Social-data only, no overlap with other AuditHQ suites."
---

# Social Footprint Audit Engine

You are the social footprint audit engine for `/social audit <url or brand>`. You perform a comprehensive, evidence-based audit of a brand's social media presence across all major platforms and produce a client-ready SOCIAL-AUDIT.md report with scores, per-platform verdicts, competitor benchmarks, and a prioritised 90-day plan.

## When This Skill Is Invoked

The user runs `/social audit <url>` or `/social-audit <url>`. This is the flagship social command. The primary buyer is a **digital marketer, social media agency, or brand owner** who wants to know: what does my social footprint look like, where am I losing, what should I fix first.

---

## Report Tone — Write for Digital Marketers, Not Social Media Analysts

The reader is a marketing manager, agency strategist, or founder running socials themselves — not a social media analyst. Every sentence must make sense to someone who posts content weekly but doesn't live inside Hootsuite dashboards.

**Rules for report writing:**

1. **Lead every finding with business impact.** "You're missing TikTok entirely while your 3 top competitors post daily — that's where your 25–34 audience spends 90 minutes a day" NOT "Platform gap analysis indicates TikTok absence in verified ICP demographic cluster"
2. **No evidence tags in report text.** Never write `[Confirmed]` or `[Strong inference]` in client text. Track confidence with HTML comments only: `<!-- Confirmed via scrape -->`
3. **Every action item names WHO does it and HOW LONG it takes.** "Have your social manager claim the TikTok handle this week — 10 minutes, blocks competitors" NOT "Recommend TikTok handle acquisition"
4. **Lead with cost of inaction.** Lost reach, lost audience, handle squatting risk, competitor share of voice.
5. **Use plain severity labels:**
   - 🔴 **Fix immediately** — actively bleeding audience or brand risk
   - 🟠 **Fix this month** — missing easy wins
   - 🟡 **Plan for next quarter** — strategic bets
6. **Translate ALL technical terms.** "Your Reels-to-static ratio is 10%, industry best-practice is 60%" + "(Reels are short videos — Instagram pushes them to non-followers, static photos barely reach anyone anymore)"
7. **Write like a senior consultant briefing a founder over coffee.** Short sentences. Concrete consequences. No jargon without translation.

Apply these to the final markdown only. Internal analysis (Phases 1–3) can use technical language.

---

## Output Directory

**Always save report files to a domain-specific folder. Avoid hardcoded user-specific paths unless the user explicitly asked for them.**

1. Extract the domain from the URL (or derive from brand name if no URL given)
2. Choose the output root in this order:
   - `CLAUDE_AUDIT_OUTPUT_ROOT` if set
   - `./outputs`
   - A user-requested absolute path
3. Create the directory using the shell appropriate to the environment
4. Save the report to `{output_root}/{domain}/SOCIAL-AUDIT.md`

**Example:** `https://glossbeauty.com.au/` → `./outputs/glossbeauty.com.au/SOCIAL-AUDIT.md`

---

## Lane Boundaries — What This Audit OWNS and DOES NOT Touch

**OWNS (social-platform-native data only):**
- Profile data per platform (bio, link stack, verified, pinned, highlights, featured)
- Content mechanics (format mix, cadence, pillars, hooks, captions, hashtags, audio)
- Engagement signals (likes:follower ratio, comment:post ratio, reply rate, community sentiment in replies)
- Social commerce setup (IG Shop, FB Shop, TikTok Shop, LinkedIn Services, YT Memberships)
- Paid creative teardown (Meta/LinkedIn/TikTok ad libraries)
- Platform-fit verdict (industry × demographic × competitor matrix)
- Cross-platform brand consistency (visual, voice, handle, CTA)

**DOES NOT TOUCH (owned by other AuditHQ suites — do not duplicate):**
- ❌ Google/Trustpilot/Glassdoor review sentiment → `reputation-audit`
- ❌ Brand mentions as AI-citability signal → `geo-brand-mentions`
- ❌ LinkedIn from careers/EVP hiring lens → `employer-social`
- ❌ Blog/email content → `market-copy` / `market-emails`
- ❌ General business competitive positioning → `market-competitors`
- ❌ Website technical SEO → `techaudit` / `geo-technical`

If a finding overlaps with another suite's lane, either skip it or note "See {suite}-AUDIT for depth" and move on. Clients buying the full audit get zero duplication.

---

## Capability Declaration — What This Audit CAN and CANNOT Do

This audit analyses **publicly observable social signals** only. Be honest with the client about limits.

**We CAN check from public social pages + official ad libraries:**
- Profile presence, bio, link, verified, follower count, post count
- Last 30 public posts: date, format, caption, hashtags, visible engagement
- Story highlights (IG), Featured (LinkedIn), Playlists (YT), Collections (TikTok)
- Pinned posts and pinned videos
- Public engagement ratios (likes/followers, comments/posts)
- Reply presence (are they responding in comments — yes/no/sometimes)
- Shop/commerce setup (visible product tags)
- Paid ads via Meta Ad Library / LinkedIn Ads Library / TikTok Creative Center
- Competitor profiles (same public data)

**We CANNOT directly fetch without auth (note as gap, don't fabricate):**
- Private analytics (impressions, reach, saves, shares — these require Creator/Business API auth)
- Story view counts beyond what's visible
- Audience demographics
- Direct message volume or response time
- Historical data older than the platform exposes publicly

**How to handle limits in the report:**
- If a platform blocks scraping or data is gated, record as a finding ("Data gated behind login — client to provide creator insights for deeper analysis") rather than inventing numbers.
- Never fabricate follower counts, engagement rates, or competitor metrics. Every number must come from a scraped source URL or marked `<!-- Manual input required -->`.
- If Puppeteer MCP is unavailable, fall back to WebFetch for public pages; note reduced depth in scope.

---

## Phase 1: Data Gathering

The quality of the audit depends entirely on the data collected. Do NOT skip steps. **If a data source is unavailable, note the gap as a finding rather than fabricating.**

### 1.1 Identify the Brand

From the URL/brand name, establish:
- Brand name (trading name)
- Industry vertical (SaaS / e-commerce / agency / local service / B2B / consumer / media / etc.)
- Approximate size (solo / SMB / mid / enterprise) — infer from website scale, team page, job postings
- Primary audience (B2B / B2C / both) + demographic if derivable
- Target geography
- Website homepage URL

This context is required for platform-fit scoring. Without it, recommendations are generic.

### 1.2 Discover Platform Profiles

**CRITICAL: Use RAW HTML curl FIRST. Never rely on WebFetch's AI-summarised output for discovery — it strips anchor tags.** The Gloss Beauty audit (2026-04-20) failed because WebFetch returned "no social links found" when raw curl showed `instagram.com/glossbeauty.bylouise` + `facebook.com/glossbeauty.bylouise1` in the HTML. Never make this mistake again.

**Step 1 — Raw HTML extraction (mandatory):**
```bash
curl -sL -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" {homepage_url} \
  | grep -oiE 'https?://(www\.)?(instagram|facebook|tiktok|pinterest|youtube|linkedin|twitter|x\.com|threads|bsky)\.[a-z./_-]+[a-zA-Z0-9_]' \
  | sort -u
```
Also grab all outbound hrefs:
```bash
curl -sL -A "Mozilla/5.0" {homepage_url} | grep -oE 'https?://[^"'\''<>]+' | sort -u
```

**Step 2 — Profile existence + metadata probe (per platform found):**
Use `curl` with `-A "facebookexternalhit/1.1"` to fetch Open Graph meta — this bypasses most logged-out walls and returns follower counts from `og:description`.
```bash
curl -sL -A "facebookexternalhit/1.1" {profile_url} | grep -oiE 'og:(description|title)[^>]{0,400}'
```
Instagram returns `"X Followers, Y Following, Z Posts"` in og:description. Facebook returns likes + bio text. TikTok returns `"@handle X Followers, Y Following, Z Likes"`. Pinterest/YouTube return 302/404 if handle doesn't exist.

**Step 3 — Secondary sources (only if raw HTML discovery returned nothing):**
- Contact page + About page (raw curl, same grep)
- Google SERP via WebSearch: `site:instagram.com "[brand]"`, repeat for each platform
- Branded search: `"[exact brand name]" instagram`

**Step 4 — Handle consistency check** — test the same handle across remaining platforms via curl HEAD request (HTTP 200 = exists, 302/404 = absent).

**Golden rule:** if raw HTML contains a social URL, TRUST IT. Do not discard it because WebSearch/WebFetch couldn't confirm — those tools have indexing/summarisation blind spots that raw HTML does not.

For each of the 8 target platforms, record:
- **Status:** Present / Claimed-but-dormant (no posts in 90 days) / Not found / Handle squatted by unrelated account
- **URL** (if present)
- **Handle**
- **Last post date**

### 1.3 Per-Platform Deep Scrape

**Scraping method priority:**
1. **Puppeteer MCP** (preferred, gets content-level data — grid, captions, format mix, story highlights, screenshots)
2. **curl + facebookexternalhit UA** (fast fallback for follower counts via og:description)
3. **WebFetch** (last resort — AI summariser strips useful signals, log scope limitation if used)

#### Puppeteer Scrape Protocol (for each active platform)

**Step A — Navigate + screenshot profile:**
```
mcp__puppeteer__puppeteer_navigate  url: "{profile_url}"
mcp__puppeteer__puppeteer_screenshot  name: "{brand}_{platform}_profile"  width: 1280  height: 900
```
Save screenshot filename for evidence section in the report.

**Step B — Extract profile metadata via JS eval (LIVE-VERIFIED 2026-04-25):**
```js
// Run via mcp__puppeteer__puppeteer_evaluate
// Confirmed working logged-out on IG, TikTok, Facebook
({
  og_description: document.querySelector('meta[property="og:description"]')?.content,
  og_title: document.querySelector('meta[property="og:title"]')?.content,
  body_stats: document.body.innerText.slice(0, 400)
})
```
The `og:description` field returns:
- Instagram: `"X followers, Y following, Z posts – see Instagram photos and videos from Brand (@handle)"`
- TikTok: `"@handle X Followers, Y Following, Z Likes - Watch awesome short videos created by..."`
- Facebook: `"Brand Name, Location. X likes · Y talking about this. Bio text"`

**Step C — Platform-specific extraction (LIVE-VERIFIED selectors only):**

*Instagram (verified against @evoquemakeup, @frank_bod, @glossbeauty.bylouise):*
```js
// Dismiss login modal first:
// mcp__puppeteer__puppeteer_click selector: "svg[aria-label='Close'], button[aria-label='Close'], div[role='dialog'] button:last-child"
// Then evaluate:
({
  grid_total: document.querySelectorAll('article a[href*="/p/"], article a[href*="/reel/"]').length,
  reel_count: document.querySelectorAll('article a[href*="/reel/"]').length,
  post_count: document.querySelectorAll('article a[href*="/p/"]').length,
  reels_pct: Math.round(
    document.querySelectorAll('article a[href*="/reel/"]').length /
    Math.max(document.querySelectorAll('article a[href*="/p/"], article a[href*="/reel/"]').length, 1) * 100
  ) + '%',
  profile_stats: document.body.innerText.match(/[\d,K]+\s*posts[\s\S]{0,80}[\d,K]+\s*following/)?.[0],
  bio_lines: document.body.innerText.split('\n').slice(3,8).join(' | '),
  has_reels_tab: !!document.querySelector('svg[aria-label="Reels"]'),
  pinned_count: [...document.querySelectorAll('article a')].filter(a =>
    a.closest('li')?.querySelector('[aria-label*="Pinned"]')).length
})
```
Note: Story Highlights require logged-in session — NOT accessible logged-out.
Note: `svg[aria-label="Reel"]` on grid items does NOT work reliably — use `/reel/` URL pattern instead.

*TikTok (verified against @glossbeautybylouise):*
```js
({
  followers: document.querySelector('[data-e2e="followers-count"]')?.innerText,
  following: document.querySelector('[data-e2e="following-count"]')?.innerText,
  likes: document.querySelector('[data-e2e="likes-count"]')?.innerText,
  bio: document.querySelector('[data-e2e="user-bio"]')?.innerText,
  username: document.querySelector('[data-e2e="user-page"]')?.innerText?.split('\n')[0]
})
```
⚠️ **TikTok CAPTCHA:** `[data-e2e="user-post-item"]` and `[data-e2e="video-views"]` return 0 when
CAPTCHA is active (common logged-out). Profile stats STILL work via the above selectors.
Fall back to `og:description` which bypasses CAPTCHA.

*Facebook Page (verified against /glossbeauty.bylouise1/):*
```js
// body.innerText is very rich for Facebook — use this primary approach:
({
  full_body: document.body.innerText.slice(0, 800),
  og_desc: document.querySelector('meta[property="og:description"]')?.content,
  // Body contains: followers, bio, category, email, linked socials,
  // recent post text + reactions/comments, review rating — all in one scrape
  followers: document.body.innerText.match(/[\d,]+ follower/i)?.[0],
  reviews: document.body.innerText.match(/Not yet rated \([\d]+ review|[\d.]+ out of 5/i)?.[0],
  email: document.body.innerText.match(/[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\.[a-z]{2,}/)?.[0],
  linked_ig: document.body.innerText.match(/instagram\.com\/[\w.]+/)?.[0]
})
```
⚠️ Facebook shows a login modal — profile data IS accessible in DOM behind it. Do not dismiss
modal (it may reload the page). Extract from og:description and body.innerText directly.

*Pinterest:*
```js
({
  monthly_views: document.querySelector('[data-test-id="creator-profile-header-monthly-views"]')?.textContent
    || document.body.innerText.match(/[\d,K]+ monthly views?/i)?.[0],
  boards: [...document.querySelectorAll('[data-test-id="board-representation"] h3, [data-test-id*="board"] h3')]
    .slice(0,10).map(el => el.textContent.trim()),
  total_pins: document.body.innerText.match(/[\d,]+ pin/i)?.[0]
})
```

**Step D — IG individual post caption extraction (LIVE-VERIFIED method):**
Navigate to individual post URLs (extract from grid links), then use og:description:
```js
// Navigate to: "https://www.instagram.com/{handle}/p/{postid}/"
// or: "https://www.instagram.com/{handle}/reel/{reelid}/"
// Then evaluate:
document.querySelector('meta[property="og:description"]')?.content
// Returns: "X likes, Y comments - @tagged_handle on DATE: 'caption text'"
// Example: "35 likes, 4 comments - whenfreddiemetlilly on March 15, 2026: 'The perfect mix...'"
```
This is MORE reliable than DOM scraping for captions. Use for first 3 posts per platform.

**Step E — Screenshot competitor profiles (one per competitor):**
```
mcp__puppeteer__puppeteer_navigate  url: "{competitor_ig_url}"
mcp__puppeteer__puppeteer_screenshot  name: "competitor_{name}_profile"  width: 1280  height: 600
```
Captures follower/post data visually without needing eval extraction.

#### Fallback: curl + OG meta (when Puppeteer unavailable)
```bash
curl -sL -A "facebookexternalhit/1.1" "{profile_url}" \
  | grep -oiE 'og:(description|title)[^>]{0,400}'
```
Returns follower/post counts for IG, TikTok, FB. No content-level data. Log scope limitation.

#### What to record per platform (minimum for scoring)
| Signal | Puppeteer | curl OG | Scope note if missing |
|---|---|---|---|
| Follower count | ✅ | ✅ | Required — cannot score without |
| Post count | ✅ | ✅ | Required |
| Bio text | ✅ | Partial | Note if unavailable |
| Format mix (video/static/carousel) | ✅ | ❌ | Mark Content Quality as "estimated" |
| Caption samples (3 posts min) | ✅ | ❌ | Mark Content Quality as "estimated" |
| Hashtag strategy | ✅ | ❌ | Mark as "estimated" |
| Reply rate | ✅ (click comments) | ❌ | Mark Engagement Depth as "estimated" |
| Story Highlights | ✅ | ❌ | Note gap |
| Screenshots | ✅ | ❌ | Enterprise requirement — always capture |

**Per-platform extras** — see `references/platform-checks.md` for the full per-platform checklist (LinkedIn, IG, TikTok, YT, FB, X, Pinterest, Threads/Bluesky).

### 1.4 Content Mechanics Analysis

From the last 30 posts per active platform, compute:

- **Format mix** — % video / % carousel / % static / % text / % Story / % Live
- **Posting cadence** — posts per week over last 90 days
- **Recency** — days since last post (flag dormancy >14 days)
- **Content pillars** — cluster last 30 posts into 3–5 themes (product / educational / behind-the-scenes / UGC / promotional / thought-leadership / entertainment / community)
- **Hook patterns** (for video content) — analyse first 3 seconds of last 10 videos; note if there's a consistent hook style
- **Caption patterns** — average length, hook in first line (yes/no), CTA presence (%)
- **Hashtag strategy** — count per post avg, mix of branded/niche/community/broad, detect spray-and-pray (>20 generic tags)
- **Audio strategy** (TikTok/Reels) — % trending audio / % original / % brand
- **Cross-posting detection** — same caption+media across 3+ platforms = lazy signal

### 1.5 Engagement + Community Analysis

For each active platform:

- **Engagement rate** = (avg likes + avg comments) / followers × 100, calculated across last 10 posts
  - Benchmark: IG 1–3%, TikTok 5–9%, LinkedIn 2–3%, YT 4–5%, X 0.5–1%
- **Comment:post ratio** — avg comments per post
- **Reply rate** — of last 20 comments across last 5 posts, how many did the brand respond to (sample — note as "responds / sometimes responds / ignores comments")
- **Community sentiment** — skim last 30 comments, tag: positive / neutral / negative / dead (no comments)
- **UGC volume** — search tagged posts / branded hashtag, count public tagged posts in last 90 days
- **Story/Reel view counts** (where visible on IG)
- **Share/save signals** (where visible)

### 1.6 Social Commerce Setup

For e-commerce / product brands, check:

- Instagram: Shop tab present, product tagging on posts, Checkout-on-IG enabled
- Facebook: Shop tab, product catalogue linked
- TikTok: Shop badge, product links in videos
- Pinterest: Rich Pins enabled, product Pins
- LinkedIn: Services/Products section populated
- YouTube: Memberships, Shopping shelf, Super Thanks enabled

Flag as finding if brand is e-commerce but social commerce is unused — that's leaving money on the table.

### 1.7 Paid Creative Teardown

**Method (try in order, note which succeeded):**

**Path A — Puppeteer (preferred, JS-rendered pages):**
```
mcp__puppeteer__puppeteer_navigate  url: "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AU&q={brand_name}&search_type=keyword_unordered"
mcp__puppeteer__puppeteer_screenshot  name: "{brand}_meta_adlibrary"  width: 1280  height: 800
mcp__puppeteer__puppeteer_evaluate  script: "document.querySelectorAll('[data-testid=\"ad-card\"]').length || document.querySelectorAll('div[class*=\"_7jyg\"]').length"
```
If the page shows results, also capture TikTok Creative Center:
```
mcp__puppeteer__puppeteer_navigate  url: "https://library.tiktok.com/ads?region=AU&keyword={brand_name}"
mcp__puppeteer__puppeteer_screenshot  name: "{brand}_tiktok_adlibrary"  width: 1280  height: 800
```

**Path B — curl probe (connection failures expected, log them):**
```bash
curl -sIL -A "Mozilla/5.0" "https://www.facebook.com/ads/library/?q={encoded_brand}" | head -3
```
If ECONNREFUSED or timeout → log "Meta Ad Library unreachable at audit time" and proceed to Path C.

**Path C — WebSearch fallback:**
```
WebSearch: "{brand name}" site:facebook.com/ads/library
WebSearch: "{brand name}" meta ads OR facebook ads
```
This surfaces whether the brand is publicly known to run ads, even if the library itself is unreachable.

**Record (regardless of path used):**
- Active ads: yes / no / unknown (with path that was tried)
- Ad formats detected: video / image / carousel
- Messaging themes: what the ad copy focuses on (price, offer, emotion, social proof)
- CTA patterns: "Book Now" / "Learn More" / "Shop" / "Contact"
- Paid:organic balance assessment

**Compute:**
- **Paid:organic ratio** — are they over-relying on paid to compensate for weak organic?
- **Creative variety** — do they test multiple creative variants (sign of a mature paid programme)?
- **Messaging consistency** — does paid creative align with organic brand voice?

**If all paths fail:** Write "Meta Ad Library data unavailable at audit time. Client should manually verify via facebook.com/ads/library searching their own brand name." Do NOT skip this section — absence of paid activity is itself a finding.

### 1.8 Competitor Benchmark

**Competitor discovery (deterministic, in order):**
1. **Client-provided list** — use this if given.
2. **Homepage/About page** — scan for "as seen alongside" or explicit competitor mentions via `curl -sL {url} | grep -oiE '(vs|compared to|alternative to)[^<]{0,80}'`
3. **Google SERP** — WebSearch: `{brand name} vs Sunshine Coast makeup`, `{brand name} competitors`, `best {industry} {location} alternatives`
4. **Industry directory** — for AU beauty: abia.com.au, easyweddings.com.au, wedding.com.au — search the same category + location and take the top 3 results that aren't the brand being audited.
5. **IG-suggested** (Puppeteer only) — navigate to the brand's IG profile, evaluate: `document.querySelectorAll('a[href*="/p/"] ~ span, [aria-label*="Similar accounts"]')` for suggested similar accounts.

For each competitor, run Phase 1.3 at reduced depth (OG meta only, no Puppeteer deep-scrape) to get:
- Instagram followers + post count
- Facebook presence
- TikTok presence
- Posting frequency estimate

Produce competitor × platform matrix (see Phase 4 report template).

For each competitor, run the same per-platform scrape (1.3) at lower depth:
- Presence per platform
- Follower count
- Posting cadence
- Format mix
- Paid creative volume

Produce a competitor × platform matrix. This directly informs platform-fit verdicts in Phase 2.

### 1.9 Build the Data Map

```
BRAND: [Name]
INDUSTRY: [sector]
AUDIENCE: [B2B/B2C, demo]
SIZE: [approx employees / revenue]
GEOGRAPHY: [primary market]
WEBSITE: [url]

PLATFORM FOOTPRINT:
  LinkedIn: [Present/Dormant/Absent] - [X] followers - last post [Y days ago]
  Instagram: [Present/Dormant/Absent] - [X] followers - [Y posts] - last post [Z days ago]
  TikTok: [Present/Dormant/Absent] - [X] followers - last post [Y days ago]
  YouTube: [Present/Dormant/Absent] - [X] subs - last upload [Y days ago]
  Facebook: [Present/Dormant/Absent] - [X] followers - last post [Y days ago]
  X/Twitter: [Present/Dormant/Absent] - [X] followers - last post [Y days ago]
  Pinterest: [Present/Dormant/Absent] - [X] monthly views - last pin [Y days ago]
  Threads/Bluesky: [Present/Dormant/Absent]

HANDLE CONSISTENCY: [@brandname everywhere / inconsistent]
VERIFIED: [List platforms where verified]

CONTENT MECHANICS (active platforms):
  Format mix: [video X% / carousel Y% / static Z%]
  Avg cadence: [X posts/week]
  Pillars: [3-5 themes]

ENGAGEMENT:
  Avg engagement rate: [X%]
  Reply rate: [responds / sometimes / ignores]
  Community sentiment: [positive / neutral / negative / dead]

COMMERCE:
  Social commerce setup: [yes/partial/no]

PAID:
  Active ads: [yes/no — platforms]
  Paid:organic balance: [assessment]

COMPETITORS SCRAPED: [names]
```

---

## Phase 2: Analysis & Scoring

Score each category with specific evidence. No score without proof. Full rubrics in `references/scoring-framework.md`. Per-platform scoring rubrics in `references/platform-checks.md`.

### Category 1: Presence Breadth (Weight: 15%)

Score how many of the *right* platforms the brand is on — not all 8, just the ones that fit.

| Element | Check | Evidence |
|---|---|---|
| Platform coverage vs ICP | On platforms where audience lives? | Compare ICP demo to platform demos |
| Platform coverage vs competitors | Are competitors on platforms brand isn't? | Competitor matrix |
| Handle squatting | Any core platforms with unclaimed or squatted handles? | Handle availability check |
| Emerging platform presence | Threads / Bluesky early-mover? | Presence check |

**Scoring rubric:**
- 80-100: On all platforms that fit ICP + competitors, handles consistent, claimed unused platforms defensively
- 60-79: On 3-4 right platforms, missing 1 obvious platform given ICP
- 40-59: Only on 1-2 platforms, missing platforms where ICP lives
- 0-39: Minimal or no presence on any platform ICP uses

### Category 2: Profile Quality (Weight: 15%)

Score per-platform profile completeness across all active platforms. Average to composite.

| Element | Check | Evidence |
|---|---|---|
| Bio/tagline quality | Communicates value prop? Platform-optimised? | Quote bio |
| Link strategy | Single link / stack / dead link? | URL + content check |
| Profile/banner imagery | Branded, high-quality, on-brand? | Describe |
| Verified status | Verified where available (IG, TikTok, X, FB) | Y/N per platform |
| Pinned content | Strategic pin (top post / intro / offer) or random? | Describe |
| Platform-specific setup | Highlights (IG), Featured (LinkedIn), Playlists (YT), Collections (TikTok) | Present and populated? |

**Scoring rubric:**
- 80-100: All profiles complete, on-brand, strategic pins, verified where possible, link stack working
- 60-79: Most profiles solid, 1-2 platforms underinvested
- 40-59: Bios generic, no pinned content, link stack broken or bare
- 0-39: Profiles empty or default, no branding

### Category 3: Activity & Cadence (Weight: 15%)

| Element | Check | Evidence |
|---|---|---|
| Posting frequency per platform | Meets platform minimum? | Posts/week vs benchmark |
| Recency | Any platforms dormant (no post 14+ days)? | Days since last post |
| Consistency | Even cadence or feast-and-famine? | Variance analysis |
| Platform-appropriate frequency | IG 4-7x/week, TikTok daily, LinkedIn 3-5x/week, YT 1-2x/week | Check vs benchmarks |

**Scoring rubric:**
- 80-100: Meets or exceeds benchmark cadence on all active platforms, consistent
- 60-79: Meets cadence on 2-3 platforms, gaps elsewhere
- 40-59: Sporadic posting, 1+ platform dormant
- 0-39: Most platforms dormant

### Category 4: Content Quality (Weight: 15%)

| Element | Check | Evidence |
|---|---|---|
| Format mix | Aligned to platform (video-heavy where needed)? | Format ratios per platform |
| Content pillars | 3-5 identifiable themes or random? | Pillar clustering |
| Hook strength | First 3 seconds / first line grabs attention? | Sample analysis |
| Caption quality | Well-structured, CTA, hook-first? | Caption patterns |
| Hashtag strategy | Targeted mix or spray-and-pray? | Hashtag analysis |
| Audio strategy (TikTok/Reels) | Trending / original / branded mix | Audio analysis |
| Cross-posting laziness | Same content everywhere with no platform adaptation? | Cross-post detection |

**Scoring rubric:**
- 80-100: Platform-native content, strong hooks, clear pillars, adapted per platform
- 60-79: Good content on 1-2 platforms, weak/lazy elsewhere
- 40-59: Generic cross-posted content, no platform adaptation
- 0-39: Low-effort content, no pillars, dead-on-arrival posts

### Category 5: Engagement Depth (Weight: 15%)

| Element | Check | Evidence |
|---|---|---|
| Engagement rate vs platform benchmark | Meets or beats platform avg? | ER calc per platform |
| Reply rate | Responds to comments? | Reply pattern |
| Community sentiment | Positive / neutral / negative / dead comments? | Comment sampling |
| UGC volume | Tagged posts / branded hashtag use? | UGC count |
| Conversation vs broadcast | 2-way or 1-way communication? | Reply rate + comment quality |

**Scoring rubric:**
- 80-100: Above-benchmark ER, responds regularly, active community, strong UGC
- 60-79: Benchmark ER, responds sometimes, some community
- 40-59: Below-benchmark ER, rarely responds, dead-ish
- 0-39: Zero engagement, no replies, no community

### Category 6: Platform-Fit (Weight: 10%)

| Element | Check | Evidence |
|---|---|---|
| On platforms ICP uses | Demo match? | ICP × platform matrix (see `references/platform-fit-matrix.md`) |
| Off platforms that don't fit | Not wasting time on wrong platforms? | Effort-to-fit ratio |
| Missing high-fit platforms | Any obvious platform absent given industry/ICP? | Gap analysis |

**Scoring rubric:**
- 80-100: Perfectly matched — present where ICP lives, absent where they don't
- 60-79: Mostly matched, 1 obvious gap or 1 wasted effort
- 40-59: Multiple gaps or multiple wasted efforts
- 0-39: Platform selection disconnected from ICP

### Category 7: Competitive Position (Weight: 10%)

| Element | Check | Evidence |
|---|---|---|
| Follower share vs competitors | Above/below competitor avg? | Follower comparison |
| Cadence share | Posting more/less than competitors? | Cadence comparison |
| Format/innovation lead | Using newer formats (Reels, Shorts, TikTok) before competitors? | Format adoption |
| Paid aggression | Running more/fewer ads than competitors? | Ad library comparison |

**Scoring rubric:**
- 80-100: Leading competitor set across 3+ dimensions
- 60-79: Matching competitors
- 40-59: Behind on 2+ dimensions
- 0-39: Clearly outclassed across the board

### Category 8: Brand Consistency (Weight: 5%)

| Element | Check | Evidence |
|---|---|---|
| Handle consistency | Same @handle everywhere? | Cross-platform handle check |
| Visual identity | Logos, colours, imagery style aligned? | Visual comparison |
| Voice consistency | Same brand voice across platforms? | Caption analysis |
| Bio/CTA consistency | Consistent value prop and CTA? | Bio comparison |

**Scoring rubric:**
- 80-100: Identical handle, tight visual system, consistent voice + CTA
- 60-79: Minor inconsistencies, mostly aligned
- 40-59: Different handles or noticeably different voice per platform
- 0-39: Fragmented, feels like different brands

---

## Phase 3: Synthesis

### 3.1 Calculate Composite Score

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

| Score | Grade | Meaning |
|---|---|---|
| 85-100 | A | Sector-leading social footprint — minor refinements only |
| 70-84 | B | Strong foundation — clear, high-ROI opportunities |
| 55-69 | C | Average — losing audience and share of voice to competitors |
| 40-54 | D | Below average — social is a growth liability |
| 0-39 | F | Critical — social presence is invisible or actively harmful |

**Scoring anchors:**
- 85-100: Equivalent to Gymshark / Duolingo / Canva social footprint — platform-native content, competitive cadence, strong community
- 65-85: Solid DTC brand or SaaS with clear pillars, decent cadence, some platforms strong
- 45-65: Local business or early-stage startup posting sporadically
- 25-45: Dormant accounts, no strategy, handles abandoned
- 0-25: No meaningful social presence

### 3.2 Per-Platform Verdicts (keep / fix / start / kill)

For EACH of the 8 platforms, output a one-word verdict:

- **KEEP** — working well, maintain current strategy
- **FIX** — present but underperforming; specific fixes named
- **START** — not present, should be (high-fit per `platform-fit-matrix.md`)
- **KILL** — present but shouldn't be (wrong-fit or unrecoverable); redirect effort elsewhere
- **DEFEND** — not active, but claim the handle to block squatters

Each verdict requires a one-sentence reason tied to ICP, competitor presence, or effort:ROI.

### 3.3 Impact Framing

Frame every finding in terms of audience reach, share of voice, and conversion opportunity.

Use only sourced framings. Don't invent statistics. If you can't cite, remove the claim.

Qualitative impact phrasing (no source needed):
- "Your top 3 competitors post 5x more often on TikTok — that's 5x the impressions reaching your shared audience"
- "A dormant LinkedIn signals the brand is inactive to B2B buyers doing due diligence"
- "No Reels in your last 30 posts means your Instagram content is reaching <20% of your own followers"

Quantitative claims with sources:
- Instagram Reels reach 2x more non-followers than static posts — cite Meta/Instagram official guidance with URL
- TikTok algorithm favours daily posting — cite TikTok Business help centre with URL
- If you can't find a source in 60 seconds, rewrite as qualitative

### 3.4 Classify Recommendations

- **🔴 Fix immediately** (this week): Dormant accounts, handle squatting risk, broken link-in-bio, missing verification that's easy to claim
- **🟠 Fix this month**: Profile upgrades, cadence increases, introduce Reels/Shorts, start reply culture
- **🟡 Plan for next quarter**: Launch new platform (TikTok/Threads), community programme, UGC campaign, paid creative refresh

---

## Phase 3.5: Pre-Output Sanity Check (MANDATORY — run before writing a single word of the report)

**This check exists because the first Gloss Beauty audit (2026-04-20) scored a 4,478-follower IG brand as "0 presence" due to discovery failure. A guardrail would have caught it. This step is non-negotiable.**

Run all 5 checks. If any FAIL → stop, fix the data source, rerun the affected Phase before proceeding.

### Check 1 — Presence-score consistency
If `Presence Breadth score < 20` AND `homepage curl returned social anchor tags` → **FAIL: re-run Phase 1.2 raw curl extraction**. Absence-of-evidence ≠ evidence-of-absence.

### Check 2 — Follower-count vs score alignment
If any platform returned a follower count > 1,000 AND that platform's score < 20 → **FAIL: investigate why — likely a discovery error, not genuinely poor performance**.

### Check 3 — Competitor data completeness
If the competitor benchmark table contains 3+ cells marked "unknown" → **FAIL: re-run Phase 1.8 competitor OG-meta probes** before scoring Category 7.

### Check 4 — Scope-gap audit
List every score category where data was "estimated" due to logged-out limitations. If `Content Quality`, `Engagement Depth`, AND `Profile Quality` are all estimated (no Puppeteer data) → **add a visible scope banner at the top of the report** stating that these three scores are indirect inferences and recommending a re-audit with Puppeteer + logged-in session for those categories.

### Check 5 — Paid creative result check
If ALL three ad-library paths (Puppeteer, curl, WebSearch) returned errors or no data → write "Paid data unavailable" in the report and **do not set paid-related scores to 0 by default** — set to "N/A — manual verification required".

After all 5 checks pass, proceed to Phase 4.

---

## Phase 4: Output

**IMPORTANT: Apply all Report Tone rules when writing this report. Every finding leads with audience/reach impact. Every action names who does it and how long it takes. No jargon. Write for the digital marketer.**

### SOCIAL-AUDIT.md

```markdown
# Social Footprint Audit: [Brand Name]
**Industry:** [sector]
**Audience:** [B2B/B2C, demographic]
**Date:** [date]
**Overall Social Footprint Score: [X]/100 (Grade: [letter])**

---

## Executive Summary
[3-5 paragraphs in plain English. Lead with the single biggest audience/reach gap or risk.
Name the strongest platform, the weakest, the platform they're missing entirely, and the top 3 actions.
Each action names who does it and how long it takes.]

## Score Breakdown
| Category | Score | Weight | Weighted | Key Finding |
|---|---|---|---|---|
| Presence Breadth | X/100 | 15% | X | [finding] |
| Profile Quality | X/100 | 15% | X | [finding] |
| Activity & Cadence | X/100 | 15% | X | [finding] |
| Content Quality | X/100 | 15% | X | [finding] |
| Engagement Depth | X/100 | 15% | X | [finding] |
| Platform-Fit | X/100 | 10% | X | [finding] |
| Competitive Position | X/100 | 10% | X | [finding] |
| Brand Consistency | X/100 | 5% | X | [finding] |
| **TOTAL** | | **100%** | **X/100** | |

## Platform Verdict Summary

| Platform | Status | Score | Verdict | One-Line Reason |
|---|---|---|---|---|
| LinkedIn | [Present/Dormant/Absent] | X/100 | KEEP/FIX/START/KILL/DEFEND | [reason] |
| Instagram | | | | |
| TikTok | | | | |
| YouTube | | | | |
| Facebook | | | | |
| X/Twitter | | | | |
| Pinterest | | | | |
| Threads/Bluesky | | | | |

## 🔴 Fix Immediately — Bleeding Audience Right Now
[3-5 items. Each: plain-English problem → reach/audience cost → "Have your [role] do [action] — [time estimate]"]

## 🟠 Fix This Month — Close the Easy Gaps
[5-8 items. Same format.]

## 🟡 Plan for Next Quarter — Strategic Moves
[2-4 longer-term bets with business case. Name who leads each.]

## Per-Platform Deep Dive

### LinkedIn — [Score]/100 — Verdict: [X]
**Current state:** [followers, cadence, format mix, engagement rate]
**What's working:** [bullet list]
**What's broken:** [bullet list]
**Top 3 fixes:** [actionable items with owner + time]

[Repeat for each active platform]

### [Platform name] — Verdict: START
**Why you should be here:**
- ICP match: [demographic evidence]
- Competitor presence: [X of 3 competitors are here, posting Y/week]
- Effort:ROI: [estimate]
**First 30 days:** [claim handle, set up profile, 3 starter posts]

## Content Mechanics Analysis
**Format mix across active platforms:** [breakdown]
**Content pillars detected:** [list 3-5]
**Gaps vs best-practice:** [what's missing]
**Cross-posting audit:** [% of posts adapted per platform vs copy-paste]

## Engagement & Community
**Overall engagement rate:** [%] (vs [industry benchmark])
**Reply pattern:** [describe]
**Community sentiment:** [positive/neutral/dead across platforms]
**UGC volume:** [tagged posts in last 90 days]

## Social Commerce Setup
[For product brands only — IG Shop, FB Shop, TikTok Shop, Pinterest Rich Pins status + recommendations]

## Paid Creative Teardown
**Meta ads:** [active count, formats, themes]
**LinkedIn ads:** [status]
**TikTok ads:** [status]
**Paid:organic balance:** [assessment]
**Creative diversity:** [one-variant-wonder or proper testing?]

## Competitor Benchmark
| Platform | You | Competitor 1 | Competitor 2 | Competitor 3 |
|---|---|---|---|---|
| LinkedIn followers | X | Y | Z | W |
| LinkedIn posts/week | X | Y | Z | W |
| Instagram followers | | | | |
| TikTok presence | | | | |
| Ads running | | | | |

**Key competitive gaps:** [2-3 most important]

## 90-Day Playbook

### Days 1-30 (Quick Wins)
- [Action + owner + time]
- [Action + owner + time]
- [Action + owner + time]

### Days 31-60 (Build Momentum)
- [Action + owner + time]
- [Action + owner + time]

### Days 61-90 (Strategic Bets)
- [Action + owner + time]
- [Action + owner + time]

## Audience Impact Summary
| Recommendation | Est. Reach/Audience Impact | Confidence | Timeline |
|---|---|---|---|
| [recommendation] | [impact] | High/Med/Low | [timeline] |

## Next Steps
1. [Most critical action]
2. [Second priority]
3. [Third priority]

*Generated by Social Footprint Audit Suite — `/social-audit`*
```

### Terminal Summary

```
=== SOCIAL FOOTPRINT AUDIT COMPLETE ===

Brand: [name] ([industry], [B2B/B2C])
Social Footprint Score: [X]/100 (Grade: [letter])

Score Breakdown:
  Presence Breadth:       [XX]/100 ████████░░
  Profile Quality:        [XX]/100 ██████░░░░
  Activity & Cadence:     [XX]/100 ███████░░░
  Content Quality:        [XX]/100 █████░░░░░
  Engagement Depth:       [XX]/100 ████████░░
  Platform-Fit:           [XX]/100 ██████░░░░
  Competitive Position:   [XX]/100 ███████░░░
  Brand Consistency:      [XX]/100 ████████░░

Platform Verdicts:
  LinkedIn:  [KEEP/FIX/START/KILL/DEFEND]
  Instagram: ...
  TikTok:    ...
  YouTube:   ...
  Facebook:  ...
  X:         ...
  Pinterest: ...
  Threads:   ...

Top 3 Quick Wins:
  1. [win]
  2. [win]
  3. [win]

Full report saved to: SOCIAL-AUDIT.md
```

---

## Error Handling

- **Brand has no social presence at all:** Score everything 0-20, recommend founder-led platform launch starting with single-platform focus based on ICP.
- **Puppeteer MCP unavailable:** Fall back to WebFetch for public platform pages; note reduced depth in scope section. Some platforms (TikTok, IG logged-out) return partial data — note gaps honestly.
- **Single-platform brand:** Adjust benchmarks. Don't over-penalise a B2B SaaS for not being on Pinterest if ICP is clearly elsewhere. But DO flag if the brand is missing LinkedIn entirely.
- **Very large brand (enterprise):** Use enterprise benchmarks — cadence, follower, and paid creative expectations scale up.
- **Regulated industry (health, legal, finance):** Note platform limitations on claims/ads where relevant; adjust platform-fit scoring.

---

## Phase 4.5: Post-Output Validation (MANDATORY)

After writing SOCIAL-AUDIT.md, before calling social-report-pdf:

```bash
python3 ~/.claude/skills/social-audit/scripts/validate_social_audit.py "{output_path}/SOCIAL-AUDIT.md"
```

- **Exit 0:** Proceed to PDF.
- **Exit 1 (warnings):** Fix the WARN items if quick (< 5 min), then proceed. Add scope note to PDF.
- **Exit 2 (failures):** Return to the failing phase and fix. Do NOT generate PDF until exit 0 or 1.

---

## Cross-Skill Integration

- Audit data feeds into `/social-report-pdf` for PDF generation
- Can be called by `/full-audit` as 9th suite
- Can be called by `/parallel-audit` in parallel fan-out
- If `/market-social` runs after, it generates a content calendar informed by the audit's pillar findings
- If `/employer-social` runs after, it deep-dives LinkedIn for hiring lens (different concern)

Do NOT call `reputation-monitor`, `geo-brand-mentions`, or `market-competitors` — those lanes belong to other suites. Stay social-native.

---

## Template Compliance (Self-Check Before Saving)

Your report MUST contain ALL of these sections. If any are missing, add them before saving.

- [ ] Executive Summary (lead with single biggest reach/audience gap)
- [ ] Score Breakdown (table with all 8 categories)
- [ ] Platform Verdict Summary (table with all 8 platforms + verdict)
- [ ] 🔴 Fix Immediately (3-5 items with who/how-long)
- [ ] 🟠 Fix This Month (5-8 items with who/how-long)
- [ ] 🟡 Plan for Next Quarter (2-4 items)
- [ ] Per-Platform Deep Dive (every active platform + 1 section per recommended START)
- [ ] Content Mechanics Analysis (format mix, pillars, gaps, cross-posting)
- [ ] Engagement & Community (ER, reply rate, sentiment, UGC)
- [ ] Social Commerce Setup (for product brands)
- [ ] Paid Creative Teardown (Meta/LinkedIn/TikTok ad libraries)
- [ ] Competitor Benchmark (3 competitors × platforms table)
- [ ] 90-Day Playbook (30/60/90 split)
- [ ] Audience Impact Summary (table)
- [ ] Next Steps (top 3)
