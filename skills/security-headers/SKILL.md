---
name: security-headers
description: Deep analysis of HTTP security headers with specific implementation guidance for Apache, Nginx, Vercel, and Cloudflare. Identifies missing headers, weak configurations, and produces a prioritised hardening plan.
---

# HTTP Security Headers Analysis

## Skill Purpose
Deep analysis of HTTP security headers. Identifies missing headers, weak configurations, and produces specific implementation guidance for the site's platform. Output: HEADERS-AUDIT.md.

## When to Use
- `/security headers <url>`
- Follow-up to `/security audit` when Security Headers score is below 60
- User wants to harden their site's HTTP response headers

## How to Execute

### Step 1: Fetch and Check All Security Headers
From the fetched page response (headers and meta tags), check for each of these:

| # | Header | Purpose | Ideal Value |
|---|---|---|---|
| 1 | Content-Security-Policy (CSP) | Controls resource loading, prevents XSS | Strict policy with nonces or hashes |
| 2 | Strict-Transport-Security (HSTS) | Forces HTTPS | `max-age=31536000; includeSubDomains; preload` |
| 3 | X-Frame-Options | Prevents clickjacking | `DENY` or `SAMEORIGIN` |
| 4 | X-Content-Type-Options | Prevents MIME sniffing | `nosniff` |
| 5 | Referrer-Policy | Controls referrer info leakage | `strict-origin-when-cross-origin` or stricter |
| 6 | Permissions-Policy | Restricts browser APIs | Deny unused: camera, microphone, geolocation |
| 7 | Cross-Origin-Opener-Policy (COOP) | Isolates browsing context | `same-origin` |
| 8 | Cross-Origin-Resource-Policy (CORP) | Controls cross-origin resource loading | `same-origin` or `cross-origin` |
| 9 | Cross-Origin-Embedder-Policy (COEP) | Required for SharedArrayBuffer | `require-corp` |

### Step 2: Assess Each Header

For each header, record:
- **Status:** Present / Missing / Weak
- **Current value:** (quote if present)
- **Recommended value:** (specific to this site)
- **Risk if missing:** What attack it enables
- **Implementation priority:** Critical / High / Medium / Low

### Step 3: Scoring

| Score Range | Meaning |
|---|---|
| 80-100 | All critical headers present with strong values |
| 60-79 | Most headers present, some weak configurations |
| 40-59 | Several missing headers, significant exposure |
| 0-39 | Minimal headers, high vulnerability to common attacks |

**Weight distribution:**
- CSP: 30% (most impactful, hardest to implement)
- HSTS: 20% (critical for transport security)
- X-Frame-Options: 10%
- X-Content-Type-Options: 10%
- Referrer-Policy: 10%
- Permissions-Policy: 10%
- COOP/CORP/COEP: 10%

### Step 4: Platform-Specific Implementation
Detect the platform (check `server` header, `x-powered-by`, etc.) and provide implementation code for the right platform:

**Vercel** (`vercel.json`):
```json
{
  "headers": [
    { "source": "/(.*)", "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" }
    ]}
  ]
}
```

**Nginx** (`nginx.conf`):
```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
```

**Apache** (`.htaccess`):
```apache
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
```

**Cloudflare** (Transform Rules or Workers):
```
Provide Cloudflare-specific configuration
```

### Step 5: Generate Report
Save to `HEADERS-AUDIT.md` in the domain output directory (`~/Documents/Claude/{domain}/`) with:
- Header inventory table (header, status, current value, recommended value, priority)
- Overall Security Headers Score
- Platform-detected implementation code (copy-paste ready)
- Priority order for implementation
- Link to SecurityHeaders.com for verification after changes

## Output Standards
- Implementation code must be copy-paste ready for the detected platform
- Include a "verify your changes" section with curl commands or online checker URLs
- Flag the single most dangerous missing header prominently
