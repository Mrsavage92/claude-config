#!/usr/bin/env python3
"""
Audit Report Markdown Validator

Checks generated markdown reports against their suite's required section list
before PDF generation. Catches thin or incomplete reports early.

Usage:
    python3 scripts/validate_reports.py ./outputs/bdrgroup.co.uk

Exit codes:
    0 = all reports pass
    1 = one or more reports have issues
"""

import os
import re
import sys

# Required sections per suite — must match the template compliance checklists in each skill
SUITE_REQUIREMENTS = {
    "MARKETING-AUDIT.md": {
        "suite": "Marketing",
        "min_lines": 150,
        "required_sections": [
            "Executive Summary",
            "Score Breakdown",
            "Quick Wins",
            "Strategic Recommendations",
            "Long-Term",
            "Detailed Analysis",
            "Competitor",
            "Revenue Impact",
            "Next Steps",
        ],
    },
    "TECHNICAL-AUDIT.md": {
        "suite": "Technical",
        "min_lines": 150,
        "required_sections": [
            "Executive Summary",
            "Score Breakdown",
            "Critical Issues",
            "Quick Wins",
            "Strategic Recommendations",
            "Detailed Analysis",
            "Tool Recommendations",
            "Next Steps",
        ],
    },
    "GEO-AUDIT-REPORT.md": {
        "suite": "GEO",
        "min_lines": 150,
        "required_sections": [
            "Executive Summary",
            "Critical Issues",
            "High Priority",
            "Medium Priority",
            "Category Deep Dive",
            "Quick Wins",
            "30-Day Action Plan",
        ],
    },
    "SECURITY-AUDIT.md": {
        "suite": "Security",
        "min_lines": 150,
        "required_sections": [
            "Executive Summary",
            "Score Breakdown",
            "Critical Issues",
            "Quick Wins",
            "Email Authentication",
            "Security Headers",
            "Third-Party Script",
            "Next Steps",
        ],
    },
    "PRIVACY-AUDIT.md": {
        "suite": "Privacy",
        "min_lines": 150,
        "required_sections": [
            "Executive Summary",
            "Score Breakdown",
            "Data Map",
            "Critical Issues",
            "Quick Wins",
            "Privacy Policy",
            "Cookie Consent",
            "Next Steps",
        ],
    },
    "REPUTATION-AUDIT.md": {
        "suite": "Reputation",
        "min_lines": 150,
        "required_sections": [
            "Executive Summary",
            "Platform",
            "Score Breakdown",
            "Critical Issues",
            "Quick Wins",
            "Review Response",
            "Competitor",
            "Next Steps",
        ],
    },
    "AI-READINESS-AUDIT.md": {
        "suite": "AI Readiness",
        "min_lines": 150,
        "required_sections": [
            "Executive Summary",
            "Score Breakdown",
            "Current AI Adoption",
            "30/60/90",
            "Automation Opportunity",
            "Competitive AI",
            "ROI Summary",
            "Data Map",
            "Key Findings",
            "Next Steps",
        ],
    },
    "EMPLOYER-AUDIT.md": {
        "suite": "Employer Brand",
        "min_lines": 150,
        "required_sections": [
            "Executive Summary",
            "Score Breakdown",
            "Quick Wins",
            "Strategic Recommendations",
            "Long-Term",
            "Detailed Analysis",
            "Review Response",
            "Competitor",
            "Next Steps",
        ],
    },
}

# Evidence tags that must appear in every report
EVIDENCE_TAGS = ["Confirmed", "Strong inference"]


