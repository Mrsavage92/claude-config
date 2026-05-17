# Discovery Rules — Read Before Fetching External Pages

These rules apply to any skill that fetches external pages to discover links, social profiles, contact info, schema, or meta tags. Used by social-audit, market-audit, techaudit, geo-audit, reputation-audit, employer-audit.

## Rule 1: Raw curl FIRST, WebFetch only as fallback

WebFetch's AI summariser strips anchor tags. It returns prose descriptions and will often report "no social links found" on a page that literally has `<a href="https://instagram.com/handle">` in the HTML. Do not trust WebFetch for link discovery.

**Discovery sequence:**
```bash
# Step 1 — raw curl with browser UA
curl -sL -A "Mozilla/5.0" "$URL" | grep -oE 'pattern'

# Examples:
curl -sL -A "Mozilla/5.0" "$URL" | grep -oE 'instagram\.com/[A-Za-z0-9_.-]+'
curl -sL -A "Mozilla/5.0" "$URL" | grep -oE 'facebook\.com/[A-Za-z0-9_.-]+'
curl -sL -A "Mozilla/5.0" "$URL" | grep -oE 'linkedin\.com/(in|company)/[A-Za-z0-9_-]+'
curl -sL -A "Mozilla/5.0" "$URL" | grep -oE 'tel:[+0-9 ()-]+'
curl -sL -A "Mozilla/5.0" "$URL" | grep -oE 'mailto:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+'
```

## Rule 2: Use platform crawler UAs to read OG meta on profile pages

For follower counts, post counts, and `og:description` from Instagram/Facebook/TikTok profile pages without auth:

```bash
curl -sL -A "facebookexternalhit/1.1" "https://www.instagram.com/<handle>/" | grep -oE '<meta property="og:description"[^>]*>'
```

This works on IG, FB, TikTok and returns follower-count strings without needing logged-in scraping.

## Rule 3: WebFetch / WebSearch only when necessary

Fall back to WebFetch only if:
- Raw curl returned nothing AND
- The page is JS-rendered (check for `<noscript>` warnings, near-empty body, React/Vue root divs)

For JS-rendered pages, prefer `mcp__chrome-devtools__*` tools (`new_page`, `take_screenshot`, `evaluate_script`) over WebFetch — they actually execute JS. Use `mcp__puppeteer__*` only when interactive form-fill flows with CSS selectors are required (chrome-devtools click/fill require uid from `take_snapshot`).

## Rule 4: Trust raw HTML over search indexes

SERP results have indexing blind spots. The HTML on the live page does not. If raw HTML and a search result disagree, the HTML is canonical.

## Why this exists

Gloss Beauty audit (2026-04-20): scored brand 5/100 "no social presence found" when the homepage HTML clearly contained links to Instagram (4,478 followers) and Facebook. WebFetch missed both. Raw curl found them in one call.
