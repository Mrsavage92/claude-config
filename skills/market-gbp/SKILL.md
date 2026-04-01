# Google Business Profile Audit & Optimisation

## Skill Purpose
Audit a business's Google Business Profile (GBP) presence and produce an actionable optimisation report. For local businesses, GBP is often the single highest-impact marketing asset - it drives map pack visibility, review trust, and direct calls/bookings.

## When to Use
- User runs `/market gbp <business name>` or `/market gbp <business name> <location>`
- User asks about Google Business Profile, Google Maps listing, or local search presence
- As a follow-up to `/market audit` when the business is classified as Local Business, Hospitality, Trades, or Healthcare

## How to Execute

### Step 1: Find the Business on Google

Search for: `[business name] [location]`

From the search results and any knowledge panel, extract:
- Business name as it appears on Google
- Category (primary and secondary)
- Star rating and total review count
- Address, phone, website URL
- Hours of operation
- Whether the listing appears in the local map pack
- Photos count (if visible in search results)
- Google Posts presence (recent posts visible?)
- Q&A section (questions and answers present?)
- "Popular times" data (indicates verified/active listing)

### Step 2: Analyse Review Profile

Search for: `[business name] [location] reviews`

**Extract and analyse:**
- Total review count
- Average star rating
- Rating distribution if visible (how many 5s, 4s, 3s, etc.)
- 3-5 recent reviews: note themes (positive and negative)
- Owner response pattern: do they respond? How quickly? What tone?
- Review recency: when was the last review posted?
- Review velocity: roughly how many per month?

**Benchmark against industry:**

| Business Type | Good Review Count | Good Rating | Review Velocity |
|---|---|---|---|
| Restaurant/Pub | 200+ | 4.2+ | 10+/month |
| Trades/Services | 50+ | 4.5+ | 3+/month |
| Healthcare/Medical | 30+ | 4.3+ | 2+/month |
| Retail/E-commerce | 100+ | 4.0+ | 5+/month |
| Hospitality/Venue | 150+ | 4.0+ | 8+/month |

### Step 3: Assess Profile Completeness

Check for each element (mark as present, missing, or needs improvement):

**Essential (must have):**
- [ ] Accurate business name (matches real signage)
- [ ] Correct primary category
- [ ] Complete address
- [ ] Phone number
- [ ] Website URL
- [ ] Hours of operation (including special hours for holidays)
- [ ] Business description (750 char max, keyword-rich)

**Important (should have):**
- [ ] Secondary categories (up to 9 additional)
- [ ] Service area (for service-based businesses)
- [ ] Attributes (wheelchair accessible, outdoor seating, etc.)
- [ ] Menu link (for restaurants/pubs)
- [ ] Booking link (for restaurants, salons, etc.)
- [ ] Products/services listing
- [ ] Photos: exterior, interior, team, products/food (aim for 30+)

**Growth (nice to have):**
- [ ] Google Posts (weekly updates, offers, events)
- [ ] Q&A section (pre-populated with FAQs)
- [ ] Messaging enabled
- [ ] Short name/vanity URL claimed
- [ ] Logo and cover photo set

### Step 4: Local SEO Cross-Check

**NAP Consistency:**
Check that the Name, Address, Phone number match exactly between:
- Google Business Profile
- Website header/footer
- Website contact page
- Any other directories found (TripAdvisor, Yelp, Yellow Pages, True Local)

Note any inconsistencies - these hurt local ranking.

**Website-to-GBP alignment:**
- Does the website include the same location keywords as the GBP?
- Is there a Google Maps embed on the contact page?
- Does the website link back to the GBP or include a "Leave a Review" link?

### Step 5: Generate the Report

Save to `GBP-AUDIT.md`:

```markdown
# Google Business Profile Audit: [Business Name]
**Location:** [address]
**Date:** [date]
**GBP Score: [X]/100**

## Current Profile Status

| Element | Status | Notes |
|---|---|---|
| Business Name | [Correct/Incorrect] | [notes] |
| Primary Category | [category] | [optimal?] |
| Rating | [X.X]/5 ([count] reviews) | [benchmark comparison] |
| Hours | [Complete/Incomplete] | [notes] |
| Description | [Present/Missing] | [word count, keywords] |
| Photos | [count] | [benchmark: 30+] |
| Posts | [Active/Inactive] | [last post date] |
| Q&A | [Present/Empty] | [notes] |

## Review Analysis

**Rating:** [X.X]/5 from [count] reviews
**Velocity:** ~[X] reviews/month
**Response Rate:** [X]% ([all/some/none] reviews get owner responses)
**Sentiment Themes:**
- Positive: [top 3 praised themes]
- Negative: [top 3 complaint themes]

## Recommendations

### Quick Wins (This Week)
1. [specific action]
2. [specific action]
3. [specific action]

### Ongoing Strategy
1. [specific action with frequency]
2. [specific action with frequency]

## Review Response Templates

### Positive Review Response (customise per review):
"Thank you so much for the kind words, [Name]! We're glad you enjoyed [specific thing they mentioned]. We'd love to welcome you back soon - [mention upcoming event/offer if relevant]."

### Negative Review Response (customise per review):
"Hi [Name], thank you for your feedback. We're sorry your experience didn't meet expectations, especially regarding [specific issue]. We'd appreciate the chance to make this right - please contact us at [email/phone] so we can discuss this directly."

### Neutral Review Response:
"Thanks for visiting us, [Name]! We appreciate you taking the time to share your experience. If there's anything we can do to earn a 5-star visit next time, we'd love to hear from you."

*Generated by AI Marketing Suite - `/market gbp`*
```

## Review Generation Strategy (include in report)

Provide a practical review generation playbook:

1. **Table cards/QR codes** - Print cards with a QR code linking directly to the Google review form. Place on tables, at checkout, or hand to customers at point of service.
2. **Post-visit email/SMS** - If you have customer email or phone, send a friendly request 2-24 hours after visit: "We loved having you! If you enjoyed your experience, a quick Google review would mean the world to us: [direct review link]"
3. **Staff training** - Train front-of-house staff to say: "If you enjoyed today, we'd really appreciate a Google review - it helps us a lot!" Timing matters: ask when the customer is visibly happy (after complimenting the food, after a successful event, etc.)
4. **Never incentivise** - Google prohibits offering discounts or rewards for reviews. Keep it genuine.
5. **Respond to every review** - Within 24-48 hours. Positive reviews get a personal thank-you. Negative reviews get empathy + resolution offer. This signals to Google (and future customers) that you care.

## Scoring Rubric

| Score | Criteria |
|---|---|
| 85-100 | Fully complete profile, 4.5+ rating, 100+ reviews, active posts, owner responses |
| 70-84 | Mostly complete, 4.0-4.4 rating, 50+ reviews, some posts |
| 55-69 | Basic profile, 3.5-3.9 rating or <50 reviews, no posts |
| 40-54 | Incomplete profile, <3.5 rating or <20 reviews, no responses |
| 0-39 | Very incomplete, poor rating, or no GBP claimed |
