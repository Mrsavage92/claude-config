# Review Management Strategy & Response System

## Skill Purpose
Build a complete review management strategy for a business: audit their current review landscape across all platforms, create response templates, design a review generation system, and produce an actionable playbook. This is one of the highest-ROI services for local businesses.

## When to Use
- User runs `/market reviews <url>` or `/market reviews <business name>`
- User asks about review management, reputation management, or online reviews
- As a follow-up to `/market audit` when Brand & Trust score is below 60
- When a client has a review problem (low ratings, negative reviews, low volume)

## How to Execute

### Step 1: Multi-Platform Review Audit

Search for the business across all relevant platforms. Run these searches:

1. `[business name] [location] reviews`
2. `[business name] Google reviews`
3. `[business name] TripAdvisor` (hospitality)
4. `[business name] OpenTable` (restaurants)
5. `[business name] ProductReview` (Australian businesses)
6. `[business name] Yelp` (if applicable)
7. `[business name] Facebook reviews`

**For each platform found, record:**

| Platform | Rating | Count | Last Review | Owner Responds? | Sentiment |
|---|---|---|---|---|---|
| Google | X.X/5 | XXX | [date] | Yes/No/Sometimes | Pos/Mixed/Neg |
| TripAdvisor | X.X/5 | XXX | [date] | Yes/No/Sometimes | Pos/Mixed/Neg |
| OpenTable | X.X/5 | XXX | [date] | Yes/No/Sometimes | Pos/Mixed/Neg |
| Facebook | X.X/5 | XXX | [date] | Yes/No/Sometimes | Pos/Mixed/Neg |

### Step 2: Sentiment Analysis

From visible reviews, identify:

**Top 3 Positive Themes** (what customers love):
- e.g., "Food quality", "Friendly staff", "Great atmosphere"

**Top 3 Negative Themes** (recurring complaints):
- e.g., "Slow service", "Booking issues", "Noise level"

**Reputation Gap:** Compare the best platform rating to the worst. A gap of 1.0+ stars indicates inconsistent experience or unmanaged platforms.

### Step 3: Response Audit

For the most visible platform (usually Google), assess:
- What % of reviews get an owner response?
- Average response time (same day, same week, or never?)
- Response quality: generic ("Thanks for your review!") or personalised?
- Do they respond to negative reviews? How?
- Do responses escalate or de-escalate?

### Step 4: Generate the Strategy Document

Save to `REVIEW-STRATEGY.md`:

