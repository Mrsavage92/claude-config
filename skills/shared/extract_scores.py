#!/usr/bin/env python3
"""
Audit Score Extractor

Pulls scores from all audit reports in a directory, checks for cross-suite
contradictions, and identifies compounding issues.

Usage:
    python3 scripts/extract_scores.py ./outputs/bdrgroup.co.uk

Outputs:
    - Score summary table
    - Cross-suite contradiction warnings
    - Compounding issue detection
"""

import os
import re
import sys
from collections import defaultdict


SUITE_FILES = {
    "MARKETING-AUDIT.md": "Marketing",
    "TECHNICAL-AUDIT.md": "Technical",
    "GEO-AUDIT-REPORT.md": "GEO",
    "SECURITY-AUDIT.md": "Security",
    "PRIVACY-AUDIT.md": "Privacy",
    "REPUTATION-AUDIT.md": "Reputation",
    "AI-READINESS-AUDIT.md": "AI Readiness",
    "EMPLOYER-AUDIT.md": "Employer Brand",
}

# Facts that might be stated differently across suites — check for conflicts
CROSS_CHECK_PATTERNS = [
    {
        "name": "Trustpilot rating",
        "pattern": r"Trustpilot.*?(\d\.\d)/5",
        "type": "numeric",
    },
    {
        "name": "Trustpilot review count",
        "pattern": r"Trustpilot.*?(\d+)\s*reviews",
        "type": "numeric",
    },
    {
        "name": "Employee count",
        "pattern": r"~?(\d+)[\s-]*(?:\d+)?\s*employees",
        "type": "range",
    },
    {
        "name": "Glassdoor rating",
        "pattern": r"Glassdoor.*?(\d\.\d)/5",
        "type": "numeric",
    },
    {
        "name": "HSTS presence",
        "pattern": r"(HSTS|Strict-Transport-Security).{0,30}(present|enabled|active|missing|absent|not found)",
        "type": "boolean",
    },
    {
        "name": "Cookie consent",
        "pattern": r"cookie consent.{0,30}(present|enabled|active|missing|absent|none|no cookie|zero cookie)",
        "type": "boolean",
    },
]

# Common issues to check across suites for compounding detection
COMPOUNDING_KEYWORDS = [
    ("no cookie consent", "cookie consent"),
    ("no DMARC", "DMARC"),
    ("no llms.txt", "llms.txt"),
    ("no email capture", "email capture"),
    ("no case studies", "case studies"),
    ("no security headers", "security headers"),
    ("review response", "review response"),
    ("placeholder text", "placeholder"),
    ("WordPress outdated", "WordPress"),
]


def extract_score(content):
    """Extract overall score from report content."""
    for pattern in [
        r"(?:Overall|Score|Health)[^:\n]*?:\s*\**(\d+)/100",
        r"\*\*(\d+)/100\b",
        r"(\d+)/100\s*\(?Grade",
    ]:
        m = re.search(pattern, content[:1500], re.IGNORECASE)
        if m:
            v = int(m.group(1))
            if 0 <= v <= 100:
                return v
    return None


def extract_grade(score):
    if score >= 85: return "A"
    if score >= 70: return "B"
    if score >= 55: return "C"
    if score >= 40: return "D"
    return "F"


def check_cross_suite(reports):
    """Check for contradictions across suites."""
    contradictions = []

    for check in CROSS_CHECK_PATTERNS:
        findings = {}
        for suite, content in reports.items():
            matches = re.findall(check["pattern"], content, re.IGNORECASE)
            if matches:
                if check["type"] == "numeric":
                    findings[suite] = matches[0] if isinstance(matches[0], str) else matches[0]
                elif check["type"] == "boolean":
                    # Get the status word
                    for m in re.finditer(check["pattern"], content, re.IGNORECASE):
                        try:
                            status = m.group(2).lower()
                        except (IndexError, AttributeError):
                            continue
                        is_present = status in ("present", "enabled", "active")
                        findings[suite] = is_present
                        break

        if len(findings) >= 2:
            values = list(findings.values())
            if check["type"] == "numeric":
                unique = set(str(v) for v in values)
                if len(unique) > 1:
                    detail = ", ".join(f"{s}: {v}" for s, v in findings.items())
                    contradictions.append(f"{check['name']} mismatch: {detail}")
            elif check["type"] == "boolean":
                if True in values and False in values:
                    detail = ", ".join(
                        f"{s}: {'present' if v else 'absent'}" for s, v in findings.items()
                    )
                    contradictions.append(f"{check['name']} conflict: {detail}")

    return contradictions


