#!/usr/bin/env python3
"""
export_few_shots.py — Read curated verdicts from check_catalog and emit
one few-shot block per suite. Paste each block into the corresponding n8n
suite workflow's system prompt under "## Known patterns from QA".

Usage:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python export_few_shots.py
  # outputs to ./few-shots/<suite>.md

Reads:
  check_catalog WHERE review_status IN ('verified_true', 'false_positive', 'context_dependent')

Writes:
  ./few-shots/marketing.md
  ./few-shots/technical.md
  ... (one per suite that has curated checks)
  ./few-shots/_summary.md       (per-suite counts + last-export timestamp)
"""

import json
import os
import sys
import urllib.request
import urllib.parse
from datetime import datetime
from pathlib import Path

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://nstpbwflegwmknwcmsey.supabase.co").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("AUDITHQ_LEGACY_SERVICE_KEY")
OUT_DIR = Path(os.environ.get("OUT_DIR", "./few-shots"))


def fetch_curated() -> list[dict]:
    if not SERVICE_KEY:
        sys.exit("ERROR: SUPABASE_SERVICE_ROLE_KEY not set")
    qs = urllib.parse.urlencode({
        "select": "check_id,suite,category,default_severity,review_status,review_note,fp_pattern,verified_fix,reviewed_at",
        "review_status": "in.(verified_true,false_positive,context_dependent)",
        "active": "eq.true",
        "order": "suite.asc,review_status.asc,check_id.asc",
    })
    url = f"{SUPABASE_URL}/rest/v1/check_catalog?{qs}"
    req = urllib.request.Request(url, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def render_block(suite: str, rows: list[dict]) -> str:
    fps = [r for r in rows if r["review_status"] == "false_positive"]
    trues = [r for r in rows if r["review_status"] == "verified_true"]
    ctx = [r for r in rows if r["review_status"] == "context_dependent"]

    out: list[str] = []
    out.append(f"# Known patterns from QA — suite: {suite}")
    out.append("")
    out.append(f"_Auto-generated from check_catalog on {datetime.utcnow().strftime('%Y-%m-%d %H:%MZ')}._")
    out.append(f"_Paste this block into the n8n {suite} suite workflow system prompt._")
    out.append("")

    if fps:
        out.append("## Known false positives — DO NOT emit these findings")
        out.append("")
        for r in fps:
            out.append(f"- **{r['check_id']}** — {r.get('fp_pattern') or r.get('review_note') or '(no pattern recorded)'}")
        out.append("")

    if trues:
        out.append("## Canonical fixes — when these checks fire, use this recommendation verbatim")
        out.append("")
        for r in trues:
            fix = (r.get("verified_fix") or "").strip()
            if not fix:
                continue
            out.append(f"### {r['check_id']} (severity: {r.get('default_severity', '?')})")
            out.append("")
            out.append(fix)
            out.append("")

    if ctx:
        out.append("## Context-dependent checks — apply judgement")
        out.append("")
        for r in ctx:
            note = r.get("review_note") or "(no context recorded)"
            out.append(f"- **{r['check_id']}** — {note}")
        out.append("")

    return "\n".join(out)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = fetch_curated()
    if not rows:
        print("No curated verdicts yet — nothing to export. Run `/findings-review` first.")
        return

    by_suite: dict[str, list[dict]] = {}
    for r in rows:
        by_suite.setdefault(r["suite"], []).append(r)

    summary_lines = ["# Curated verdicts export — summary", ""]
    summary_lines.append(f"_Generated {datetime.utcnow().strftime('%Y-%m-%d %H:%MZ')}_")
    summary_lines.append("")
    summary_lines.append("| Suite | Verified true | False positive | Context-dependent | Total |")
    summary_lines.append("|---|---|---|---|---|")

    for suite, suite_rows in sorted(by_suite.items()):
        block = render_block(suite, suite_rows)
        path = OUT_DIR / f"{suite}.md"
        path.write_text(block, encoding="utf-8")
        t = sum(1 for r in suite_rows if r["review_status"] == "verified_true")
        f = sum(1 for r in suite_rows if r["review_status"] == "false_positive")
        c = sum(1 for r in suite_rows if r["review_status"] == "context_dependent")
        summary_lines.append(f"| {suite} | {t} | {f} | {c} | {len(suite_rows)} |")
        print(f"wrote {path} ({len(suite_rows)} rows)")

    (OUT_DIR / "_summary.md").write_text("\n".join(summary_lines), encoding="utf-8")
    print(f"\nSummary at {OUT_DIR / '_summary.md'}")
    print(f"Paste each suite block into the matching n8n workflow's system prompt.")


if __name__ == "__main__":
    main()
