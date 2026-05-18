---
name: reputation-response
description: Build a complete review response strategy with templates, escalation procedures, tone guidelines, and platform-specific instructions. Produces a RESPONSE-STRATEGY.md that any team member can follow.
---

# Review Response Strategy

## Skill Purpose
Build a complete review response strategy with templates, escalation procedures, and tone guidelines. Produces a RESPONSE-STRATEGY.md that any team member can follow to respond consistently across all review platforms.

## When to Use
- `/reputation response <business name>`
- Follow-up to `/reputation audit` when Response Management score is below 60
- User wants review response templates for their team

## How to Execute

### Step 1: Current Response Audit
Check how the business currently responds (if at all) across all platforms. Identify patterns, tone issues, and gaps.

Search for the business on:
- Google Reviews
- Facebook Reviews
- Yelp
- Industry-specific platforms (TripAdvisor, Trustpilot, ProductHunt, G2, etc.)

Note: response rate, average response time, tone consistency, and whether negative reviews are addressed.

### Step 2: Build Response Templates
Generate customised templates for each scenario:

**5-star reviews:**
- Thank personally, reference specifics from their review, reinforce what they loved
- Goal: make the reviewer feel seen, encourage repeat business

**4-star reviews:**
- Thank, acknowledge what worked, gently ask what could improve
- Goal: show you care about perfection, gather improvement feedback

**3-star reviews:**
- Empathise, acknowledge gaps honestly, describe what you're doing about it
- Goal: demonstrate accountability and active improvement

**Negative reviews (1-2 stars):**
- Empathise first, never get defensive, take it offline with a direct contact
- Goal: de-escalate publicly, resolve privately, then ask for update

**Fake/spam reviews:**
- Flag for removal on the platform, brief professional response noting the review doesn't match records
- Goal: signal to other readers this isn't genuine without being combative

**Service recovery follow-up:**
- After resolving an issue, follow up with a template asking if they'd update their review
- Goal: convert detractors into advocates

### Step 3: Tone Guide
Define the brand's review response voice with 5 pillars:
1. **Warm** — use the reviewer's name, reference specifics
2. **Professional** — no slang, no excuses, no blame
3. **Direct** — get to the point, don't pad with filler
4. **Empathetic** — acknowledge feelings before offering solutions
5. **Action-oriented** — every response includes a next step

Include 3 "never do" rules:
- Never argue publicly
- Never offer compensation in a public reply (do it privately)
- Never use copy-paste identical responses

### Step 4: Escalation Process
Define when and how to escalate:

| Trigger | Action | Owner |
|---|---|---|
| Legal threat in review | Do not respond publicly, escalate to legal | Management |
| Allegation of harm/safety | Respond within 2 hours, investigate immediately | Senior management |
| Repeated negative pattern (3+ similar complaints) | Root cause analysis, process change | Operations |
| Media/influencer complaint | Escalate to PR/marketing before responding | Marketing |

### Step 5: Response Time Targets

| Platform | Target Response Time |
|---|---|
| Google Reviews | Within 24 hours |
| Facebook | Within 12 hours |
| Yelp | Within 48 hours |
| Trustpilot / G2 | Within 48 hours |
| Negative reviews (any platform) | Within 4 hours during business hours |

### Step 6: Generate Report
Save to `RESPONSE-STRATEGY.md` in the domain output directory (`~/Documents/Claude/{domain}/`) with:
- Current response audit findings
- All response templates (copy-paste ready)
- Tone guide with examples
- Escalation matrix
- Response time targets
- Platform-by-platform instructions (where to find reviews, how to respond, character limits)

## Output Standards
- Templates must be ready to copy-paste with `[BRACKET]` placeholders for personalisation
- Include 2 example responses per template (one short, one detailed)
- Tone guide should include before/after examples showing wrong vs right tone
