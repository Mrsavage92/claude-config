#!/usr/bin/env python3
"""Fetch active project master docs from Notion → ~/.claude/notion-context.md"""
import json, os, sys, urllib.request, urllib.error
from datetime import datetime

TOKEN = os.environ.get('NOTION_TOKEN', '')
PROJECTS_ID = '32a116e8bef281d6bbcae0db73eede0b'
OUTPUT = os.path.expanduser('~/.claude/notion-context.md')
LOG = os.path.expanduser('~/.claude/sync-errors.log')
HEADERS = {
    'Authorization': f'Bearer {TOKEN}',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
}

def log(msg):
    with open(LOG, 'a') as f:
        f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] notion-context: {msg}\n")

def notion_get(path):
    req = urllib.request.Request(f'https://api.notion.com/v1{path}', headers=HEADERS)
    with urllib.request.urlopen(req, timeout=8) as r:
        return json.loads(r.read())

def block_to_md(block):
    t = block.get('type', '')
    obj = block.get(t, {})
    text = ''.join(
        rt.get('text', {}).get('content', '') for rt in obj.get('rich_text', [])
        if rt.get('type') == 'text'
    ).strip()
    if t == 'heading_1' and text: return f'# {text}'
    if t == 'heading_2' and text: return f'## {text}'
    if t == 'heading_3' and text: return f'### {text}'
    if t == 'paragraph' and text: return text
    if t == 'bulleted_list_item' and text: return f'- {text}'
    if t == 'numbered_list_item' and text: return f'- {text}'
    if t == 'to_do' and text:
        done = 'x' if obj.get('checked') else ' '
        return f'- [{done}] {text}'
    if t in ('callout', 'quote') and text: return f'> {text}'
    if t == 'divider': return '---'
    return ''

def get_page_markdown(page_id):
    lines = []
    cursor = None
    while True:
        url = f'/blocks/{page_id}/children?page_size=100'
        if cursor:
            url += f'&start_cursor={cursor}'
        data = notion_get(url)
        for b in data.get('results', []):
            md = block_to_md(b)
            if md:
                lines.append(md)
        cursor = data.get('next_cursor')
        if not cursor:
            break
    return '\n'.join(lines)

def main():
    if not TOKEN:
        log('ERROR: NOTION_TOKEN env var missing')
        sys.exit(0)

    lines = [
        '# Active Project Context',
        f'_Fetched from Notion at session start: {datetime.now().strftime("%Y-%m-%d %H:%M")}_',
        '',
        'This file is auto-generated. Read it at the start of any project session for current state.',
        '',
        '---',
        '',
    ]

    try:
        projects = notion_get(f'/blocks/{PROJECTS_ID}/children?page_size=50')
        found = 0
        for proj in projects.get('results', []):
            if proj.get('type') != 'child_page':
                continue
            proj_name = proj['child_page']['title']
            proj_id = proj['id'].replace('-', '')
            children = notion_get(f'/blocks/{proj_id}/children?page_size=100')
            master = next(
                (b for b in children.get('results', [])
                 if b.get('type') == 'child_page' and 'Master Doc' in b['child_page']['title']),
                None
            )
            if master:
                doc_id = master['id'].replace('-', '')
                content = get_page_markdown(doc_id)
                lines += [f'## {proj_name}', f'_Source: https://notion.so/{doc_id}_', '', content, '', '---', '']
                found += 1

        if found == 0:
            lines.append('_No master docs found in Notion Projects. Run /project-doc to create them._')
        else:
            lines.append(f'_{found} project(s) loaded._')

        with open(OUTPUT, 'w') as f:
            f.write('\n'.join(lines))
        log(f'fetched {found} projects OK')

    except Exception as e:
        log(f'ERROR: {e}')
        # Don't overwrite existing file on error — stale is better than empty

if __name__ == '__main__':
    main()
