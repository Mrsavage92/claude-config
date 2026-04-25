# Social Data API Fallback Reference

Use when Puppeteer (logged-out or authenticated) cannot retrieve sufficient content-level
data. APIs return structured post data, engagement rates, hashtag analysis, and follower
growth without scraping limitations.

---

## When to Use an API

| Signal needed | Free (logged-out Puppeteer) | API required |
|---|---|---|
| Follower count | ✅ og:description | — |
| Post count | ✅ og:description | — |
| Reel/post format mix (first 12) | ✅ URL pattern `/reel/` vs `/p/` | — |
| Caption of first 3 posts | ✅ og:description on post pages | — |
| Follower growth trend | ❌ | ✅ API |
| Engagement rate (precise, 30 posts) | Partial (5 posts via og:desc) | ✅ API |
| Hashtag performance | ❌ | ✅ API |
| Story performance | ❌ (auth required) | ✅ API |
| Audience demographics | ❌ | ✅ API (own account only) |
| Competitor follower history | ❌ | ✅ API |
| TikTok video views (CAPTCHA) | ❌ | ✅ API |

---

## Recommended APIs (No Auth Required for Public Data)

### 1. Apify — Instagram/TikTok Scrapers
- **Best for:** Bulk post scraping, engagement rates across 30 posts, follower history
- **Cost:** ~$0.50–$2 per 1,000 posts
- **Actors:** `apify/instagram-profile-scraper`, `apify/tiktok-scraper`
- **Usage in audit:** Run before the SKILL.md Phase 1.3 for data-rich clients

```bash
# Apify API call (add to scrape_og_meta.sh as optional step)
curl -s "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs" \
  -X POST \
  -H "Authorization: Bearer {APIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"usernames": ["{handle}"], "resultsLimit": 30}'
```

Returns: post URLs, likes, comments, captions, hashtags, timestamps — exactly what Phase 1.4 needs.

### 2. RapidAPI — Social Media APIs
- **Best for:** Quick follower count + engagement rate without full scraping setup
- **API:** `instagram-scraper-api2` or `tiktok-scraper2` on RapidAPI
- **Cost:** Free tier (100 req/month), paid from $10/month
- **Advantage:** No Puppeteer needed — pure API call

### 3. PhantomBuster — Social Automation
- **Best for:** Authenticated account scraping (client provides their own account)
- **Use case:** Client consents to share account — get Story Highlights, Insights, saves
- **Cost:** $56/month for agency tier

---

## Integration Into social-audit Skill

Add to Phase 1.3 when Apify token is set in env:

```bash
APIFY_TOKEN="${APIFY_TOKEN:-}"
if [[ -n "$APIFY_TOKEN" ]]; then
  echo "Apify token detected — using API for full 30-post engagement data"
  # Run Apify actor, parse results into Phase 1.4 content mechanics
else
  echo "No APIFY_TOKEN — using Puppeteer + og:description (estimated ER)"
fi
```

---

## Mapping API Data to Skill Scoring

When Apify data is available, these categories upgrade from "estimated" to "verified":

| Category | Puppeteer only | With Apify |
|---|---|---|
| Content Quality | Estimated (first 12 grid items) | Verified (30 posts, captions, hashtags) |
| Engagement Depth | Estimated (5 posts via og:desc) | Verified (30 posts avg ER) |
| Activity & Cadence | Verified (post count from og:desc) | Verified + trend data |
| Profile Quality | Verified | Verified |

Remove `<!-- Estimated -->` scope tags from categories where API data was used.
Update the scope banner at the top of the report to note "API-verified data" for those categories.

---

## Cost Guideline for AuditHQ Pricing Tiers

| Tier | Data method | API cost | Suggested price |
|---|---|---|---|
| Starter | Puppeteer logged-out only | $0 | $199 |
| Standard | Puppeteer + og:description on 5 posts | $0 | $399 |
| Pro | Apify 30-post scrape | ~$2 | $799 |
| Enterprise | Apify + authenticated session | ~$5 | $1,500+ |
