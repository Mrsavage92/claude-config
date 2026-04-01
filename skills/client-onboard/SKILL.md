---
description: "GrowLocal client onboarding automation — creates Supabase record, generates copy, builds Lovable prompt, sends welcome email, creates Notion page. Use for new client intake."
---

# /client-onboard

Onboard a new GrowLocal client from zero to ready-to-build in minutes. Creates their Supabase record, generates website copy via AI, produces a Lovable build prompt tailored to their industry, configures automation templates, sends a welcome email, and creates a Notion client page with delivery checklist.

## When to Use
When a client signs up for GrowLocal - either via the homepage form or directly. Run this before touching Lovable.

## Usage

```
/client-onboard
Name: Jane Smith
Business: Smith Plumbing
Industry: trades
City: Brisbane
State: QLD
Services: emergency plumbing, hot water systems, blocked drains, leak detection
Phone: 0412 345 678
Email: jane@smithplumbing.com.au
Google review link: https://g.page/r/...
Plan: starter
```

Minimum required: Name, Business, Industry, City, State, Phone, Email.
Google review link and Plan are optional (Plan defaults to starter).

Valid industries: `trades` `beauty` `health` `automotive` `hospitality` `fitness` `education` `property` `other`

---

## Constants (GrowLocal project)

```
SUPABASE_PROJECT_ID: nstpbwflegwmknwcmsey
SUPABASE_FUNCTIONS_URL: https://nstpbwflegwmknwcmsey.supabase.co/functions/v1
NOTION_GROWLOCAL_PAGE_ID: 32b116e8bef281689583cc30ca681bb0
NOTION_TOKEN: ntn_K46793192822yLb12pUWso1QC0gaYtsA6dENpcn0xjhfKB
PREVIEW_BASE_URL: https://growlocal-flax.vercel.app/s
```

Get the Supabase service role key from the Supabase MCP (`get_project` or from memory file).

---

## Phase 0 — Orient

Read `~/.claude/projects/C--Users-Adam/memory/project_growlocal.md` for current project state.

Parse all inputs from the args. Store as variables for use throughout.

Generate slug: `business_name` to lowercase, replace spaces and special chars with hyphens, strip leading/trailing hyphens.
Example: `Smith Plumbing & Gas` -> `smith-plumbing-gas`

---

## Phase 1 — Create Supabase Business Record

Use the Supabase MCP `execute_sql` to insert the business row.

Check slug uniqueness first:
```sql
SELECT id FROM businesses WHERE slug = '[slug]';
```
If taken, append `-2`, `-3` etc until unique.

Insert:
```sql
INSERT INTO businesses (
  slug, name,
  owner_name, owner_email, owner_phone,
  phone, email,
  industry_id, industry,
  suburb, state,
  service_areas,
  services,
  plan, status, onboarding_status,
  review_sms_enabled, missed_call_enabled, ai_reply_enabled,
  monthly_sms_limit,
  google_review_url,
  created_at
) VALUES (
  '[slug]', '[business_name]',
  '[owner_name]', '[email]', '[phone]',
  '[phone]', '[email]',
  '[industry]', '[industry]',
  '[city]', '[state]',
  '[{"suburb":"[city]","state":"[state]"}]'::jsonb,
  '[{"name":"service1"},{"name":"service2"}]'::jsonb,
  '[plan]', 'onboarding', 'new',
  true, true, true,
  500,
  '[google_review_link or NULL]',
  now()
) RETURNING id, slug;
```

Store the returned `id` as `BUSINESS_ID` and confirmed `slug` as `SLUG`.

Also link any matching signup:
```sql
UPDATE signups SET business_id = '[BUSINESS_ID]'
WHERE email = '[email]' AND business_id IS NULL;
```

**Output of Phase 1:** BUSINESS_ID, SLUG, PREVIEW_URL = `https://growlocal-flax.vercel.app/s/[SLUG]`

---

## Phase 2 — Generate Website Copy

Call the `generate-business-content` edge function using Python:

```python
import urllib.request, json

FUNCTIONS_URL = 'https://nstpbwflegwmknwcmsey.supabase.co/functions/v1'
# Get service role key from Supabase MCP get_project or project memory file

payload = json.dumps({'business_id': BUSINESS_ID}).encode()
req = urllib.request.Request(
    f'{FUNCTIONS_URL}/generate-business-content',
    data=payload,
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {SERVICE_ROLE_KEY}'},
    method='POST'
)
resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
content = resp.get('content', {})
```

Extract from `content`:
- `hero_tagline` - hero headline
- `hero_subtitle` - supporting line
- `about_copy` - about paragraph
- `meta_title` / `meta_description` - SEO
- `review_request_sms` - SMS template for review requests
- `missed_call_sms` - missed call text-back template
- `ai_lead_context` - AI reply system context

If the edge function call fails for any reason, generate the content inline using Claude directly:

```
Generate website copy for:
Business: [business_name]
Industry: [industry]
City: [city], [state]
Services: [services]

Return JSON with keys: hero_tagline, hero_subtitle, about_copy, meta_title, meta_description, gbp_description, review_request_sms, missed_call_sms, ai_lead_context.

No em dashes. Australian English. Warm and direct tone.
```

