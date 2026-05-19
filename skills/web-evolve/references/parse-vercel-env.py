#!/usr/bin/env python3
"""Vercel env-scope classifier — extracted from deploy-and-verify.sh for direct testability.

Takes preview JSON, production JSON, and current branch via argv and stdin combinations.
Returns one of: 'OK', 'MISSING:<vars>', 'WRONG_BRANCH:<vars>'.

This is the single source of truth for the env-scope check; deploy-and-verify.sh shells out
to this script rather than embedding the logic inline, so it can be tested via fixtures.

Usage:
  parse-vercel-env.py <preview-json-path> <prod-json-path> <current-branch>
  parse-vercel-env.py --stdin <current-branch>      # reads JSON pair from stdin (preview\\nprod)

Exit codes:
  0 — OK (all required vars present in preview, correctly scoped)
  1 — MISSING or WRONG_BRANCH (one or more vars missing or scoped wrong)
  2 — parse error / usage error
"""
import json
import sys


def classify(preview_envs, prod_envs, current_branch):
    """Return ('OK'|'MISSING'|'WRONG_BRANCH', detail-string).

    Handles JSON shape variants seen in the wild:
    - top-level list of env entries: [{key, target, gitBranch}, ...]
    - top-level dict with 'envs' key: {"envs": [...]}
    - target field: either a string ('preview') or a list (['preview','production'])
    - branch lock: 'gitBranch' or 'branch' (Vercel CLI version drift)
    """
    if isinstance(preview_envs, dict):
        preview_envs = preview_envs.get('envs', [])
    if isinstance(prod_envs, dict):
        prod_envs = prod_envs.get('envs', [])
    if not isinstance(preview_envs, list):
        preview_envs = []
    if not isinstance(prod_envs, list):
        prod_envs = []

    prod_names = {e.get('key') for e in prod_envs if isinstance(e, dict) and e.get('key')}
    preview_map = {e.get('key'): e for e in preview_envs if isinstance(e, dict) and e.get('key')}

    missing = []
    branch_scoped = []
    for name in prod_names:
        pv = preview_map.get(name)
        if pv is None:
            missing.append(name)
            continue
        target = pv.get('target', [])
        if isinstance(target, str):
            target = [target]
        git_branch = pv.get('gitBranch') or pv.get('branch')
        if git_branch and git_branch != current_branch:
            branch_scoped.append(f"{name}:branch={git_branch}")

    if missing:
        return ('MISSING', ','.join(sorted(missing)))
    if branch_scoped:
        return ('WRONG_BRANCH', ','.join(sorted(branch_scoped)))
    return ('OK', '')


def main():
    if len(sys.argv) < 3:
        print(__doc__, file=sys.stderr)
        sys.exit(2)

    if sys.argv[1] == '--stdin':
        current_branch = sys.argv[2]
        raw = sys.stdin.read()
        try:
            parts = raw.split('\n---\n')
            if len(parts) != 2:
                print("REJECT: stdin must contain two JSON docs separated by '\\n---\\n' line", file=sys.stderr)
                sys.exit(2)
            preview_envs = json.loads(parts[0])
            prod_envs = json.loads(parts[1])
        except Exception as e:
            print(f"REJECT: stdin JSON parse failed: {e}", file=sys.stderr)
            sys.exit(2)
    else:
        if len(sys.argv) < 4:
            print("USAGE: parse-vercel-env.py <preview-json> <prod-json> <current-branch>", file=sys.stderr)
            sys.exit(2)
        try:
            with open(sys.argv[1]) as f:
                preview_envs = json.load(f)
            with open(sys.argv[2]) as f:
                prod_envs = json.load(f)
            current_branch = sys.argv[3]
        except Exception as e:
            print(f"REJECT: file read failed: {e}", file=sys.stderr)
            sys.exit(2)

    verdict, detail = classify(preview_envs, prod_envs, current_branch)
    if verdict == 'OK':
        print('OK')
        sys.exit(0)
    print(f"{verdict}:{detail}")
    sys.exit(1)


if __name__ == '__main__':
    main()
