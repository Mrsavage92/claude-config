# Handle Variant Generator

Use in Phase 1.2 when raw-HTML curl returns no social links and the brand name is known. Generate these variants systematically and probe each one.

---

## Algorithm

Given brand name `{NAME}` (e.g. "Gloss Beauty by Louise"):

### Step 1: Normalise
```
slug = NAME.lower()
       .replace(" by ", ".")    // "gloss beauty.louise"
       .replace(" ", "")         // "glossbeauty.louise" or "glossbeauty"
       .replace("&", "and")
       .replace("+", "and")
no_dot = slug.replace(".", "")  // "glossbeautylouise" or "glossbeauty"
short = first 2 words only      // "glossbeauty"
```

### Step 2: Generate variant list (test in this order)
```
1. {slug}                       @glossbeauty.bylouise   ← most common: exact brand
2. {no_dot}                     @glossbeautybylouise
3. {short}                      @glossbeauty
4. {short}.au                   @glossbeauty.au
5. {short}_{country}            @glossbeauty_au
6. {short}.official             @glossbeauty.official
7. {slug}1 / {slug}_            @glossbeauty.bylouise1  ← FB numeric suffix pattern
8. {first_word}by{last_word}    @glossbylouise
9. the.{slug}                   @the.glossbeauty
10. {short}.brand               @glossbeauty.brand
```

### Step 3: Probe each variant (bash loop)
```bash
BRAND_HANDLE="glossbeauty.bylouise"
VARIANTS=("glossbeauty.bylouise" "glossbeautybylouise" "glossbeauty" "glossbeauty.au" "glossbeauty_au" "glossbeauty.official" "glossbeautybylouise1")

for h in "${VARIANTS[@]}"; do
  STATUS=$(curl -sIL -A "facebookexternalhit/1.1" "https://www.instagram.com/$h/" \
    | head -1 | awk '{print $2}')
  echo "IG @$h → HTTP $STATUS"
  sleep 0.5
done
```

HTTP 200 = profile exists. HTTP 302 (to login) = exists but requires auth. HTTP 404 = doesn't exist.

Repeat for TikTok (`https://www.tiktok.com/@{h}`) and Pinterest (`https://www.pinterest.com/{h}/`).

### Step 4: For found handles, run OG meta extraction
```bash
curl -sL -A "facebookexternalhit/1.1" "https://www.instagram.com/{handle}/" \
  | grep -oiE 'og:description[^>]{0,300}'
```

---

## Industry-specific handle patterns

| Industry | Common pattern | Example |
|---|---|---|
| Solo service (beauty, fitness) | `{name}.by{artist}` or `{name}_{location}` | `glossbeauty.bylouise`, `hairby_sarah` |
| Agency/studio | `{brand}hq`, `{brand}studio`, `{brand}media` | `dentalhq`, `lumenstudio` |
| E-commerce DTC | `{brand}`, `{brand}au`, `{brand}official` | `gymsharkau` |
| Local business | `{brand}.{suburb}`, `{brand}{suburb}` | `glossbeauty.noosa` |
| B2B SaaS | `{brand}`, `{brand}app`, `{brand}hq` | `canvaapp`, `notionhq` |

---

## Facebook-specific patterns

Facebook pages often have a numeric suffix when the clean handle is taken. Common patterns:
- `{handle}1`, `{handle}2`
- `{handle}.official`
- `{handle}.page`
- `{handle}-{country}` (`glossbeauty-au`)

Always check `/glossbeauty.bylouise1/` if `/glossbeauty.bylouise/` doesn't exist or doesn't match.

---

## Handle mismatch detection

After finding all active handles, check for inconsistency:

```bash
IG_HANDLE="glossbeauty.bylouise"
FB_HANDLE="glossbeauty.bylouise1"

if [ "$IG_HANDLE" != "$FB_HANDLE" ]; then
  echo "INCONSISTENCY: IG=$IG_HANDLE, FB=$FB_HANDLE — brand-consistency penalty applies"
fi
```

Flag numeric suffixes, underscores, or dot differences as a Brand Consistency finding. Recommend rectifying by requesting handle change on the minor platform.

---

## When to stop trying variants

Stop after the first 3 variants return HTTP 404 on the same platform — the brand likely has no presence there. Note this in Phase 1.9 Data Map as "Absent — X variants tested, none found".

Do NOT invent profiles. If not found after 5 variants → mark as Absent.