Store the fallback content with the same UPDATE as the edge function would perform:
```sql
UPDATE businesses SET
  content = '[content_json]'::jsonb,
  onboarding_status = 'content_ready'
WHERE id = '[BUSINESS_ID]';
```

---

## Phase 3 — Generate Lovable Build Prompt

Based on the client's industry, select the appropriate template and inject the generated copy.

### Industry Template Reference

| Industry | Hero pattern | Primary CTA | Key trust signals |
|----------|-------------|-------------|-------------------|
| trades | stat-forward (response time, jobs done) | Get a free quote | Licensed + insured, years experience |
| beauty | visual-forward, warm atmosphere | Book now | Review count, before/after |
| health | clean, clinical, trust-first | Book an appointment | Qualifications, Medicare, experience |
| automotive | bold, no-nonsense | Book a service | Years experience, brands serviced |
| hospitality | atmosphere-forward, inviting | View menu / Reserve | Hours, Google rating, cuisine |
| fitness | energy-forward, transformation | Start free trial / Join now | Member results, coach credentials |
| education | outcome-forward, professional | Book a session | Results achieved, qualifications |
| property | professional, data-forward | Get an appraisal | Sales count, suburb expertise |
| other | balanced, neutral | Get in touch | Reviews, years operating |

### Build Prompt Template

Produce the following prompt as a clearly delimited output block:

```
Build a professional [industry] website for [business_name] in [city], [state], Australia.

EXACT COPY TO USE (do not rewrite these):
- Hero headline: "[hero_tagline]"
- Hero subheadline: "[hero_subtitle]"
- About section: "[about_copy]"

BUSINESS DETAILS:
- Business name: [business_name]
- Location: [city], [state]
- Phone: [phone]
- Email: [email]
- Services: [services list]

DESIGN REQUIREMENTS:
- Fonts: Cormorant Garamond for headings, DM Sans for body text
- Style: [industry style from table above]
- Primary CTA: "[industry CTA from table above]"
- Mobile-first, fast-loading

SECTIONS (build in this order):
1. Sticky nav - logo left, click-to-call phone right, mobile hamburger
2. Hero - [industry hero pattern], headline + subheadline + primary CTA button + [industry trust signal]
3. Services - grid of [count] cards, one per service, with relevant icon
4. Social proof - 3 Google review testimonial cards with star rating and reviewer name
5. About - owner name and about copy, with placeholder for owner photo
6. How it works - 3 numbered steps: Enquire, We Respond, Job Done (adapt wording to industry)
7. CTA banner - "[Book now / Get a quote / Get in touch]" with phone number
8. Footer - business name, services list, phone, email, copyright [year]

TECHNICAL:
- Phone number must be a tel: link (click to call on mobile)
- Contact form (name, phone, message) that POSTs to /api/contact
- Google Maps embed for [city], [state]
- SEO: title tag "[meta_title]", meta description "[meta_description]"
```

Output this prompt in a clearly marked block so Adam can copy it directly into Lovable.

---

## Phase 4 — Send Welcome Email

Call the `send-email` edge function:

```python
welcome_html = f"""
<p>Hi {first_name},</p>
<p>Thanks for choosing GrowLocal. We are building your website now and you will have a preview to review within 24 hours.</p>
<p>Here is what we are setting up for you:</p>
<ul>
  <li>Professional website live at <a href="{PREVIEW_URL}">{PREVIEW_URL}</a></li>
  <li>Automated Google review requests after every job</li>
  <li>Missed call text-back (replies in 30 seconds)</li>
  <li>AI replies to website enquiries</li>
</ul>
<p>Your preview link: <a href="{PREVIEW_URL}">{PREVIEW_URL}</a></p>
<p>We will be in touch once it is ready for your review. Any questions - reply to this email.</p>
<p>GrowLocal team<br>hello@growlocal.com.au</p>
"""

payload = json.dumps({
    'to': email,
    'subject': f'We are building your {business_name} website now',
    'html_body': welcome_html
}).encode()
```

POST to `{FUNCTIONS_URL}/send-email` with service role key Bearer token.

If it fails: log it and continue. Print the email body to terminal as a fallback.

---

## Phase 5 — Create Notion Client Page

### 5a. Find or create "Clients" page under GrowLocal

Search for a child page titled "Clients" under the GrowLocal Notion page (`32b116e8bef281689583cc30ca681bb0`).

```python
import urllib.request, json

TOKEN = 'ntn_K46793192822yLb12pUWso1QC0gaYtsA6dENpcn0xjhfKB'
HEADERS = {
    'Authorization': f'Bearer {TOKEN}',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
}
GROWLOCAL_PAGE_ID = '32b116e8bef281689583cc30ca681bb0'

# Fetch children of GrowLocal page
req = urllib.request.Request(
    f'https://api.notion.com/v1/blocks/{GROWLOCAL_PAGE_ID}/children?page_size=50',
    headers=HEADERS
)
data = json.loads(urllib.request.urlopen(req).read())
clients_page_id = None
for b in data['results']:
    if b.get('type') == 'child_page' and b['child_page']['title'] == 'Clients':
        clients_page_id = b['id'].replace('-','')
        break

# If not found, create it
if not clients_page_id:
    payload = json.dumps({
        'parent': {'page_id': GROWLOCAL_PAGE_ID},
        'properties': {'title': {'title': [{'text': {'content': 'Clients'}}]}}
    }).encode()
    req = urllib.request.Request('https://api.notion.com/v1/pages', data=payload, headers=HEADERS, method='POST')
    resp = json.loads(urllib.request.urlopen(req).read())
    clients_page_id = resp['id'].replace('-','')
```

