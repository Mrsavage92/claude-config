# Cookie Consent Deep Dive

## Skill Purpose
Detailed analysis of a website's cookie consent implementation. Maps every tracking cookie/script, assesses consent mechanism compliance, and produces a remediation plan.

## When to Use
- `privacy cookies <url>`
- Follow-up to `privacy audit` when Cookie Consent score is below 60

## How to Execute

### Step 1: Script Inventory
From the HTML source, catalogue every script tag:
- Google Analytics (GA4/UA)
- Google Tag Manager
- Facebook/Meta Pixel
- LinkedIn Insight Tag
- TikTok Pixel
- Hotjar/Clarity/FullStory
- Advertising networks
- Social media widgets
- Customer chat tools
- Payment processors
- CDN/performance tools

### Step 2: Consent Flow Analysis
Map the cookie consent user journey:
- What appears on first visit?
- Can users reject all easily?
- What loads BEFORE consent?
- What loads AFTER accept?
- What loads AFTER reject?
- Does the preference persist?
- Can users change their preference later?

### Step 3: Generate Report
Save to `COOKIE-AUDIT.md` with script inventory, consent flow map, compliance gaps, and recommended consent management platform (Cookiebot, OneTrust, etc.) with implementation steps.
