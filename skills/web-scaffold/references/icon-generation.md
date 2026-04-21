# Icon Generation — web-scaffold

App icons and OG images are AI-generated using the `ai-image-generation` skill protocol.

## When to Generate

Run at scaffold time or after design brief is confirmed. You need:
- Product name
- Signature color (HSL from design brief)
- Tone (enterprise / expressive / playful / premium)

## Required Outputs

| File | Size | Use |
|------|------|-----|
| `public/icon-192.png` | 192×192 | PWA home screen icon |
| `public/icon-512.png` | 512×512 | PWA splash / store listing |
| `public/og-image.png` | 1200×630 | Social share / OG meta tag |
| `public/favicon.ico` | 32×32 | Browser tab |

## Prompt Protocol

Use the `ai-image-generation` skill. Pass these parameters:

**App icon prompt (192 + 512):**
```
A clean, minimal app icon for [Product Name]. [Tone descriptor: Professional geometric / Expressive colorful / Bold typographic]. Signature color: [HSL value as hex approximation]. Square format, rounded corners, no text, no gradients that clash, transparent or solid [dark/light] background. Modern SaaS aesthetic.
```

**OG image prompt (1200×630):**
```
A social media preview card for [Product Name]. [One-sentence product description]. Clean layout, [signature color] accent, dark/light background matching the app. Product name in the center or left-aligned. Minimal, professional. No stock photos.
```

## Post-Generation Steps

1. Save generated icons to `public/` as the filenames above.
2. Confirm `public/site.webmanifest` references `icon-192.png` and `icon-512.png` (generated in SEO setup step).
3. Confirm `index.html` has:
   ```html
   <link rel="icon" type="image/x-icon" href="/favicon.ico" />
   <link rel="apple-touch-icon" href="/icon-192.png" />
   <link rel="manifest" href="/site.webmanifest" />
   ```
4. Confirm OG image URL in `index.html` head:
   ```html
   <meta property="og:image" content="[ProductURL]/og-image.png" />
   ```

## Rules

- Never use placeholder gradient blobs as icons — generate real ones or log NEEDS_HUMAN
- If AI generation is unavailable: log `NEEDS_HUMAN: Add icon-192.png, icon-512.png, og-image.png to /public`
- OG image must be an absolute URL (not a relative path) for social sharing to work
- Regenerate OG image if product name or tagline changes before launch
