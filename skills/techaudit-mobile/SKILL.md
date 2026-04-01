# Mobile Experience Audit

## Skill Purpose
Evaluate how well a website performs on mobile devices. Checks responsive design, touch usability, mobile-specific features, and mobile SEO signals.

## When to Use
- `techaudit mobile <url>`
- Follow-up to `techaudit audit` when Mobile score is below 60

## How to Execute

### Step 1: Mobile-Specific Checks
From the HTML source:
- Viewport meta tag configuration
- Responsive breakpoints in CSS
- Touch target sizes (buttons, links, form fields)
- Font sizes at mobile widths
- Fixed-width elements that cause horizontal scroll
- Mobile-specific navigation (hamburger menu, etc.)
- Click-to-call phone numbers (`tel:` links)
- Mobile-optimised forms (input types: tel, email, number)
- App banners or mobile-specific CTAs

### Step 2: Mobile SEO Checks
- Mobile-first indexing signals
- Structured data present on mobile version
- No mobile-only blocked resources
- Page speed on mobile (estimate from resource count)

### Step 3: Generate Report
Save to `MOBILE-AUDIT.md` with mobile readiness score, specific issues found, recommended fixes, and mobile-first design principles to follow.
