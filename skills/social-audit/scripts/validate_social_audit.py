#!/usr/bin/env python3
"""
validate_social_audit.py — Social-audit-specific report validator.

Checks a SOCIAL-AUDIT.md for enterprise-quality requirements beyond
what the generic validate_reports.py covers.

Usage:
    python3 validate_social_audit.py ./outputs/glossbeauty.com.au/SOCIAL-AUDIT.md

Exit codes:
    0 = PASS (all checks pass)
    1 = WARN (non-critical issues)
    2 = FAIL (blocking issues)
"""

import sys
import re
import os
import io

# Force UTF-8 on Windows — CP1252 can't handle emoji
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def load(path):
    with open(path, encoding='utf-8', errors='ignore') as f:
        return f.read()

def check(name, condition, level, message):
    status = "PASS" if condition else level
    symbol = "[OK]" if condition else ("[WARN]" if level == "WARN" else "[FAIL]")
    print(f"  {symbol} {name}: {message if not condition else 'OK'}")
    return condition

def main():
    if len(sys.argv) < 2:
        print("Usage: validate_social_audit.py <path/to/SOCIAL-AUDIT.md>")
        sys.exit(1)

    path = sys.argv[1]
    if not os.path.exists(path):
        print(f"❌ File not found: {path}")
        sys.exit(2)

    text = load(path)
    lines = text.split('\n')
    failures = 0
    warnings = 0

    print(f"\n{'='*60}")
    print(f"SOCIAL AUDIT VALIDATOR")
    print(f"File: {path}")
    print(f"Lines: {len(lines)}")
    print(f"{'='*60}\n")

    # ── SECTION 1: Required sections ─────────────────────────────
    print("[ Required Sections ]")
    required = [
        ("Executive Summary", r'## Executive Summary'),
        ("Score Breakdown table", r'\| Presence Breadth'),
        ("Platform Verdict Summary", r'Platform Verdict Summary'),
        ("Fix Immediately section", r'🔴|Fix Immediately'),
        ("Fix This Month section", r'🟠|Fix This Month'),
        ("Plan for Next Quarter", r'🟡|Next Quarter'),
        ("Per-Platform Deep Dive", r'Per-Platform Deep Dive|## Per-Platform'),
        ("Content Mechanics Analysis", r'Content Mechanics'),
        ("Engagement & Community", r'Engagement.*Community|Community.*Engagement'),
        ("Paid Creative Teardown", r'Paid Creative Teardown'),
        ("Competitor Benchmark table", r'Competitor Benchmark'),
        ("90-Day Playbook", r'90.Day Playbook'),
        ("Audience Impact Summary", r'Audience Impact'),
        ("Next Steps", r'## Next Steps'),
    ]
    for name, pattern in required:
        ok = bool(re.search(pattern, text, re.IGNORECASE))
        if not check(name, ok, "FAIL", f"Missing required section"):
            failures += 1

    # ── SECTION 2: Score quality ──────────────────────────────────
    print("\n[ Score Quality ]")

    composite = re.search(r'(?:TOTAL|Overall|Composite)[^\d]*(\d+)/100', text, re.IGNORECASE)
    ok = bool(composite)
    if not check("Composite score present", ok, "FAIL", "No X/100 score found"):
        failures += 1
    else:
        score = int(composite.group(1))
        # Sanity check: if score < 10 warn — may be Gloss Beauty class error
        if score < 10:
            print(f"  ⚠️  [WARN] Score is {score}/100 — extremely low. Verify discovery phase ran correctly.")
            warnings += 1

    # All 8 categories must appear with scores
    categories = [
        'Presence Breadth', 'Profile Quality', 'Activity', 'Content Quality',
        'Engagement Depth', 'Platform-Fit', 'Competitive Position', 'Brand Consistency'
    ]
    for cat in categories:
        ok = bool(re.search(rf'{cat}.*?\d+/100|\d+/100.*?{cat}', text, re.IGNORECASE))
        if not check(f"Category score: {cat}", ok, "WARN", "Score not found"):
            warnings += 1

    # ── SECTION 3: Platform verdicts ─────────────────────────────
    print("\n[ Platform Coverage ]")
    platforms = ['LinkedIn', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Pinterest']
    verdicts = ['KEEP', 'FIX', 'START', 'KILL', 'DEFEND']
    for platform in platforms:
        has_verdict = any(
            re.search(rf'{platform}.*?({"|".join(verdicts)})|({"|".join(verdicts)}).*?{platform}', text, re.IGNORECASE)
            for v in verdicts
        )
        ok = bool(re.search(rf'{platform}', text, re.IGNORECASE))
        if not check(f"Platform mentioned: {platform}", ok, "WARN", "Platform not found in report"):
            warnings += 1

    # ── SECTION 4: Data quality markers ──────────────────────────
    print("\n[ Data Quality ]")

    # Check for follower counts (at least one platform should have a number)
    has_follower_counts = bool(re.search(r'[\d,]+\s*followers?', text, re.IGNORECASE))
    if not check("Follower counts present", has_follower_counts, "WARN",
                 "No follower counts found — data may be absent"):
        warnings += 1

    # Check for estimated tags (scope transparency)
    has_estimated = bool(re.search(r'estimated|<!-- Estimated|scope.*note|data.*unavailable',
                                   text, re.IGNORECASE))
    # Estimated tags are GOOD — their absence may mean scope not noted
    if not has_estimated:
        print("  ⚠️  [WARN] Scope: No 'estimated' markers found. If Puppeteer wasn't used, add scope notes.")
        warnings += 1
    else:
        print("  ✅ [PASS] Scope: Estimated markers present — good scope transparency")

    # Check for screenshot references
    has_screenshots = bool(re.search(r'screenshot|\.png|\.jpg|ig_.*_profile|fb_.*_profile',
                                     text, re.IGNORECASE))
    if not check("Screenshot evidence", has_screenshots, "WARN",
                 "No screenshot references — enterprise audits should include visual evidence"):
        warnings += 1

    # Check competitor benchmark has at least one real competitor
    comp_table = re.search(r'Competitor Benchmark[\s\S]{0,2000}(\|.*?\|.*?\|)', text, re.IGNORECASE)
    if not check("Competitor benchmark populated", bool(comp_table), "WARN",
                 "Competitor table appears empty"):
        warnings += 1

    # ── SECTION 5: Actionability ──────────────────────────────────
    print("\n[ Actionability ]")

    action_items = len(re.findall(r'\*\s+\[.*?\]|\d+\.\s+\*\*Have |\*\s+\*\*Have ', text))
    ok = action_items >= 5
    if not check(f"Action items ({action_items} found)", ok, "WARN",
                 "Fewer than 5 action items found"):
        warnings += 1

    has_owners = bool(re.search(r'Have (Louise|the|your) \w+|social manager|Louise|owner', text, re.IGNORECASE))
    if not check("Action items name WHO does them", has_owners, "WARN",
                 "Actions should name the responsible person"):
        warnings += 1

    has_time_estimates = bool(re.search(r'\d+\s*(?:min|hour|hr|day|week)', text, re.IGNORECASE))
    if not check("Action items include time estimates", has_time_estimates, "WARN",
                 "Actions should include time estimates"):
        warnings += 1

    # ── SECTION 6: Report length ──────────────────────────────────
    print("\n[ Report Length ]")
    ok = len(lines) >= 150
    if not check(f"Report length ({len(lines)} lines)", ok, "FAIL",
                 "Report is too short — enterprise minimum is 150 lines"):
        failures += 1

    word_count = len(text.split())
    ok = word_count >= 1500
    if not check(f"Word count ({word_count} words)", ok, "WARN",
                 "Enterprise reports typically exceed 1,500 words"):
        warnings += 1

    # ── SUMMARY ───────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"RESULT: {'❌ FAIL' if failures > 0 else '⚠️  WARN' if warnings > 0 else '✅ PASS'}")
    print(f"  Failures: {failures}")
    print(f"  Warnings: {warnings}")
    print(f"{'='*60}\n")

    if failures > 0:
        print("Fix all FAIL items before delivering this report.")
        sys.exit(2)
    elif warnings > 0:
        print("Report passes but has warnings. Review before delivering.")
        sys.exit(1)
    else:
        print("Report passes all enterprise quality checks.")
        sys.exit(0)

if __name__ == '__main__':
    main()
