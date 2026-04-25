# Authenticated Puppeteer Session Guide

Use this when the standard logged-out audit returns insufficient content-level data.
An authenticated session unlocks: Story Highlights, TikTok video grid, IG post engagement
(saves, shares), full comment threads, and account insights for accounts you own.

---

## When to Use Authenticated Session

| Scenario | Use auth? | Reason |
|---|---|---|
| Standard audit (any brand, external) | No | Logged-out covers 80% of scoring data |
| TikTok CAPTCHA blocking video grid | No first | Try og:description first — profile stats still available |
| Story Highlights needed for profile quality score | Yes | Only accessible logged-in |
| Engagement rate needed (likes + comments on individual posts) | og:description first | Gives likes+comments per post without auth |
| Save/share counts needed | Yes | Auth-only data |
| Brand is your own client and consents | Yes | Richer data + can access Insights |

---

## How to Set Up (Puppeteer Persistent Session)

### Option A: Cookie injection (fastest for one-off audits)
1. Log into Instagram/TikTok/Facebook manually in Chrome
2. Open DevTools → Application → Cookies
3. Export the session cookies as JSON
4. Inject into Puppeteer:

```js
// In puppeteer_evaluate after navigate to platform:
const cookies = JSON.parse(`[
  {"name": "sessionid", "value": "YOUR_SESSION_VALUE", "domain": ".instagram.com"},
  {"name": "csrftoken", "value": "YOUR_CSRF", "domain": ".instagram.com"}
]`)
// Then in a Node.js Puppeteer script:
await page.setCookie(...cookies)
await page.reload()
```

**For the social-audit skill context:** Cookie injection is not directly possible via
`mcp__puppeteer__puppeteer_evaluate` alone — it requires a setup script. Use Option B instead.

### Option B: Manual pre-login (practical for the skill)
1. Before running the social audit, navigate to the platform and log in:
```
mcp__puppeteer__puppeteer_navigate  url: "https://www.instagram.com/accounts/login/"
```
2. Use puppeteer_fill to enter credentials:
```
mcp__puppeteer__puppeteer_fill  selector: "input[name='username']"  value: "{client_provided_username}"
mcp__puppeteer__puppeteer_fill  selector: "input[name='password']"  value: "{client_provided_password}"
mcp__puppeteer__puppeteer_click  selector: "button[type='submit']"
```
3. Wait for redirect, then navigate to profile:
```
mcp__puppeteer__puppeteer_navigate  url: "https://www.instagram.com/{handle}/"
```

⚠️ **Security note:** Never store credentials in the skill or any file. Always request them
from the client interactively at audit time. Never log or screenshot during login.

---

## Authenticated-Only Signals (Unlocked After Login)

### Instagram (logged-in)
```js
({
  highlights: [...document.querySelectorAll('ul[aria-label*="highlight"] li, section ul > li')]
    .slice(0,10).map(li => ({
      cover: li.querySelector('img')?.src,
      label: li.querySelector('div[class*="x"]')?.innerText?.trim()
    })).filter(h => h.label),
  story_highlights_count: document.querySelectorAll('section ul > li').length
})
```

### TikTok (logged-in — solves CAPTCHA)
```js
({
  videos: [...document.querySelectorAll('[data-e2e="user-post-item"]')]
    .slice(0,12).map(v => ({
      views: v.querySelector('[data-e2e="video-views"]')?.textContent,
      href: v.querySelector('a')?.href
    }))
})
```

### Facebook (logged-in)
```js
({
  page_followers: document.querySelector('[data-key="tab_followers"]')?.innerText,
  reviews_rating: document.querySelector('[aria-label*="out of 5"]')?.getAttribute('aria-label'),
  recent_posts: [...document.querySelectorAll('div[role="article"]')]
    .slice(0,3).map(a => ({
      text: a.innerText.slice(0,200),
      reactions: a.querySelector('[aria-label*="reactions"]')?.getAttribute('aria-label')
    }))
})
```

---

## Scope Banner When Auth Not Used

If the client didn't provide credentials for an authenticated session, add this banner
to the top of the SOCIAL-AUDIT.md report:

```
> **Audit scope:** This is a public-signal audit only. Story Highlights, TikTok video grid
> (if CAPTCHA active), and engagement save/share data require an authenticated session.
> Categories scored on estimated basis: Content Quality, Engagement Depth (partial).
> Scores marked <!-- Estimated --> are indirect inferences — re-audit with client credentials
> for precise values.
```

---

## Engagement Rate Calculation Without Auth

Use og:description on individual post pages. Navigate to the most recent 5 post URLs,
extract og:description from each, parse likes + comments:

```
"35 likes, 4 comments - @handle on DATE: 'caption text'"
```

Parse pattern: `(\d+) likes, (\d+) comments`

Then: `ER = (avg_likes + avg_comments) / followers * 100`

This is reliable logged-out for IG. TikTok post og:description format differs:
`"@handle on TikTok | caption text... #hashtag"`  (does NOT include view counts)
→ For TikTok ER, use `data-e2e="video-views"` from individual video page.
