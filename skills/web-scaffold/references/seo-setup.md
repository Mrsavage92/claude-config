# SEO Setup — web-scaffold

## `src/hooks/useSeo.ts` — Per-page SEO

```ts
// src/hooks/useSeo.ts
import { useEffect } from 'react'

interface SeoOptions {
  title: string
  description?: string
  image?: string    // absolute URL for OG image
  noIndex?: boolean
}

export function useSeo({ title, description, image, noIndex }: SeoOptions) {
  useEffect(() => {
    // Title
    document.title = title ? `${title} | [ProductName]` : '[ProductName]'

    // Description
    const desc = document.querySelector('meta[name="description"]')
    if (desc && description) desc.setAttribute('content', description)

    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDesc = document.querySelector('meta[property="og:description"]')
    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogTitle) ogTitle.setAttribute('content', document.title)
    if (ogDesc && description) ogDesc.setAttribute('content', description)
    if (ogImage && image) ogImage.setAttribute('content', image)

    // noIndex
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    if (noIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta')
        robotsMeta.name = 'robots'
        document.head.appendChild(robotsMeta)
      }
      robotsMeta.content = 'noindex, nofollow'
    } else if (robotsMeta) {
      robotsMeta.content = 'index, follow'
    }
  }, [title, description, image, noIndex])
}
```

Seed `index.html` with base meta tags (replace placeholders during scaffold):
```html
<!-- in <head> -->
<title>[ProductName]</title>
<meta name="description" content="[One-sentence product description]" />
<meta property="og:title" content="[ProductName]" />
<meta property="og:description" content="[One-sentence product description]" />
<meta property="og:image" content="[ProductURL]/og-image.png" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="robots" content="index, follow" />
```

Usage on every page:
```tsx
useSeo({
  title: 'Dashboard',
  description: 'Monitor your [product] performance.',
})
```

**Auth/settings/onboarding pages: always set `noIndex: true`** — only public pages should be indexed.

---

## `llms.txt` and `llms-full.txt` — AI assistant readability (MANDATORY)

Every public site MUST expose `/llms.txt` (summary) and `/llms-full.txt` (full content dump). AI tools (Claude web, ChatGPT, Perplexity) check this before reading the site. Without it, they attempt to parse rendered HTML which includes hydration scripts, animation wrappers and component boilerplate — this is how "AI couldn't read the site" failures happen.

**For Next.js App Router** — create `app/llms.txt/route.ts` and `app/llms-full.txt/route.ts`:

```ts
// app/llms.txt/route.ts
import { NextResponse } from 'next/server'
import { services, faqs } from '@/lib/content'  // adapt to actual content source

export const dynamic = 'force-dynamic'

export function GET() {
  const body = [
    '# [Product Name]',
    '',
    '> [One-line description]',
    '',
    '[Full description paragraph]',
    '',
    '## Services / Features',
    '',
    // map from content source
    '## Key pages',
    '',
    '- [Home](https://[domain]/): ...',
    '- [About](https://[domain]/about): ...',
    '',
    `Full content: https://[domain]/llms-full.txt`,
  ].join('\n')

  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
```

**For Vite + TanStack Start** — create `src/routes/llms[.]txt.ts` and `src/routes/llms-full[.]txt.ts` as SSR GET handlers (same pattern as `sitemap[.]xml.ts`).

**llms.txt must include:** company name, one-line description, all services/features with prices, key page links with descriptions, contact details.

**llms-full.txt must include:** everything in llms.txt plus full service descriptions, all FAQs, how-it-works steps, full site map.

**Update `robots.txt`** to reference both files (see robots.txt section below).

---

## `public/robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://[productdomain].com/sitemap.xml

# AI assistant reading
# Summary: https://[productdomain].com/llms.txt
# Full content: https://[productdomain].com/llms-full.txt
```

Block auth and app routes from indexing:
```
Disallow: /dashboard
Disallow: /settings
Disallow: /auth
Disallow: /onboarding
```

---

## `public/sitemap.xml`

Generate at scaffold time with public routes only. Update before launch with real domain.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://[productdomain].com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://[productdomain].com/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## `public/site.webmanifest` — PWA manifest

```json
{
  "name": "[Product Name]",
  "short_name": "[Slug]",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Add these two tags to `index.html` `<head>` immediately after the favicon link:
```html
<link rel="manifest" href="/site.webmanifest" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```

Log NEEDS_HUMAN: "Add icon-192.png and icon-512.png to /public — use a square version of the product logo."

---

## Sentry Init (in `src/main.tsx`)

See `references/component-templates.md` for the full Sentry init block in `main.tsx`.

Add to `.env.example`:
```
VITE_SENTRY_DSN=https://...@sentry.io/...   # Get from Sentry project settings
```

Add to Vercel dashboard: `VITE_SENTRY_DSN`

**Package:** `npm install @sentry/react`

---

## SEO Rules

- `useSeo` hook MUST be called on every page
- Auth, settings, and onboarding pages MUST set `noIndex: true`
- `index.html` MUST include base OG + Twitter meta tags — replace placeholders during scaffold
- OG image URL must be absolute (not relative) for social sharing to work
- `public/site.webmanifest` MUST be generated at scaffold time
- `robots.txt` and `sitemap.xml` MUST be generated — update domain before launch