def validate_report(filepath, requirements):
    """Validate a single report. Returns (pass, issues)."""
    issues = []
    suite = requirements["suite"]

    if not os.path.exists(filepath):
        return False, [f"File missing: {os.path.basename(filepath)}"]

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.split("\n")
    line_count = len(lines)

    # Check minimum length
    min_lines = requirements["min_lines"]
    if line_count < min_lines:
        issues.append(f"Too short: {line_count} lines (minimum {min_lines})")

    # Check required sections
    headers = [line.strip() for line in lines if line.strip().startswith("## ")]
    header_text = " | ".join(headers).lower()

    for section in requirements["required_sections"]:
        if section.lower() not in header_text:
            issues.append(f"Missing section: {section}")

    # Check score is present
    score_match = re.search(r"(\d+)/100", content[:1000])
    if not score_match:
        issues.append("No score found (expected X/100 in first 1000 chars)")
    else:
        score = int(score_match.group(1))
        if score < 0 or score > 100:
            issues.append(f"Invalid score: {score}")

    # Check evidence tagging
    has_confirmed = "confirmed" in content.lower()
    has_inference = "strong inference" in content.lower()
    if not has_confirmed:
        issues.append("No [Confirmed] evidence tags found")
    if not has_inference and line_count > 200:
        issues.append("No [Strong inference] tags (expected in reports > 200 lines)")

    # Check for hardcoded paths
    if re.search(r"C:\\Users\\|/Users/\w+/|~/Documents/", content):
        issues.append("Contains hardcoded user path")

    return len(issues) == 0, issues


def validate_directory(directory):
    """Validate all reports in a directory."""
    if not os.path.isdir(directory):
        print(f"Error: directory not found: {directory}")
        sys.exit(1)

    print(f"Validating reports in: {directory}\n")

    total_pass = 0
    total_fail = 0
    all_issues = {}

    # Check which reports exist
    found_reports = []
    for filename in SUITE_REQUIREMENTS:
        filepath = os.path.join(directory, filename)
        if os.path.exists(filepath):
            found_reports.append(filename)

    if not found_reports:
        print("No audit reports found in directory.")
        sys.exit(1)

    print(f"Found {len(found_reports)} report(s)\n")

    for filename in found_reports:
        filepath = os.path.join(directory, filename)
        requirements = SUITE_REQUIREMENTS[filename]
        suite = requirements["suite"]

        passed, issues = validate_report(filepath, requirements)

        if passed:
            line_count = sum(1 for _ in open(filepath, encoding="utf-8"))
            score_match = re.search(r"(\d+)/100", open(filepath, encoding="utf-8").read()[:1000])
            score = score_match.group(0) if score_match else "?"
            print(f"  PASS  {suite:20s}  {line_count:4d} lines  {score}")
            total_pass += 1
        else:
            print(f"  FAIL  {suite:20s}  {len(issues)} issue(s):")
            for issue in issues:
                print(f"          - {issue}")
            total_fail += 1
            all_issues[suite] = issues

    # Cross-suite score check
    print(f"\n{'='*60}")
    scores = {}
    for filename in found_reports:
        filepath = os.path.join(directory, filename)
        suite = SUITE_REQUIREMENTS[filename]["suite"]
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        score_match = re.search(r"(\d+)/100", content[:1000])
        if score_match:
            scores[suite] = int(score_match.group(1))

    if scores:
        print("\nScore Summary:")
        for suite, score in sorted(scores.items(), key=lambda x: x[1]):
            bar = "#" * (score // 5) + "." * (20 - score // 5)
            grade = "A" if score >= 85 else "B" if score >= 70 else "C" if score >= 55 else "D" if score >= 40 else "F"
            print(f"  {suite:20s}  {score:3d}/100  {grade}  [{bar}]")

        avg = sum(scores.values()) // len(scores)
        print(f"\n  {'Average':20s}  {avg:3d}/100")

    print(f"\n{'='*60}")
    print(f"Result: {total_pass} passed, {total_fail} failed out of {len(found_reports)} reports")

    return total_fail == 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/validate_reports.py <directory>")
        print("Example: python3 scripts/validate_reports.py ./outputs/bdrgroup.co.uk")
        sys.exit(1)

    success = validate_directory(sys.argv[1])
    sys.exit(0 if success else 1)