def find_compounding_issues(reports):
    """Find issues mentioned in 3+ suites."""
    issue_suites = defaultdict(list)

    for label, keyword in COMPOUNDING_KEYWORDS:
        for suite, content in reports.items():
            if keyword.lower() in content.lower():
                issue_suites[label].append(suite)

    return {k: v for k, v in issue_suites.items() if len(v) >= 2}


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/extract_scores.py <directory> [previous_directory]")
        sys.exit(1)

    directory = sys.argv[1]
    previous_dir = sys.argv[2] if len(sys.argv) > 2 else None

    if not os.path.isdir(directory):
        print(f"Error: directory not found: {directory}")
        sys.exit(1)

    reports = {}
    scores = {}

    for filename, suite in SUITE_FILES.items():
        filepath = os.path.join(directory, filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            reports[suite] = content
            score = extract_score(content)
            if score is not None:
                scores[suite] = score

    if not scores:
        print("No scores found in any reports.")
        sys.exit(1)

    # Score summary
    print(f"\n{'='*60}")
    print(f"AUDIT SCORE SUMMARY — {os.path.basename(directory)}")
    print(f"{'='*60}\n")

    for suite in ["Marketing", "Technical", "GEO", "Security", "Privacy",
                   "Reputation", "AI Readiness", "Employer Brand"]:
        if suite in scores:
            score = scores[suite]
            grade = extract_grade(score)
            bar = "#" * (score // 5) + "." * (20 - score // 5)
            print(f"  {suite:20s}  {score:3d}/100  {grade}  [{bar}]")

    avg = sum(scores.values()) // len(scores) if scores else 0
    print(f"\n  {'Weighted Average':20s}  {avg:3d}/100  {extract_grade(avg)}")

    # Previous comparison
    if previous_dir and os.path.isdir(previous_dir):
        print(f"\n{'='*60}")
        print("COMPARISON WITH PREVIOUS AUDIT")
        print(f"{'='*60}\n")

        prev_scores = {}
        for filename, suite in SUITE_FILES.items():
            filepath = os.path.join(previous_dir, filename)
            if os.path.exists(filepath):
                with open(filepath, "r", encoding="utf-8") as f:
                    prev_content = f.read()
                prev_score = extract_score(prev_content)
                if prev_score is not None:
                    prev_scores[suite] = prev_score

        for suite in scores:
            if suite in prev_scores:
                curr = scores[suite]
                prev = prev_scores[suite]
                delta = curr - prev
                arrow = "+" if delta > 0 else ""
                flag = " *** INVESTIGATE" if abs(delta) > 10 else ""
                print(f"  {suite:20s}  {prev:3d} -> {curr:3d}  ({arrow}{delta}){flag}")

    # Cross-suite contradictions
    if len(reports) >= 2:
        print(f"\n{'='*60}")
        print("CROSS-SUITE CONSISTENCY CHECK")
        print(f"{'='*60}\n")

        contradictions = check_cross_suite(reports)
        if contradictions:
            for c in contradictions:
                print(f"  WARNING: {c}")
        else:
            print("  No contradictions detected.")

    # Compounding issues
    if len(reports) >= 2:
        print(f"\n{'='*60}")
        print("COMPOUNDING ISSUES (mentioned in 2+ suites)")
        print(f"{'='*60}\n")

        compounding = find_compounding_issues(reports)
        if compounding:
            for issue, suites in sorted(compounding.items(), key=lambda x: -len(x[1])):
                print(f"  [{len(suites)} suites] {issue}")
                print(f"           Found in: {', '.join(suites)}")
        else:
            print("  No compounding issues detected.")

    print()


if __name__ == "__main__":
    main()
