#!/usr/bin/env bash
# Phase A.1 route enumeration. Reads sitemap or crawls homepage.
# Writes .evolution/route-list.json + sha256.
# Uses python3 (no jq dependency).

set -e
export MSYS_NO_PATHCONV=1

PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
# Normalize MSYS-style PROJECT_PATH (/c/...) to Windows-style (C:/...) for python compatibility
if [[ "$PROJECT_PATH" =~ ^/([a-zA-Z])/ ]]; then
  drive="${BASH_REMATCH[1]^^}"
  PROJECT_PATH="${drive}:/${PROJECT_PATH:3}"
fi
EVOLUTION="$PROJECT_PATH/.evolution"
LIVE_URL=$(python3 -c "import json; print(json.load(open(r'$EVOLUTION/loop-state.json')).get('live_url',''))")
[ -n "$LIVE_URL" ] || { echo "REJECT: live_url not set"; exit 1; }

ROUTES_JSON="$EVOLUTION/route-list.json"
CAP="${ROUTE_CAP:-20}"

# Build route list via python (curl + parse)
python3 - "$LIVE_URL" "$ROUTES_JSON" "$CAP" <<'PYEOF'
import json, sys, re, urllib.request

live_url = sys.argv[1].rstrip('/')
out_path = sys.argv[2]
cap = int(sys.argv[3])

def fetch(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'web-evolve/1.0'})
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.read().decode('utf-8', errors='ignore')
    except Exception:
        return ''

routes = []
source = None

# Try sitemap.xml
sitemap = fetch(live_url + '/sitemap.xml')
if sitemap and '<loc>' in sitemap:
    for m in re.finditer(r'<loc>([^<]+)</loc>', sitemap):
        url = m.group(1).strip()
        slug = url.replace(live_url, '') or '/'
        slug = slug.split('#')[0].split('?')[0]
        if slug not in routes:
            routes.append(slug)
    source = 'sitemap'

# Fallback: homepage crawl
if not routes:
    home = fetch(live_url)
    for m in re.finditer(r'href="([^"]+)"', home):
        url = m.group(1)
        if url.startswith(live_url) or url.startswith('/'):
            slug = url.replace(live_url, '') if url.startswith(live_url) else url
            slug = slug.split('#')[0].split('?')[0]
            if slug and slug not in routes:
                routes.append(slug)
    source = 'crawl'

routes = routes[:cap]
out = {
    # Canonical field name is `route` (matches per-route-baseline schema).
    # `slug` kept as alias to avoid breaking any older readers.
    'routes': [{'route': r, 'slug': r, 'rank': i} for i, r in enumerate(routes)],
    'count': len(routes), 'capped_at': cap, 'source': source or 'none',
}
with open(out_path, 'w') as f: json.dump(out, f, indent=2)
print(f"enumerated {len(routes)} routes (source={source})")
PYEOF

# Record hash
python3 - "$ROUTES_JSON" "$EVOLUTION/.hashes.json" <<'PYEOF'
import json, hashlib, sys, os
routes_path, hash_path = sys.argv[1], sys.argv[2]
with open(routes_path, 'rb') as f: h = hashlib.sha256(f.read()).hexdigest()
if os.path.exists(hash_path):
    with open(hash_path) as f: raw = json.load(f)
    # Defensive normalize: TasteFetcher prose was historically ambiguous about wrapper vs flat array.
    # Accept either shape on read; always write the wrapper.
    if isinstance(raw, list):
        hd = {'files': raw}
    elif isinstance(raw, dict):
        hd = raw
        if 'files' not in hd: hd['files'] = []
    else:
        hd = {'files': []}
else:
    hd = {'files': []}
files = hd.get('files', [])
files = [e for e in files if e.get('file') != 'route-list.json']
files = [{'file': 'route-list.json', 'sha256': h, 'written_by': 'enumerate-routes.sh'}] + files
hd['files'] = files
with open(hash_path, 'w') as f: json.dump(hd, f, indent=2)
print(f"hash recorded: {h[:12]}")
PYEOF
exit 0
