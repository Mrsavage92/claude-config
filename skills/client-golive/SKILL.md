---
description: "GrowLocal client go-live automation — marks a client site as live, activates Supabase record, sends go-live email, updates Notion checklist. Use after client approves preview."
---

# /client-golive

Marks a GrowLocal client website as live. Run this when the client has approved their preview site. Activates their Supabase record, calls the go-live edge function, sends a "You're live!" email to the client, and updates their Notion delivery checklist.

## When to Use
After the client has reviewed and approved their Lovable-built website. This is the final step in the 72-hour delivery process.

## Usage

```
/client-golive [slug]
```

Example:
```
/client-golive smith-plumbing
```

Or with optional custom domain:
```
/client-golive smith-plumbing domain:smithplumbing.com.au
```

---

## Constants (GrowLocal project)

```
SUPABASE_PROJECT_ID: nstpbwflegwmknwcmsey
SUPABASE_FUNCTIONS_URL: https://nstpbwflegwmknwcmsey.supabase.co/functions/v1
NOTION_TOKEN: ntn_K46793192822yLb12pUWso1QC0gaYtsA6dENpcn0xjhfKB
PREVIEW_BASE_URL: https://growlocal-flax.vercel.app/s
```

---

## Phase 0 — Fetch Business Record

Look up the business by slug using Supabase MCP:

```sql
SELECT id, name, slug, owner_name, owner_email, owner_phone,
       suburb, state, industry, google_review_url, plan, status
FROM businesses
WHERE slug = '[slug]'
LIMIT 1;
```

If no row found: halt with "No business found with slug '[slug]'. Check the slug and retry."

If `status = 'live'`: print "Already live. Nothing to do." and stop.

Store: BUSINESS_ID, owner_name, owner_email, business_name, suburb, state.

---

## Phase 1 — Mark Business Live in Supabase

```sql
UPDATE businesses
SET
  status = 'live',
  onboarding_status = 'live',
  live_at = now(),
  custom_domain = '[domain if provided, else NULL]'
WHERE id = '[BUSINESS_ID]'
RETURNING slug, live_at;
```

---

## Phase 2 — Call go-live-business Edge Function

```python
import urllib.request, json

FUNCTIONS_URL = 'https://nstpbwflegwmknwcmsey.supabase.co/functions/v1'

payload = json.dumps({'business_id': BUSINESS_ID}).encode()
req = urllib.request.Request(
    f'{FUNCTIONS_URL}/go-live-business',
    data=payload,
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {SERVICE_ROLE_KEY}'},
    method='POST'
)
try:
    resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
    print('go-live-business:', resp)
except Exception as e:
    print(f'go-live-business call failed (non-blocking): {e}')
```

If this fails, log and continue - the Supabase UPDATE in Phase 1 is sufficient.

---

## Phase 3 — Send "You're Live!" Email to Client

```python
live_url = f'https://growlocal-flax.vercel.app/s/{slug}'
if custom_domain:
    live_url = f'https://{custom_domain}'

first_name = owner_name.split()[0]

golive_html = f"""
<p>Hi {first_name},</p>
<p>Your GrowLocal website is now live!</p>
<p><strong>Your website:</strong> <a href="{live_url}">{live_url}</a></p>
<p>Here is what is now running automatically for you:</p>
<ul>
  <li><strong>Review requests</strong> - after every completed job, your customers will receive an SMS asking for a Google review</li>
  <li><strong>Missed call text-back</strong> - if someone calls and you miss it, they get an automatic SMS reply within 30 seconds</li>
  <li><strong>AI lead replies</strong> - every website enquiry gets a reply within 60 seconds, any time of day</li>
</ul>
<p><strong>To get your first reviews rolling:</strong> next time you complete a job, mark it as done in your GrowLocal dashboard and the review request SMS will go out automatically.</p>
<p>Any questions - reply to this email or call us.</p>
<p>GrowLocal team<br>hello@growlocal.com.au</p>
"""

payload = json.dumps({
    'to': owner_email,
    'subject': f'Your {business_name} website is live',
    'html_body': golive_html
}).encode()

req = urllib.request.Request(
    f'{FUNCTIONS_URL}/send-email',
    data=payload,
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {SERVICE_ROLE_KEY}'},
    method='POST'
)
try:
    urllib.request.urlopen(req, timeout=15)
    print(f'Welcome email sent to {owner_email}')
except Exception as e:
    print(f'Email failed (non-blocking): {e}')
    print('--- EMAIL CONTENT (send manually) ---')
    print(golive_html)
    print('--------------------------------------')
```

