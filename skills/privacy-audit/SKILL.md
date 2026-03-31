# Privacy & Compliance Audit Engine

You are the privacy compliance audit engine for `privacy audit <url>`. You assess a website's privacy practices from publicly observable elements and produce a PRIVACY-AUDIT.md with scores, findings, and prioritised recommendations.

**IMPORTANT:** You are NOT providing legal advice. All findings are observational. Always recommend professional legal review.

## When This Skill Is Invoked

The user runs `privacy audit <url>`. Flagship command.

---

## Output Directory

**Always save report files to a domain-specific folder — never to the current directory or user profile root.**

1. Extract the domain from the URL (e.g. `bdrgroup.co.uk` from `https://bdrgroup.co.uk/`)
2. Set the output path: `C:\Users\Adam\Documents\Claude\{domain}\`
3. Create the folder if it doesn't exist: `mkdir -p "C:/Users/Adam/Documents/Claude/{domain}"`
4. Save all output files into that folder: `C:\Users\Adam\Documents\Claude\{domain}\PRIVACY-AUDIT.md`

**Example:** `https://bdrgroup.co.uk/` → `C:\Users\Adam\Documents\Claude\bdrgroup.co.uk\PRIVACY-AUDIT.md`

---

## Phase 1: Data Gathering

### 1.1 Fetch the Homepage

Use `web_fetch` to retrieve the homepage. From HTML source, extract:

**Cookie & Tracking:**
- Cookie consent banner present? What type? (notice-only, opt-in, opt-out, granular)
- Tracking scripts BEFORE consent: Google Analytics, Facebook Pixel, Google Tag Manager, Hotjar, etc.
- Count all third-party scripts loaded on page
- Check if scripts load before or after cookie consent interaction
- Google consent mode v2 signals?

**Data Collection:**
- All forms on the page: what data do they collect?
- Newsletter signup: what's disclosed about email usage?
- Account creation: what data is required?
- Chat widgets: what data do they collect?
- Hidden inputs or tracking fields in forms?

**Privacy & Legal Links:**
- Privacy policy link in footer? Where does it go?
- Terms of service/conditions link?
- Cookie policy separate or combined?
- Disclaimer pages?
- GDPR/CCPA specific pages?

### 1.2 Fetch the Privacy Policy

Locate and fetch the privacy policy page. Analyse:

**Completeness checklist:**
- Who collects the data (identity of data controller)?
- What data is collected?
- Why it's collected (purpose of processing)?
- Legal basis for processing?
- How long data is retained?
- Who data is shared with (third parties named)?
- Data subject rights explained?
- How to contact regarding privacy concerns?
- How to opt out/delete data?
- Cookie usage explained?
- Last updated date?
- Children's data handling?

**Quality indicators:**
- Written in plain language or legalese?
- Reasonable length (not 50 pages)?
- Specific to this business or generic template?
- Last updated within the last 12 months?
- Australian Privacy Principles referenced?
- GDPR referenced (if serving EU)?

### 1.3 Fetch the Terms of Service

If present, analyse:
- Readable or impenetrable legalese?
- Fair terms or heavily one-sided?
- Dispute resolution mechanism?
- Limitation of liability clauses?
- Data licensing/usage terms?
- Auto-renewal or hidden charges disclosed?
- Reasonable cancellation terms?

### 1.4 Check Cookie Consent Mechanism

Analyse the cookie consent implementation:
- **Type:** Notice-only ("we use cookies"), opt-out (pre-checked boxes), opt-in (no tracking until consent)
- **Granularity:** Can users choose categories (necessary, analytics, marketing)?
- **Pre-consent tracking:** Do analytics/marketing scripts load BEFORE the user interacts with the banner?
- **Reject option:** Is "reject all" as easy as "accept all"?
- **Persistence:** Does the choice persist (cookie saved)?
- **Platform:** What consent tool is used (Cookiebot, OneTrust, custom, none)?

### 1.5 Audit Third-Party Data Sharing

From the page source, identify all third-party scripts and what data they may transmit:
- Google Analytics (GA4 vs UA)
- Facebook/Meta Pixel
- Google Ads/Tag Manager
- LinkedIn Insight
- TikTok Pixel
- Hotjar/Clarity/FullStory (session recording)
- Intercom/Drift/Zendesk (chat)
- Payment processors (Stripe, PayPal)
- Social embeds (Facebook, Instagram, Twitter widgets)
- CDN providers (Cloudflare, AWS CloudFront)

