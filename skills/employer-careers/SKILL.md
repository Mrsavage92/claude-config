# Careers Page CRO Analysis

## Skill Purpose
Comprehensive conversion rate optimisation audit of a company's careers/jobs page. Evaluates content quality, user experience, application flow, and conversion mechanics.

## When to Use
- `/employer careers <url>`
- Follow-up to `/employer audit` when Careers Page score is below 60

## How to Execute

### Step 1: Fetch and Analyse the Careers Page
Use `web_fetch` on the careers URL. If no URL provided, search `[company name] careers` and find it.

### Step 2: Score Against Best Practice Checklist

**Content (40 points):**
- [ ] Clear EVP headline (not "Join Our Team") [5pts]
- [ ] Specific benefits listed (not "competitive salary") [5pts]
- [ ] Real team/office photos (not stock) [5pts]
- [ ] Employee testimonials with names/photos [5pts]
- [ ] Culture/values section [5pts]
- [ ] DEI commitment content [5pts]
- [ ] Growth/development messaging [5pts]
- [ ] "Day in the life" or role spotlights [5pts]

**UX & Conversion (30 points):**
- [ ] Job search with filters (location, department, type) [5pts]
- [ ] < 3 clicks from homepage to careers [5pts]
- [ ] Application < 5 steps/screens [5pts]
- [ ] No mandatory account creation [5pts]
- [ ] Mobile responsive [5pts]
- [ ] Clear CTAs ("View Open Roles", "Apply Now") [5pts]

**Technical (15 points):**
- [ ] Descriptive page title with company name [5pts]
- [ ] Meta description present [5pts]
- [ ] Fast loading, no broken elements [5pts]

**Social Proof (15 points):**
- [ ] Awards/certifications displayed [5pts]
- [ ] Review ratings shown (Glassdoor badge, etc.) [5pts]
- [ ] Employee count or team size visible [5pts]

### Step 3: Generate Report
Save to `CAREERS-PAGE-AUDIT.md` with checklist results, before/after headline recommendations, specific content gaps, and prioritised fixes.