### 5b. Create client page

Page title: `[business_name] - [city]`

Create the page under the Clients page with these blocks:

```python
blocks = [
    # Status callout
    {'object':'block','type':'callout','callout':{'rich_text':[{'type':'text','text':{'content':'Status: Onboarding - website being built'}}],'icon':{'type':'emoji','emoji':'🚧'}}},

    # Details heading
    {'object':'block','type':'heading_2','heading_2':{'rich_text':[{'type':'text','text':{'content':'Business Details'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Owner: {owner_name}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Email: {email}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Phone: {phone}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Industry: {industry}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'City: {city}, {state}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Services: {services}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Plan: {plan}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Supabase ID: {BUSINESS_ID}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Preview URL: {PREVIEW_URL}'}}]}},

    # Generated copy heading
    {'object':'block','type':'heading_2','heading_2':{'rich_text':[{'type':'text','text':{'content':'Generated Copy'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Hero: {hero_tagline}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Subheadline: {hero_subtitle}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'About: {about_copy}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Meta title: {meta_title}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Meta description: {meta_description}'}}]}},

    # SMS templates heading
    {'object':'block','type':'heading_2','heading_2':{'rich_text':[{'type':'text','text':{'content':'Automation Templates'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Review SMS: {review_request_sms}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'Missed call SMS: {missed_call_sms}'}}]}},
    {'object':'block','type':'bulleted_list_item','bulleted_list_item':{'rich_text':[{'type':'text','text':{'content':f'AI context: {ai_lead_context}'}}]}},

    # Delivery checklist heading
    {'object':'block','type':'heading_2','heading_2':{'rich_text':[{'type':'text','text':{'content':'Delivery Checklist'}}]}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Business record created in Supabase'}}],'checked':True}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Website copy generated'}}],'checked':True}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Welcome email sent to client'}}],'checked':True}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Lovable build prompt generated'}}],'checked':True}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Website built in Lovable'}}],'checked':False}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Preview link sent to client'}}],'checked':False}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Client revisions done'}}],'checked':False}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Google review link added to businesses row'}}],'checked':False}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Custom domain configured (if applicable)'}}],'checked':False}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Run /client-golive to mark live'}}],'checked':False}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Twilio SMS activated (pending credentials)'}}],'checked':False}},
    {'object':'block','type':'to_do','to_do':{'rich_text':[{'type':'text','text':{'content':'Test review flow end-to-end'}}],'checked':False}},

    # Notes
    {'object':'block','type':'heading_2','heading_2':{'rich_text':[{'type':'text','text':{'content':'Notes'}}]}},
    {'object':'block','type':'paragraph','paragraph':{'rich_text':[{'type':'text','text':{'content':''}}]}},
]
```

POST this to `https://api.notion.com/v1/pages` with parent = clients_page_id.

Store the returned Notion page URL.

---

## Phase 6 — Terminal Output

Print the following summary. Use `━` characters for borders. No em dashes.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLIENT ONBOARDED - [business_name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Business ID:   [BUSINESS_ID]
Slug:          [SLUG]
Preview URL:   [PREVIEW_URL]
Notion page:   [NOTION_PAGE_URL]

AUTOMATED (done):
  OK  Supabase business record created
  OK  Website copy generated
  OK  Automation templates configured
  OK  Welcome email sent to [email]
  OK  Notion client page created

YOUR NEXT STEP:
  1. Copy the Lovable build prompt below
  2. Open Lovable and paste it as a new prompt
  3. Review the built site at [PREVIEW_URL]
  4. When the client approves, run:
     /client-golive [SLUG]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOVABLE BUILD PROMPT - COPY FROM HERE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[full Lovable prompt here]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stop Conditions

| Condition | Action |
|-----------|--------|
| Supabase MCP not responding | Halt and print: "Supabase MCP disconnected - reconnect and retry" |
| Slug conflict after 3 increments | Ask for preferred slug, then continue |
| `generate-business-content` fails | Fall back to inline Claude generation (see Phase 2) |
| Email send fails | Log, continue, print email body to terminal |
| Notion API fails | Log, continue - Supabase record is the source of truth |
| Same error 3 times | Print what was tried and stop |

Never pause between phases to ask "shall I continue?".

---

## Rules
- Never use em dashes (--) in any generated content. Hyphens (-) only.
- Australian English throughout (e.g. "colour" not "color", "authorise" not "authorize")
- All generated copy must sound like a real local business owner wrote it, not a marketing agency
- Phone numbers must always be formatted as click-to-call (`tel:` links) in any HTML output
