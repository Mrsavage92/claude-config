import json, urllib.request, urllib.error, time, os, re

TOKEN = 'ntn_K46793192822yLb12pUWso1QC0gaYtsA6dENpcn0xjhfKB'
NOTION_VERSION = '2022-06-28'
BASE = 'https://api.notion.com/v1'

PAGES = {
    'commands': '32a116e8-bef2-8118-9f49-e6d790a56bd1',
    'agents':   '32a116e8-bef2-815d-8b38-f37eaa467ec5',
    'skills':   '32a116e8-bef2-8196-b2d3-e630d645984a',
}

home = os.environ['USERPROFILE']

def extract_desc(filepath):
    """Extract description from frontmatter or first paragraph after heading."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        # Try frontmatter description:
        fm = re.search(r'^---\s*\n.*?description:\s*["\']?(.+?)["\']?\s*\n.*?---', content, re.DOTALL)
        if fm:
            return fm.group(1).strip().strip('"\'')
        # Fall back: first non-empty line that isn't a heading or ---
        for line in content.splitlines():
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('---') and not line.startswith('```'):
                return line[:300]
    except Exception:
        pass
    return ''

def build_kb():
    """Rebuild kb_data.json from actual local files."""
    claude_dir = os.path.join(home, '.claude')
    cmds_dir = os.path.join(claude_dir, 'commands')
    agts_dir = os.path.join(claude_dir, 'agents')
    skls_dir = os.path.join(claude_dir, 'skills')

    commands = []
    for fname in sorted(os.listdir(cmds_dir)):
        if fname.endswith('.md'):
            slug = fname[:-3]
            desc = extract_desc(os.path.join(cmds_dir, fname))
            commands.append({'slug': slug, 'name': slug, 'desc': desc})

    agents = []
    for fname in sorted(os.listdir(agts_dir)):
        if fname.endswith('.md'):
            slug = fname[:-3]
            desc = extract_desc(os.path.join(agts_dir, fname))
            agents.append({'slug': slug, 'name': slug, 'desc': desc})

    skills = sorted([d for d in os.listdir(skls_dir) if not d.startswith('.')])

    kb = {'commands': commands, 'agents': agents, 'skills': skills}
    kb_path = os.path.join(home, 'Documents', 'kb_data.json')
    with open(kb_path, 'w', encoding='utf-8') as f:
        json.dump(kb, f, indent=2)
    print(f'kb_data.json rebuilt: {len(commands)} commands / {len(agents)} agents / {len(skills)} skills')
    return kb

print('Rebuilding kb_data.json from local files...')
data = build_kb()

def notion_req(method, path, body=None):
    url = BASE + path
    req = urllib.request.Request(url, method=method)
    req.add_header('Authorization', 'Bearer ' + TOKEN)
    req.add_header('Notion-Version', NOTION_VERSION)
    req.add_header('Content-Type', 'application/json')
    if body:
        req.data = json.dumps(body, ensure_ascii=True).encode('utf-8')
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {'error': e.read().decode()}

def get_children(page_id):
    result = notion_req('GET', f'/blocks/{page_id}/children?page_size=100')
    blocks = result.get('results', [])
    while result.get('has_more'):
        cursor = result.get('next_cursor')
        result = notion_req('GET', f'/blocks/{page_id}/children?page_size=100&start_cursor={cursor}')
        blocks.extend(result.get('results', []))
    return blocks

def delete_block(block_id):
    notion_req('DELETE', f'/blocks/{block_id}')
    time.sleep(0.35)

def append_blocks(page_id, blocks):
    for i in range(0, len(blocks), 100):
        chunk = blocks[i:i+100]
        r = notion_req('PATCH', f'/blocks/{page_id}/children', {'children': chunk})
        if 'error' in r:
            print(f'  Error appending: {str(r.get("error", ""))[:200]}')
        time.sleep(0.35)

def safe(s, maxlen=1900):
    s = re.sub(r'[^\x00-\x7F]', '', str(s))
    return s[:maxlen]

def h1(txt):
    return {'object': 'block', 'type': 'heading_1', 'heading_1': {'rich_text': [{'type': 'text', 'text': {'content': safe(txt)}}]}}

def h2(txt):
    return {'object': 'block', 'type': 'heading_2', 'heading_2': {'rich_text': [{'type': 'text', 'text': {'content': safe(txt)}}]}}

def para(txt):
    return {'object': 'block', 'type': 'paragraph', 'paragraph': {'rich_text': [{'type': 'text', 'text': {'content': safe(txt)}}]}}

def bullet(bold, desc=''):
    rich = [{'type': 'text', 'text': {'content': safe(bold)}, 'annotations': {'bold': True}}]
    if desc:
        rich.append({'type': 'text', 'text': {'content': safe(' - ' + desc[:200])}})
    return {'object': 'block', 'type': 'bulleted_list_item', 'bulleted_list_item': {'rich_text': rich}}

def divider():
    return {'object': 'block', 'type': 'divider', 'divider': {}}

# ---- SLASH COMMANDS ----
print('Updating Slash Commands page...')
existing = get_children(PAGES['commands'])
for b in existing:
    delete_block(b['id'])

cmd_map = {c['slug']: c for c in data['commands']}

cats_cmd = [
    ('Web Build Pipeline', ['web-scope','web-scaffold','web-supabase','web-page','web-component','web-fix','web-review','web-deploy','saas-build']),
    ('Product & Strategy', ['prd','okr','rice','sprint-plan','sprint-health','retro','user-story','project-health','code-to-prd']),
    ('Content & Marketing', ['linkedin-post','brand-dna','ad-creative','scroll-stop-prompt','scroll-stop-build','seo-strategy']),
    ('Engineering', ['a11y-audit','architecture','api-docs','pipeline','tdd','tech-debt','scaffold','changelog','plugin-audit']),
    ('Business & Finance', ['financial-health','saas-health','competitive-matrix','pitch-deck','pricing-model','customer-journey','persona','job-description']),
    ('Audits', ['parallel-audit','google-workspace']),
    ('AI & Agents', ['agent-brief','decide','design','validate','usage-report']),
    ('Productivity', ['standup','handoff','sync-knowledge-base']),
]

blocks = [
    h1(f'Slash Commands ({len(data["commands"])} total)'),
    para('Last updated: 2026-03-25  |  Source: github.com/Mrsavage92/claude-config'),
    divider(),
]

categorized = set()
for cat, slugs in cats_cmd:
    valid = [s for s in slugs if s in cmd_map]
    if valid:
        blocks.append(h2(cat))
        for s in valid:
            c = cmd_map[s]
            blocks.append(bullet('/' + s, c['desc']))
            categorized.add(s)

remaining = [c for c in data['commands'] if c['slug'] not in categorized]
if remaining:
    blocks.append(h2('Other'))
    for c in remaining:
        blocks.append(bullet('/' + c['slug'], c['desc']))

append_blocks(PAGES['commands'], blocks)
print(f'  Done: {len(blocks)} blocks')

# ---- AGENTS ----
print('Updating Agents page...')
existing = get_children(PAGES['agents'])
for b in existing:
    delete_block(b['id'])

agent_map = {a['slug']: a for a in data['agents']}

cats_agent = [
    ('C-Suite Advisors', ['cs-ceo-advisor','cs-cfo-advisor','cs-cto-advisor','cs-cmo-advisor','cs-coo-advisor','cs-cpo-advisor','cs-cro-advisor','cs-ciso-advisor','cs-chro-advisor']),
    ('Business Strategy', ['cs-chief-of-staff','cs-board-advisor','cs-orchestrator','cs-scenario-war-room','cs-ma-advisor','cs-founder-coach']),
    ('Engineering & Architecture', ['cto-architect','cto-orchestrator','strategic-cto-mentor','systems-architect','cs-senior-engineer','cs-engineering-lead','cs-devops','cs-sre','database-designer','migration-architect','observability-designer','performance-tuner','refactor-expert','root-cause-analyzer','test-engineer','pr-review-expert','api-design-reviewer','rag-architect','mcp-server-builder','agent-designer','codebase-onboarding']),
    ('Growth & Revenue', ['cs-growth-strategist','cs-revenue-ops','cs-sales-coach','cs-sales-engineer','cs-partnerships','cs-demand-gen-specialist']),
    ('Product & UX', ['cs-product-manager','cs-product-analyst','cs-product-strategist','cs-ux-researcher','cs-project-manager']),
    ('Marketing & Content', ['cs-content-creator','cs-seo-specialist','cs-reputation-manager','cs-employer-brand','cs-audit-specialist','cs-workspace-admin']),
    ('Finance & Legal', ['cs-financial-analyst','cs-legal-advisor','cs-quality-regulatory']),
    ('Customer & Analytics', ['cs-customer-success','cs-data-analyst','cs-ai-advisor']),
]

ablocks = [
    h1(f'Agents ({len(data["agents"])} total)'),
    para('Last updated: 2026-03-25  |  Source: github.com/Mrsavage92/claude-config'),
    divider(),
]

categorized_a = set()
for cat, slugs in cats_agent:
    valid = [s for s in slugs if s in agent_map]
    if valid:
        ablocks.append(h2(cat))
        for s in valid:
            a = agent_map[s]
            ablocks.append(bullet(s, a['desc']))
            categorized_a.add(s)

remaining_a = [a for a in data['agents'] if a['slug'] not in categorized_a]
if remaining_a:
    ablocks.append(h2('Other'))
    for a in remaining_a:
        ablocks.append(bullet(a['slug'], a['desc']))

append_blocks(PAGES['agents'], ablocks)
print(f'  Done: {len(ablocks)} blocks')

# ---- SKILLS LIBRARY ----
print('Updating Skills Library page...')
existing = get_children(PAGES['skills'])
for b in existing:
    delete_block(b['id'])

skill_set = set(data['skills'])

cats_skill = [
    ('Audit Orchestration', ['full-audit','full-audit-report-pdf','parallel-audit']),
    ('Marketing Audit', ['market','market-ads','market-audit','market-brand','market-competitors','market-copy','market-emails','market-funnel','market-gbp','market-landing','market-launch','market-proposal','market-report','market-report-pdf','market-reviews','market-seo','market-social']),
    ('GEO & SEO', ['geo','geo-audit','geo-brand-mentions','geo-citability','geo-content','geo-crawlers','geo-llmstxt','geo-platform-optimizer','geo-report','geo-report-pdf','geo-schema','geo-technical']),
    ('Technical Audit', ['techaudit','techaudit-accessibility','techaudit-audit','techaudit-mobile','techaudit-report-pdf','techaudit-speed']),
    ('Security', ['security','security-audit','security-email','security-headers','security-report-pdf']),
    ('Privacy & Compliance', ['privacy','privacy-audit','privacy-cookies','privacy-policy','privacy-report-pdf']),
    ('Reputation', ['reputation','reputation-audit','reputation-monitor','reputation-report-pdf','reputation-response']),
    ('Employer Brand', ['employer','employer-audit','employer-careers','employer-evp','employer-report-pdf','employer-reviews','employer-social']),
    ('AI Readiness', ['ai-ready','ai-ready-adoption','ai-ready-audit','ai-ready-automation','ai-ready-data','ai-ready-report-pdf']),
    ('Premium Website Suite', ['premium-website','saas-build','saas-improve','web-scope','web-scaffold','web-supabase','web-stripe','web-email','web-page','web-component','web-animations','web-onboarding','web-settings','web-table','web-review','web-deploy','web-fix','web-design-research','web-design-guidelines','dashboard-design']),
    ('Engineering Team', ['engineering-team','senior-frontend','senior-backend','senior-devops','senior-qa','code-reviewer','stripe-integration-expert','incident-commander']),
    ('Product & Business', ['prd','okr','rice','sprint-plan','sprint-health','retro','user-story','persona','competitive-matrix','customer-journey','project-health','saas-health','financial-health','pitch-deck','pricing-model','product-add']),
    ('Engineering & Architecture', ['architecture','decide','design','validate','pipeline','tdd','tech-debt','api-docs','changelog','scaffold','a11y-audit','review','vercel-react-best-practices']),
    ('Content & Marketing', ['seo-strategy','linkedin-post','ad-creative','brand-dna','scroll-stop-build','scroll-stop-prompt']),
    ('Project Management', ['project-doc','project-manager','project-refresh','project-review','notion']),
    ('Business Growth', ['business-growth','customer-success-manager','client-onboard','client-golive']),
    ('Power Platform', ['dynamics365-crm-architect','dataverse-data-model','power-automate-engineer','power-platform-alm','power-platform-integration']),
    ('Utility', ['autopilot','brainstorming','stock-photos','ai-image-generation','agent-browser','find-skills','agent-brief','google-workspace','handoff','standup','sync-knowledge-base','usage-report','plugin-audit','code-to-prd','job-description']),
]

sblocks = [
    h1(f'Skills Library ({len(data["skills"])} total)'),
    para('Last updated: 2026-03-25  |  Source: github.com/Mrsavage92/skills-library'),
    divider(),
]

categorized_s = set()
for cat, slugs in cats_skill:
    valid = [s for s in slugs if s in skill_set]
    if valid:
        sblocks.append(h2(cat))
        for s in valid:
            sblocks.append(bullet(s))
            categorized_s.add(s)

remaining_s = [s for s in data['skills'] if s not in categorized_s]
if remaining_s:
    sblocks.append(h2('Other'))
    for s in remaining_s:
        sblocks.append(bullet(s))

append_blocks(PAGES['skills'], sblocks)
print(f'  Done: {len(sblocks)} blocks')

# ---- AUTO-UPDATE README COUNTS ----
readme_path = os.path.join(home, 'Documents', 'Git', 'claude-config', 'README.md')
if os.path.exists(readme_path):
    n_cmd = len(data['commands'])
    n_agent = len(data['agents'])
    n_skill = len(data['skills'])
    with open(readme_path, 'r', encoding='utf-8') as f:
        readme = f.read()
    readme = re.sub(r'`commands/` -- \d+ slash commands', f'`commands/` -- {n_cmd} slash commands', readme)
    readme = re.sub(r'`agents/` -- \d+ specialist agents', f'`agents/` -- {n_agent} specialist agents', readme)
    readme = re.sub(r'`skills/` -- \d+ skills', f'`skills/` -- {n_skill} skills', readme)
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme)
    print(f'README updated: {n_cmd} commands / {n_agent} agents / {n_skill} skills')

print('All Notion pages updated successfully.')
