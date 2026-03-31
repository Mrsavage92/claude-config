# Data Readiness Assessment

## Skill Purpose
Assess a company's data maturity from publicly observable signals. Evaluates data collection, structure, usage, and privacy compliance as foundations for AI implementation.

## When to Use
- `/ai-ready data <company name>`
- Follow-up to `/ai-ready audit` when Data Readiness score is below 50

## How to Execute

### Step 1: Data Collection Audit
From the website, identify all visible data collection points:
- Forms (contact, signup, booking, enquiry, feedback)
- Account creation requirements
- Cookie consent and tracking
- Email capture mechanisms
- Transaction/purchase data collection
- Review/feedback collection
- Loyalty program data
- App downloads (mobile data collection)

### Step 2: Data Usage Evidence
Check for signs that collected data is being used:
- Personalised content or recommendations?
- Segmented email communications?
- Dynamic pricing or offers?
- Retargeting (Facebook Pixel, Google remarketing)?
- Analytics dashboards or reporting visible?

### Step 3: Privacy & Compliance
Assess data governance readiness:
- Privacy policy present and current?
- Cookie consent mechanism?
- Data handling described?
- GDPR/Australian Privacy Principles signals?
- Data retention policy mentioned?

### Step 4: AI Data Readiness Score
AI needs data. Assess whether the company has:
- **Volume:** Enough data to train/fine-tune models?
- **Structure:** Data in usable formats (CRM, database) vs unstructured (emails, PDFs)?
- **Quality:** Clean, consistent, deduplicated?
- **Accessibility:** Connected systems or siloed?
- **Consent:** Can they use their data for AI purposes?

### Step 5: Generate Report
Save to `DATA-READINESS.md` with data collection inventory, usage assessment, privacy audit, AI data readiness score, and recommendations for closing data gaps.
