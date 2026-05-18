# Automation Opportunity Mapping

## Skill Purpose
Map specific business processes that could be automated or augmented with AI. Produces a detailed process-by-process assessment with tool recommendations, time savings estimates, and implementation complexity.

## When to Use
- `/ai-ready automation <company name>`
- Follow-up to `/ai-ready audit` when Automation Opportunity score is high (lots of potential)

## How to Execute

### Step 1: Process Discovery
From the website, job postings, and service descriptions, identify visible business processes:

**Customer-facing processes:**
- Enquiry handling (form, phone, email, chat)
- Booking/scheduling
- Order processing
- Customer support/FAQ
- Onboarding new customers
- Review/feedback collection

**Internal processes (inferred from job postings):**
- Recruitment and hiring
- Employee onboarding
- Reporting and analytics
- Content creation
- Social media management
- Invoice processing
- Inventory management

### Step 2: Automation Assessment Matrix
For each process, evaluate:

| Process | Current State | AI Tool | Complexity | Time Saved | Monthly Cost |
|---|---|---|---|---|---|
| [process] | [manual/semi/auto] | [specific tool] | [Low/Med/High] | [hrs/week] | [$X] |

**Complexity levels:**
- Low: Install a tool, configure, go. No technical skills needed. (1-3 days)
- Medium: Requires some integration or customisation. (1-2 weeks)
- High: Requires development, data migration, or significant change management. (1-3 months)

### Step 3: Priority Matrix
Plot each opportunity on Impact vs Effort:
- **Quick Wins:** High impact, low effort (implement first)
- **Strategic Projects:** High impact, high effort (plan and resource)
- **Fill-ins:** Low impact, low effort (do when convenient)
- **Deprioritise:** Low impact, high effort (skip for now)

### Step 4: Generate Report
Save to `AUTOMATION-OPPORTUNITIES.md` with full process map, automation matrix, priority matrix, 30/60/90 day implementation plan, and total projected ROI.
