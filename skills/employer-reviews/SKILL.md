# Employer Review Platform Analysis & Strategy

## Skill Purpose
Deep-dive analysis of a company's employee review presence across Glassdoor, Indeed, Seek, and Google. Produces a review management strategy with response templates, generation tactics, and sentiment analysis.

## When to Use
- `/employer reviews <company name>`
- Follow-up to `/employer audit` when Review Reputation score is below 60
- When a client has a Glassdoor/Indeed problem

## How to Execute

### Step 1: Multi-Platform Scan
Search for the company on every major review platform:
1. `[company] Glassdoor reviews`
2. `[company] Indeed reviews`
3. `[company] Seek reviews` (AU)
4. `working at [company] reviews`

For each platform, extract: rating, count, recommend %, CEO approval, breakdown scores, 5 recent reviews (noting pros/cons themes), response pattern.

### Step 2: Sentiment Analysis
From all reviews, identify:
- Top 3 "Pros" themes (what employees consistently praise)
- Top 3 "Cons" themes (recurring complaints)
- Interview experience themes (if available)
- Trend direction: improving, stable, or declining over last 12 months?

### Step 3: Response Audit
- What % of reviews get a response?
- Average response time?
- Response quality: generic vs personalised?
- Tone: defensive, appreciative, empathetic?
- Do they respond to negative reviews differently than positive?

### Step 4: Generate Strategy Document
Save to `REVIEW-STRATEGY.md` with:
- Platform overview table
- Sentiment analysis
- Response audit findings
- Review generation playbook (internal communications, exit process, milestone prompts)
- Response templates (5-star, 4-star, 3-star, negative, interview)
- Monitoring setup recommendations

**Review Response Templates (include all of these):**

**5-Star Response:** Thank personally, reference specifics, reinforce culture.
**4-Star Response:** Thank, acknowledge what worked, ask what would make it 5 stars.
**3-Star Response:** Thank, empathise with gaps, demonstrate action being taken.
**Negative Response:** Empathise first, never get defensive, offer offline conversation, keep under 100 words.
**Interview Review Response:** Thank for their time, address process feedback, invite them to stay connected.

**Key rules for responses:**
- Never argue or get defensive
- Never reveal employee identity or private information
- Never use generic copy-paste responses
- Always acknowledge specific issues raised
- Respond within 48 hours
- Keep responses under 100 words