---

## Phase 4 — Update Notion Delivery Checklist

Find the client's Notion page by searching for a page titled `[business_name] - [suburb]` under the Clients page.

```python
import urllib.request, json

TOKEN = 'ntn_K46793192822yLb12pUWso1QC0gaYtsA6dENpcn0xjhfKB'
HEADERS = {
    'Authorization': f'Bearer {TOKEN}',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
}

# Search for the client page
payload = json.dumps({'query': business_name}).encode()
req = urllib.request.Request('https://api.notion.com/v1/search', data=payload, headers=HEADERS, method='POST')
results = json.loads(urllib.request.urlopen(req).read()).get('results', [])
client_page_id = None
for r in results:
    if r.get('object') == 'page':
        props = r.get('properties', {})
        title_prop = props.get('title', {}).get('title', [])
        title = ''.join(t.get('plain_text', '') for t in title_prop)
        if business_name.lower() in title.lower():
            client_page_id = r['id'].replace('-','')
            break
```

If found, update the status callout and append a go-live block:

```python
if client_page_id:
    # Append go-live confirmation block
    update_blocks = [
        {'object':'block','type':'divider','divider':{}},
        {'object':'block','type':'callout','callout':{
            'rich_text':[{'type':'text','text':{'content':f'LIVE as of {live_at_date}. URL: {live_url}'}}],
            'icon':{'type':'emoji','emoji':'✅'}
        }},
        {'object':'block','type':'to_do','to_do':{
            'rich_text':[{'type':'text','text':{'content':'Run /client-golive to mark live'}}],
            'checked':True
        }},
    ]
    payload = json.dumps({'children': update_blocks}).encode()
    req = urllib.request.Request(
        f'https://api.notion.com/v1/blocks/{client_page_id}/children',
        data=payload,
        headers=HEADERS,
        method='PATCH'
    )
    urllib.request.urlopen(req)
    print(f'Notion page updated: https://notion.so/{client_page_id}')
else:
    print(f'Notion client page not found for {business_name} - update manually')
```

---

## Phase 5 — Terminal Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIVE - [business_name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Live URL:    [live_url]
Business ID: [BUSINESS_ID]
Went live:   [timestamp]

  OK  Supabase status set to live
  OK  go-live-business edge function called
  OK  "You're live" email sent to [owner_email]
  OK  Notion delivery checklist updated

AUTOMATIONS ACTIVE:
  OK  Review request SMS - fires after job completion
  OK  Missed call text-back - 30 second auto-reply
  OK  AI lead reply - <60 second website enquiry reply
  --  Monthly performance report - active 1st of next month
  --  SMS features pending Twilio credentials

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stop Conditions

| Condition | Action |
|-----------|--------|
| Slug not found in Supabase | Halt with clear message - check slug |
| Business already live | Print status and stop - no action needed |
| go-live edge function fails | Log and continue - DB update is sufficient |
| Email fails | Log, continue, print email to terminal |
| Notion page not found | Log and continue - not a blocker |

Never pause between phases to ask "shall I continue?".

---

## Rules
- Never use em dashes (--) anywhere. Hyphens (-) only.
- Australian English throughout
- The Supabase UPDATE in Phase 1 is the source of truth - all other steps are supporting, not blocking
