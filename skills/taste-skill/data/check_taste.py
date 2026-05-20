#!/usr/bin/env python
"""
Scan a file (HTML/JSX/TSX/CSS/MD) for taste-rule violations.
Usage:
  python check_taste.py <path-to-file>
  python check_taste.py <path> --severity banned
  python check_taste.py <path> --category color,typography
  python check_taste.py --list                          # dump all rules
  python check_taste.py --rule inter-banned             # show one rule
Exit codes:
  0 = no banned-severity hits (warnings allowed)
  1 = banned-severity hit found
  2 = file unreadable / CSV missing
"""

from __future__ import annotations
import argparse
import csv
import io
import json
import re
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

CSV_PATH = Path(__file__).parent / "taste-rules.csv"


def load_rules() -> list[dict]:
    if not CSV_PATH.exists():
        print(f"[check_taste] taste-rules.csv missing at {CSV_PATH}", file=sys.stderr)
        sys.exit(2)
    with CSV_PATH.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def scan(text: str, rules: list[dict]) -> list[dict]:
    hits = []
    for r in rules:
        pat = r.get("anti_pattern_keywords", "").strip()
        if not pat:
            continue
        try:
            rgx = re.compile(pat, re.IGNORECASE)
        except re.error:
            continue
        m = rgx.search(text)
        if m:
            hits.append({
                "id": r["id"],
                "severity": r["severity"],
                "category": r["category"],
                "rule": r["rule"],
                "matched": m.group(0)[:80],
                "replace_with": r["replace_with"],
                "why": r["why"],
                "source": r["source"],
            })
    return hits


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("path", nargs="?")
    p.add_argument("--severity", help="comma-list filter: banned,caution,required,banned-by-default")
    p.add_argument("--category", help="comma-list filter: color,typography,layout,hero,…")
    p.add_argument("--list", action="store_true", help="dump all rules")
    p.add_argument("--rule", help="show one rule by id")
    p.add_argument("--json", action="store_true", help="JSON output")
    args = p.parse_args()

    rules = load_rules()

    if args.severity:
        wanted = set(args.severity.split(","))
        rules = [r for r in rules if r["severity"] in wanted]
    if args.category:
        wanted = set(args.category.split(","))
        rules = [r for r in rules if r["category"] in wanted]

    if args.rule:
        match = [r for r in rules if r["id"] == args.rule]
        if not match:
            print(f"no rule with id={args.rule}", file=sys.stderr)
            return 2
        print(json.dumps(match[0], indent=2))
        return 0

    if args.list or not args.path:
        if args.json:
            print(json.dumps(rules, indent=2))
        else:
            for r in rules:
                print(f"[{r['severity']:18}] [{r['category']:12}] {r['id']:40}  -> {r['rule']}")
        return 0

    fp = Path(args.path)
    if not fp.exists():
        print(f"[check_taste] file not found: {fp}", file=sys.stderr)
        return 2
    try:
        text = fp.read_text(encoding="utf-8", errors="ignore")
    except OSError as e:
        print(f"[check_taste] read failed: {e}", file=sys.stderr)
        return 2

    hits = scan(text, rules)
    if args.json:
        print(json.dumps(hits, indent=2))
    else:
        if not hits:
            print(f"[PASS] no taste-rule violations in {fp}")
            return 0
        for h in hits:
            print(f"[{h['severity']:18}] {h['id']:40}  matched: {h['matched']!r}")
            print(f"                       rule: {h['rule']}")
            print(f"                       fix:  {h['replace_with']}")
            print()

    banned_hit = any(h["severity"] in {"banned", "banned-by-default"} for h in hits)
    return 1 if banned_hit else 0


if __name__ == "__main__":
    sys.exit(main())