```markdown
# Review Management Strategy: [Business Name]
**Date:** [date]
**Current Reputation Score: [X]/100**

## Platform Overview

| Platform | Rating | Reviews | Responding? | Priority |
|---|---|---|---|---|
| [platform] | [rating] | [count] | [yes/no] | [High/Med/Low] |

## Sentiment Summary

**What Customers Love:**
1. [theme] - mentioned in [X]% of positive reviews
2. [theme]
3. [theme]

**Recurring Complaints:**
1. [theme] - mentioned in [X]% of negative reviews
2. [theme]
3. [theme]

**Reputation Gap:** [X.X] stars between best and worst platform

## Recommended Actions

### Immediate (This Week)

1. **Respond to all unanswered reviews** on [priority platform]
   - Start with the most recent 20 reviews
   - Use the response templates below
   - Aim for same-day response on new reviews going forward

2. **Claim and verify all profiles** - ensure ownership of:
   - [ ] Google Business Profile
   - [ ] TripAdvisor
   - [ ] OpenTable (if applicable)
   - [ ] Facebook Page

3. **Fix any incorrect information** across platforms (hours, phone, address)

### This Month

4. **Launch review generation system:**
   - Print QR code table/counter cards linking to Google review page
   - Train staff on when and how to ask (see script below)
   - Set up post-visit email/SMS if customer data is collected
   - Target: [X] new Google reviews per month

5. **Address the top negative theme operationally:**
   - [Specific recommendation based on complaint pattern]

### Ongoing

6. **Daily review monitoring** (set up Google Alerts for "[business name]")
7. **Respond to every review within 24 hours**
8. **Monthly review report** tracking volume, rating trend, and sentiment

## Review Response Templates

### 5-Star Review Response
Personalise each one. Reference something specific from their review.

> "Thank you [Name]! We're so glad you enjoyed [specific thing they mentioned]. [Personal touch or invite back]. We hope to see you again soon!"

Example:
> "Thank you Sarah! We're so glad you loved the rump steak and the atmosphere on the terrace. Our kitchen team takes real pride in those $15 classics. We'd love to have you back - live music is on this Saturday if you're free!"

### 4-Star Review Response
Thank them and gently ask what would make it 5 stars.

> "Thanks for the great feedback, [Name]! We're happy you had a good time. If there's anything that would have made it a 5-star experience, we'd love to hear - we're always looking to improve. Hope to see you again!"

### 3-Star Review Response
Acknowledge, empathise, invite dialogue.

> "Hi [Name], thanks for sharing your experience. We're glad some things worked well, but sorry we didn't quite hit the mark on [specific issue if mentioned]. We'd love the chance to do better next time - feel free to reach out to us at [email] with any suggestions."

### 2-Star or 1-Star Review Response
Empathise first. Never get defensive. Take it offline.

> "Hi [Name], we're really sorry to hear about your experience, especially [specific issue]. This isn't the standard we hold ourselves to. We'd genuinely appreciate the chance to discuss this further and make it right. Could you please contact us at [email/phone]? Thank you for letting us know."

**CRITICAL RULES for negative review responses:**
- Never argue, blame, or get defensive
- Never reveal private customer information
- Never offer compensation publicly (do it privately)
- Never use generic copy-paste responses
- Always acknowledge the specific issue
- Always offer a path to resolution
- Keep it under 100 words

### Fake/Spam Review Response
If you believe a review is fake or from someone who never visited:

> "Hi, we take all feedback seriously, but we're unable to find a record of your visit. If you did visit us, please contact us at [email] so we can look into this. If not, we'd ask you to reconsider this review as it may be intended for a different business."

Then flag the review through the platform's reporting system.

## Review Generation Scripts

### For Staff (verbal, at point of service)
**When:** Customer has just complimented the food, said thanks enthusiastically, or is visibly happy
**Script:** "That's so great to hear! If you have a moment, we'd really appreciate a Google review - it honestly makes a huge difference for us. You can just search our name and it pops right up."

### For Post-Visit Email
**Subject:** Thanks for visiting [Business Name]!
**Body:**
"Hi [Name],

Thanks for dining with us [today/last night]! We hope you had a great time.

If you enjoyed your visit, we'd really appreciate a quick Google review - it takes less than a minute and helps other people find us.

[Leave a Review button/link]

Thanks again, and we hope to see you soon!

The [Business Name] Team"

### For QR Code Cards
**Text on card:**
"Enjoyed your visit? We'd love to hear about it!
Scan to leave a quick Google review
[QR CODE]
Thank you - it means the world to us."

## Monitoring Setup

Recommend the client set up:
1. **Google Alerts** for their business name
2. **Email notifications** on Google Business Profile for new reviews
3. **Weekly 15-minute review check** across all platforms
4. **Monthly review metrics tracking:**
   - New reviews this month (by platform)
   - Average rating this month vs last month
   - Response rate and average response time
   - Sentiment trend (improving, stable, declining)

*Generated by AI Marketing Suite - `/market reviews`*
```

## Scoring Rubric

| Score | Criteria |
|---|---|
| 85-100 | 4.5+ average across platforms, 100+ reviews, <24hr response time, all responded to |
| 70-84 | 4.0-4.4 average, 50+ reviews, responds to most, some gaps |
| 55-69 | 3.5-3.9 average, 20-49 reviews, inconsistent responses |
| 40-54 | 3.0-3.4 average or <20 reviews, rarely responds |
| 0-39 | <3.0 average, poor volume, no responses, or unclaimed profiles |