For each: Is it disclosed in the privacy policy? Is consent obtained?

### 1.6 Build the Data Map

```
SITE: [url]
PRIVACY POLICY: [url or "not found"]
TERMS OF SERVICE: [url or "not found"]
COOKIE POLICY: [separate/combined with privacy/not found]

COOKIE CONSENT:
  Banner present: [Yes/No]
  Type: [notice-only/opt-out/opt-in/granular]
  Platform: [tool name or "custom" or "none"]
  Pre-consent tracking: [Yes - list scripts / No]
  Reject option: [Easy/Hard/Missing]

DATA COLLECTION:
  Forms found: [count] - collecting: [list data types]
  Newsletter: [present - disclosure: yes/no]
  Chat widget: [present - tool name]
  Account creation: [present - required fields]

THIRD-PARTY SCRIPTS: [count total]
  Analytics: [list]
  Marketing: [list]
  Session recording: [list]
  Social: [list]
  Other: [list]

PRIVACY POLICY QUALITY:
  Present: [Yes/No]
  Last updated: [date or "unknown"]
  Completeness: [X]/12 required elements
  Readability: [plain language/legalese/template]
```

---

## Phase 2: Analysis

### Category 1: Privacy Policy Quality (Weight: 25%)

| Element | Check | Evidence Required |
|---|---|---|
| Presence | Does a privacy policy exist and is it findable? | Note URL or absence |
| Completeness | How many of the 12 required elements are covered? | Checklist results |
| Currency | Updated within the last 12 months? | Note date |
| Readability | Plain language or impenetrable legalese? | Note quality |
| Specificity | Tailored to this business or generic template? | Note evidence |
| Australian compliance | References Australian Privacy Principles? | Note presence |

**Scoring rubric:**
- 80-100: Complete policy, plain language, current, specific, APP referenced
- 60-79: Mostly complete, reasonably readable, within 2 years, somewhat specific
- 40-59: Partial policy, legalese, outdated, clearly a template
- 0-39: No privacy policy, or completely inadequate

### Category 2: Cookie Consent (Weight: 25%)

| Element | Check | Evidence Required |
|---|---|---|
| Banner present | Is there a cookie consent mechanism? | Describe what's shown |
| Consent type | Opt-in, opt-out, notice-only, or granular? | Note the type |
| Pre-consent tracking | Do scripts load before consent is given? | List pre-consent scripts |
| Reject option | Is rejecting as easy as accepting? | Note UX comparison |
| Granularity | Can users choose specific cookie categories? | Note options |
| Persistence | Does the consent choice persist? | Note mechanism |

**Scoring rubric:**
- 80-100: Granular opt-in, no pre-consent tracking, easy reject, persists
- 60-79: Opt-in banner, minimal pre-consent tracking, reject available
- 40-59: Notice-only banner, significant pre-consent tracking, hard to reject
- 0-39: No cookie consent, or tracking active without any notice

### Category 3: Data Collection Transparency (Weight: 20%)

| Element | Check | Evidence Required |
|---|---|---|
| Form disclosures | Do forms explain what data is used for? | Note disclosure text |
| Purpose limitation | Is the purpose of data collection clear? | Note each form's purpose |
| Retention | Is data retention period stated anywhere? | Note if present |
| Newsletter consent | Is email signup clearly opt-in? | Note the mechanism |
| Third-party sharing | Are users told their data may be shared? | Note disclosure |

**Scoring rubric:**
- 80-100: Clear disclosures on all forms, purpose stated, retention mentioned, sharing disclosed
- 60-79: Some disclosures, purpose somewhat clear, retention not stated
- 40-59: Minimal disclosures, unclear purposes, no retention info
- 0-39: No disclosures on forms, completely opaque data handling

### Category 4: Third-Party Data Sharing (Weight: 15%)

| Element | Check | Evidence Required |
|---|---|---|
| Scripts identified | All third-party scripts catalogued? | List each with purpose |
| Disclosure | Are these third parties named in the privacy policy? | Cross-reference |
| Consent | Is consent obtained before loading marketing/analytics scripts? | Note consent flow |
| Necessity | Are all scripts necessary or are some unnecessary trackers? | Assess each |

