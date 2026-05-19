import urllib.request, json
from datetime import datetime

TOKEN = os.environ.get('NOTION_INTERNAL_TOKEN') or (_ for _ in ()).throw(RuntimeError('Set NOTION_INTERNAL_TOKEN env var'))
HEADERS = {
    'Authorization': f'Bearer {TOKEN}',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
}

AUDITHQ_PAGE_ID = '32a116e8-bef2-8144-bfcb-c313480c7c90'

def t(text, bold=False):
    obj = {'type': 'text', 'text': {'content': text}}
    if bold:
        obj['annotations'] = {'bold': True}
    return obj

def h2(text):
    return {'object': 'block', 'type': 'heading_2', 'heading_2': {'rich_text': [t(text)]}}

def para(text, bold=False):
    return {'object': 'block', 'type': 'paragraph', 'paragraph': {'rich_text': [t(text, bold=bold)]}}

def bullet(text, bold=False):
    return {'object': 'block', 'type': 'bulleted_list_item', 'bulleted_list_item': {'rich_text': [t(text, bold=bold)]}}

def check(text, checked=False):
    return {'object': 'block', 'type': 'to_do', 'to_do': {'rich_text': [t(text)], 'checked': checked}}

def divider():
    return {'object': 'block', 'type': 'divider', 'divider': {}}

def callout(text, emoji, color='yellow_background'):
    return {
        'object': 'block', 'type': 'callout',
        'callout': {
            'rich_text': [t(text)],
            'icon': {'type': 'emoji', 'emoji': emoji},
            'color': color
        }
    }

today = datetime.now().strftime('%d %B %Y')

