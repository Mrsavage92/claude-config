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

## `public/robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://[productdomain].com/sitemap.xml
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