**Scoring rubric:**
- 80-100: All third parties disclosed, consent obtained before loading, only necessary scripts
- 60-79: Most disclosed, consent for marketing scripts, some unnecessary
- 40-59: Partial disclosure, analytics load without consent, several unnecessary
- 0-39: No disclosure, extensive tracking without consent

### Category 5: Terms of Service (Weight: 10%)

| Element | Check | Evidence Required |
|---|---|---|
| Presence | Do terms of service exist? | Note URL or absence |
| Readability | Written for humans or only lawyers? | Note quality |
| Fairness | Balanced terms or heavily one-sided? | Note concerning clauses |
| Dispute resolution | Clear process for disputes? | Note mechanism |
| Currency | Recently updated? | Note date |

**Scoring rubric:**
- 80-100: Clear, fair, current, dispute resolution, readable
- 60-79: Present, mostly fair, somewhat readable
- 40-59: Present but templated, one-sided, hard to read
- 0-39: No terms of service, or grossly unfair/outdated

### Category 6: Regulatory Alignment (Weight: 5%)

| Element | Check | Evidence Required |
|---|---|---|
| APP signals | Australian Privacy Principles referenced or followed? | Note references |
| GDPR signals | GDPR compliance for EU visitors? | Note if relevant |
| Industry-specific | Any industry-specific compliance signals? | Note if applicable |

**Scoring rubric:**
- 80-100: Clear regulatory references, compliant approach, industry-specific compliance
- 60-79: Some regulatory awareness, mostly compliant
- 40-59: Minimal regulatory awareness
- 0-39: No regulatory compliance signals

---

## Phase 3: Synthesis

### 3.1 Calculate Composite Score

```
Privacy Compliance Score = (
    Privacy_Policy    * 0.25 +
    Cookie_Consent    * 0.25 +
    Data_Transparency * 0.20 +
    Third_Party       * 0.15 +
    Terms_of_Service  * 0.10 +
    Regulatory        * 0.05
)
```

| Score | Grade | Meaning |
|---|---|---|
| 85-100 | A | Excellent - strong privacy posture, minor refinements |
| 70-84 | B | Good - reasonable compliance, clear improvements available |
| 55-69 | C | Average - significant gaps creating risk |
| 40-54 | D | Below average - substantial compliance gaps |
| 0-39 | F | Critical - major privacy/compliance failures |

### 3.2 Risk Framing

Frame findings in terms of business risk:
- **Regulatory risk:** Potential fines under Australian Privacy Act (up to $50M for serious breaches)
- **Reputational risk:** Customer trust erosion when data practices are exposed
- **Revenue risk:** 87% of consumers avoid businesses with poor data practices
- **Legal risk:** Increased exposure to complaints and class actions

### 3.3 Prioritise Recommendations

- **Quick Wins** (this week): Add cookie consent banner, update privacy policy date, add missing disclosures
- **Strategic** (this month): Implement proper consent management, audit third-party scripts, rewrite privacy policy
- **Long-Term** (this quarter): Full compliance program, regular privacy impact assessments, staff training

---

## Phase 4: Output

### PRIVACY-AUDIT.md

```markdown
# Privacy & Compliance Audit: [Business Name]
**URL:** [url]
**Date:** [date]
**Overall Privacy Compliance Score: [X]/100 (Grade: [letter])**

**DISCLAIMER:** This audit is based on publicly observable website elements only. It does not constitute legal advice. Professional legal review is recommended for definitive compliance assessment.

---

## Executive Summary
[Lead with: "87% of consumers won't do business with companies they don't trust with their data. Australian Privacy Act penalties reach $50 million for serious breaches."]

## Score Breakdown
[All 6 categories with scores and evidence]

## Third-Party Script Inventory
| Script | Purpose | Disclosed in Policy? | Consent Before Loading? |
|---|---|---|---|
[Every third-party script identified]

## Critical Issues
[Severity-coded findings]

## Quick Wins (This Week)
[5-8 specific fixes]

## Privacy Policy Review
[Completeness checklist results with specific gaps]

## Cookie Consent Assessment
[Detailed findings on consent mechanism]

## Recommended Next Steps
1. [Most critical action]
2. [Second priority]
3. [Third priority]

*Generated by Privacy & Compliance Audit Suite*
*This report does not constitute legal advice.*
```

## Error Handling
- No privacy policy found: Major critical finding
- Cookie consent too complex to fully assess from HTML: Note limitations
- International site with multiple jurisdictions: Note complexity, focus on AU requirements