blocks = [
    callout('LIVE - Pre-revenue. Anthropic credits intentionally at $0 pending audit quality validation. Social suite (9th) enterprise-grade as of 26 Apr 2026.', '🚧'),
    divider(),
    h2('What Is This'),
    para('AuditHQ is an AI-powered 9-suite website audit SaaS for Australian digital agencies and freelancers. Submit a client URL, get 9 parallel AI audits in minutes, download a branded PDF report.'),
    divider(),
    h2('Current Status'),
    bullet('LIVE at app.audithq.com.au (Vercel + Supabase)'),
    bullet('Pre-revenue — Anthropic credits at $0 (intentional quality gate, top up when ready for first client)'),
    bullet('9 audit suites operational in the web app'),
    bullet('Social suite (#9) skill is enterprise-grade + client-deliverable demo PDF complete (Gloss Beauty by Louise)'),
    bullet('PDF engine upgraded 2026-04-26: brand extraction from any audit heading format, full-body severity cards, bold marker fix'),
    divider(),
    h2('Tech Stack'),
    bullet('Frontend: React 18 + Vite + TypeScript + Tailwind + shadcn/ui — Vercel'),
    bullet('Backend: 11 Supabase Edge Functions (Deno) — run-audit, generate-pdf, synthesize-audit, Stripe webhook, etc.'),
    bullet('Audit engine: pg_net trigger on INSERT -> run-audit -> 9 parallel Claude Sonnet calls -> progressive DB writes'),
    bullet('PDF: ReportLab (Python) via generate-pdf Edge Function'),
    bullet('Auth: Supabase Auth (email + magic link). Payments: Stripe. Email: Resend.'),
    bullet('Cost per full audit: ~$0.75 (Anthropic). All free tiers otherwise.'),
    divider(),
    h2('Key URLs'),
    bullet('Live app: https://app.audithq.com.au'),
    bullet('Landing: https://audithq.com.au'),
    bullet('GitHub (prod): github.com/Mrsavage92/audithq (local: C:/Users/Adam/audit-genius/)'),
    bullet('GitHub (v2 landing): github.com/Mrsavage92/audithq-v2 (local: C:/Users/Adam/Documents/Git/audithq-v2/)'),
    bullet('Supabase project: nstpbwflegwmknwcmsey (Savage Project)'),
    bullet('Vercel project: audithq (mrsavage92 account)'),
    divider(),
    h2('9 Audit Suites and Weights'),
    bullet('1. Marketing 18%  |  2. Technical 16%  |  3. GEO 14%  |  4. Security 14%  |  5. Privacy 11%'),
    bullet('6. Social 10%  |  7. Reputation 9%  |  8. Employer Brand 4%  |  9. AI Readiness 4%'),
    bullet('Social suite: 8 categories — Presence Breadth, Profile Quality, Activity & Cadence, Content Quality, Engagement Depth, Platform-Fit, Competitive Position, Brand Consistency'),
    bullet('Social verdict per platform: KEEP / FIX / START / KILL / DEFEND'),
    divider(),
    h2('Business Model'),
    bullet('Tier 1: One-off audits $297-$997'),
    bullet('Tier 2: Monthly monitoring $149-$749/mo'),
    bullet('Tier 3: Fix-it retainers $2,000-$8,000/mo'),
    bullet('Target: $10K/mo  |  Path: 5 audits + 8 monitoring + 2 retainers = $11,777/mo'),
    divider(),
    h2('What Has Been Built'),
    bullet('Full 9-suite audit pipeline with real-time polling and progressive results display', bold=True),
    bullet('PDF per suite + full report download (shared ReportLab engine)'),
    bullet('Scheduled audits (date+time picker + auto-share to client)'),
    bullet('Client management (with/without websites)'),
    bullet('Public share links with findings + action plan + PDF'),
    bullet('Email notifications (audit complete, share, support tickets)'),
    bullet('Superadmin console at /admin (email allowlist gate)'),
    bullet('Public quick scan funnel (no auth required)'),
    bullet('Stripe checkout + billing portal + TrialBanner with countdown and dunning'),
    bullet('Social audit suite: enterprise-grade skill with Puppeteer scraping, calibrated scoring, validator gate', bold=True),
    bullet('Demo audit completed: Gloss Beauty by Louise (46/100 Grade D) — factually corrected, client-deliverable'),
    bullet('PDF engine fixes: brand name extraction, severity card full-body rendering, bold markers stripped'),
    divider(),
    h2('What is Next'),
    check('Top up Anthropic credits to unblock first paying audit'),
    check('Set STRIPE_SECRET_KEY as Supabase secret (Stripe payments currently broken)'),
    check('Generate og-image.png for audithq.com.au meta preview'),
    check('Port social-audit SKILL.md methodology into run-audit edge function prompt'),
    check('Integrate Apify/RapidAPI for social scraping in serverless (Puppeteer MCP not available in Deno)'),
    check('v2 landing page Phase 1 scaffold (audithq-v2 repo — never touch prod from here)'),
    check('First paying client outreach'),
    divider(),
    h2('Blockers and Risks'),
    bullet('Anthropic credits $0 — intentional quality gate. Top up when confident in audit output quality.'),
    bullet('STRIPE_SECRET_KEY not set as Supabase secret — payment flow broken until fixed.'),
    bullet('Social audit in web product runs generic Claude prompt, not enterprise skill methodology — needs porting.'),
    bullet('Puppeteer MCP unavailable in serverless — social live-data needs Apify API (~$30-50/mo at scale).'),
    divider(),
    h2('Key Decisions Log'),
    bullet('2026-04-15: Railway removed. All backend = Supabase Edge Functions only.'),
    bullet('2026-04-15: Audit engine uses real SKILL.md methodology, not generic AI prompts.'),
    bullet('2026-04-17: Repo renamed audit-genius -> audithq. audithq.com.au live via Cloudflare.'),
    bullet('2026-04-20: Social suite added as 9th suite (10% weight). Primary wedge for digital marketer buyers.'),
    bullet('2026-04-24: v2 landing page started in separate repo to protect prod app.'),
    bullet('2026-04-26: Social suite enterprise build complete. PDF engine upgraded. Demo audit client-deliverable.'),
    divider(),
    para(f'Last updated: {today} — Social suite (#9) enterprise build complete; PDF engine upgraded (brand extraction, full-body severity cards, bold fix); Gloss Beauty demo audit factually corrected and client-deliverable.', bold=True),
]

# Check for existing master doc child page first
req = urllib.request.Request(
    f'https://api.notion.com/v1/blocks/{AUDITHQ_PAGE_ID}/children?page_size=50',
    headers=HEADERS
)
data = json.loads(urllib.request.urlopen(req).read())
existing_doc_id = None
for block in data.get('results', []):
    if block.get('type') == 'child_page':
        title = block['child_page']['title'].lower()
        if 'master doc' in title or 'master' in title:
            existing_doc_id = block['id']
            break

if existing_doc_id:
    print(f'Found existing master doc: {existing_doc_id}')
    # Archive existing content and recreate -- simplest approach is to just create a new one
    # since archiving requires deleting child blocks individually

# Create new master doc
payload = {
    'parent': {'page_id': AUDITHQ_PAGE_ID},
    'properties': {'title': {'title': [{'text': {'content': 'AuditHQ - Master Doc'}}]}},
    'children': blocks
}

req = urllib.request.Request(
    'https://api.notion.com/v1/pages',
    data=json.dumps(payload).encode(),
    headers=HEADERS,
    method='POST'
)
try:
    result = json.loads(urllib.request.urlopen(req).read())
    page_id = result['id'].replace('-', '')
    print(f'SUCCESS: https://notion.so/{page_id}')
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f'ERROR {e.code}: {body}')
