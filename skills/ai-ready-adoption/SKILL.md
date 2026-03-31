# AI Adoption Analysis

## Skill Purpose
Deep-dive analysis of a company's current AI tool adoption across all departments. Maps every AI implementation detected, rates its maturity, and identifies underutilised capabilities in tools they already pay for.

## When to Use
- `/ai-ready adoption <company name>`
- Follow-up to `/ai-ready audit` for deeper adoption mapping

## How to Execute

### Step 1: Comprehensive Tool Detection
From website source, job postings, integration pages, and public documentation, identify every tool and platform. Categorise by department:

**Customer-Facing:** Chatbot platform, search engine, recommendation engine, personalisation, scheduling
**Marketing:** Email platform, social scheduler, content tools, SEO tools, analytics, ad platforms
**Sales:** CRM, proposal tools, lead scoring, outreach automation
**Operations:** Project management, workflow automation, document management, ERP
**HR/People:** ATS, onboarding, performance management, learning platforms
**Finance:** Accounting, invoicing, expense management, reporting

### Step 2: AI Feature Utilisation Assessment
For each detected tool, assess:
- Does this tool have AI features? (most modern SaaS does)
- Is there evidence the AI features are being used?
- What's the likely utilisation rate? (most companies use <20% of AI features in tools they pay for)

### Step 3: Generate Report
Save to `AI-ADOPTION-ANALYSIS.md` with:
- Complete tool inventory by department
- AI feature availability vs usage assessment
- "Hidden AI" opportunities (AI features in tools they already pay for)
- Recommended activations with estimated impact
- Tool consolidation opportunities
