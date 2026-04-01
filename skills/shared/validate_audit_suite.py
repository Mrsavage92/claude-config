#!/usr/bin/env python3
"""
Audit Suite Validation Script

Checks the audit suite repo for common regressions and configuration errors.
Run this after any change to skills, commands, or scripts.

Usage:
    python3 scripts/validate_audit_suite.py

Exit codes:
    0 = all checks passed
    1 = one or more checks failed
"""

import os
import re
import sys
import json

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── Expected structure ───────────────────────────────────────────────────────
REQUIRED_SUITES = [
    ("marketing",      "market",          "market-audit",      "market-report-pdf"),
    ("technical",      "techaudit",       "techaudit-audit",   "techaudit-report-pdf"),
    ("geo",            "geo",             "geo-audit",         "geo-report-pdf"),
    ("security",       "security",        "security-audit",    "security-report-pdf"),
    ("privacy",        "privacy",         "privacy-audit",     "privacy-report-pdf"),
    ("reputation",     "reputation",      "reputation-audit",  "reputation-report-pdf"),
    ("ai-readiness",   "ai-ready",        "ai-ready-audit",    "ai-ready-report-pdf"),
    ("employer-brand", "employer",        "employer-audit",    "employer-report-pdf"),
]

REQUIRED_FILES = [
    "commands/audit.md",
    "scripts/audit_pdf_engine.py",
    "scripts/generate_suite_pdfs.py",
    "scripts/validate_reports.py",
    "scripts/extract_scores.py",
    "docs/audit-pdf-design-lock.md",
]

# Paths that should NEVER appear in skills/commands (hardcoded user paths)
FORBIDDEN_PATH_PATTERNS = [
    r"C:\\Users\\[^\\]+\\",
    r"/Users/[^/]+/",
    r"/home/[^/]+/",
    r"~/.claude/",
    r"%USERPROFILE%",
    r"\$HOME/",
]

# ── Checks ───────────────────────────────────────────────────────────────────
errors = []
warnings = []


def error(msg):
    errors.append(f"  FAIL: {msg}")


def warn(msg):
    warnings.append(f"  WARN: {msg}")


def check(label, condition, fail_msg):
    if not condition:
        error(fail_msg)


# 1. Required files exist
print("1. Checking required files...")
for f in REQUIRED_FILES:
    path = os.path.join(REPO_ROOT, f)
    check(f, os.path.exists(path), f"Missing required file: {f}")

# 2. All suite skills exist
print("2. Checking suite skills...")
for suite_name, orchestrator, audit_engine, pdf_skill in REQUIRED_SUITES:
    for skill_dir in [orchestrator, audit_engine, pdf_skill]:
        skill_path = os.path.join(REPO_ROOT, "skills", skill_dir, "SKILL.md")
        check(skill_dir, os.path.exists(skill_path),
              f"Missing skill: skills/{skill_dir}/SKILL.md (suite: {suite_name})")

# 3. PDF engine scripts are valid Python (basic syntax check)
print("3. Checking PDF engine script syntax...")
for script_name in ["audit_pdf_engine.py", "generate_suite_pdfs.py"]:
    script_path = os.path.join(REPO_ROOT, "scripts", script_name)
    if os.path.exists(script_path):
        try:
            with open(script_path, "r", encoding="utf-8") as f:
                compile(f.read(), script_path, "exec")
        except SyntaxError as e:
            error(f"{script_name} has syntax error: {e}")
    else:
        error(f"PDF engine script missing: {script_name}")

# 4. Design lock file exists and has required sections
print("4. Checking design lock document...")
design_lock_path = os.path.join(REPO_ROOT, "docs", "audit-pdf-design-lock.md")
if os.path.exists(design_lock_path):
    with open(design_lock_path, "r", encoding="utf-8") as f:
        content = f.read()
    required_sections = [
        "Suite Accent Colors",
        "Typography",
        "Score Color Rules",
        "Bar Chart Spec",
        "Severity Coding",
        "Evidence Status Tags",
        "Hardening Rules",
        "JSON Input Schema",
    ]
    for section in required_sections:
        check(section, section in content,
              f"Design lock missing section: {section}")
else:
    error("Design lock file does not exist")

# 5. No hardcoded user paths in audit-related skills or commands
print("5. Checking for hardcoded paths in audit files...")
# Only check audit-related files — other commands legitimately reference ~/.claude/
AUDIT_FILES_TO_CHECK = [
    "commands/audit.md",
    "commands/parallel-audit.md",
]
for suite_name, orchestrator, audit_engine, pdf_skill in REQUIRED_SUITES:
    for skill_dir in [orchestrator, audit_engine, pdf_skill]:
        AUDIT_FILES_TO_CHECK.append(f"skills/{skill_dir}/SKILL.md")

for rel_path in AUDIT_FILES_TO_CHECK:
    fpath = os.path.join(REPO_ROOT, rel_path)
    if not os.path.exists(fpath):
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        text = f.read()
    for pattern in FORBIDDEN_PATH_PATTERNS:
        # Find actual path usages, not documentation examples
        for match in re.finditer(pattern, text):
            line_start = text.rfind("\n", 0, match.start()) + 1
            line_end = text.find("\n", match.end())
            line = text[line_start:line_end if line_end != -1 else len(text)]
            # Skip lines that are documentation examples (contain "e.g.", "never", "don't", backticks around the path)
            if any(skip in line.lower() for skip in ["e.g.", "never", "don't", "avoid", "example"]):
                continue
            if "`" in line and line.count("`") >= 2:
                # Path is inside backticks — likely a documentation example
                continue
            error(f"Hardcoded path in {rel_path}: {match.group()}...")

# Also check the engine scripts for hardcoded paths
for script_name in ["audit_pdf_engine.py", "generate_suite_pdfs.py"]:
    script_path = os.path.join(REPO_ROOT, "scripts", script_name)
    if os.path.exists(script_path):
        with open(script_path, "r", encoding="utf-8") as f:
            script_text = f.read()
        for pattern in FORBIDDEN_PATH_PATTERNS:
            # Skip font path references (C:/Windows/Fonts is legitimate)
            matches = [m for m in re.findall(pattern, script_text) if "Windows/Fonts" not in m and "Windows\\Fonts" not in m]
            if matches:
                error(f"Hardcoded path in {script_name}: {matches[0]}...")

# 6. PDF skills reference the production engine correctly
print("6. Checking PDF skill engine references...")
for suite_name, _, _, pdf_skill in REQUIRED_SUITES:
    skill_path = os.path.join(REPO_ROOT, "skills", pdf_skill, "SKILL.md")
    if os.path.exists(skill_path):
        with open(skill_path, "r", encoding="utf-8") as f:
            content = f.read()
        check(pdf_skill,
              "generate_suite_pdfs" in content or "audit_pdf_engine" in content,
              f"PDF skill {pdf_skill} doesn't reference the production PDF engine")

# 7. Audit command has numbered menu
print("7. Checking audit command menu...")
audit_cmd_path = os.path.join(REPO_ROOT, "commands", "audit.md")
if os.path.exists(audit_cmd_path):
    with open(audit_cmd_path, "r", encoding="utf-8") as f:
        content = f.read()
    check("menu", "1. Marketing" in content, "Audit command missing numbered menu")
    check("menu", "8. Employer Brand" in content, "Audit command missing suite 8")
    check("comma-separated", "comma" in content.lower() or "1,3,4,5" in content,
          "Audit command missing comma-separated selection support")
    check("all", '"all"' in content or "'all'" in content or "`all`" in content,
          "Audit command missing 'all' selection support")
    check("full audit rule", "Full Audit is Explicit" in content or "full audit" in content.lower(),
          "Audit command missing full audit explicit-only rule")
else:
    error("Audit command does not exist")

# 8. Full audit is not auto-triggered
print("8. Checking full audit isolation...")
audit_cmd_path = os.path.join(REPO_ROOT, "commands", "audit.md")
if os.path.exists(audit_cmd_path):
    with open(audit_cmd_path, "r", encoding="utf-8") as f:
        content = f.read()
    # Should contain the explicit-only rule
    check("explicit",
          "explicit" in content.lower() and "combined" in content.lower(),
          "Audit command doesn't clearly state full audit is explicit-only")

# 9. Suite audit flows end in PDF
print("9. Checking suite audit flows end in PDF...")
for suite_name, orchestrator, audit_engine, pdf_skill in REQUIRED_SUITES:
    orch_path = os.path.join(REPO_ROOT, "skills", orchestrator, "SKILL.md")
    if os.path.exists(orch_path):
        with open(orch_path, "r", encoding="utf-8") as f:
            content = f.read()
        check(f"{orchestrator} PDF ref",
              "pdf" in content.lower() or "report-pdf" in content.lower(),
              f"Suite orchestrator {orchestrator} doesn't reference PDF generation")

# 10. Engine has all suite definitions
print("10. Checking engine suite coverage...")
engine_path = os.path.join(REPO_ROOT, "scripts", "audit_pdf_engine.py")
if os.path.exists(engine_path):
    with open(engine_path, "r", encoding="utf-8") as f:
        content = f.read()
    for name_in_engine in ["Marketing", "Technical", "GEO", "Security", "Privacy", "Reputation", "Employer Brand", "AI Readiness"]:
        check(f"engine-{name_in_engine}",
              f'"{name_in_engine}"' in content,
              f"Engine missing suite: {name_in_engine}")

# ── Report ───────────────────────────────────────────────────────────────────
print()
print("=" * 60)
print("AUDIT SUITE VALIDATION REPORT")
print("=" * 60)

if errors:
    print(f"\n{len(errors)} ERROR(S):")
    for e in errors:
        print(e)

if warnings:
    print(f"\n{len(warnings)} WARNING(S):")
    for w in warnings:
        print(w)

if not errors and not warnings:
    print("\nAll checks passed.")

print()
total = len(errors) + len(warnings)
passed = 10 - len(set(e.split(":")[0].strip() for e in errors))
print(f"Result: {len(errors)} errors, {len(warnings)} warnings")

if errors:
    sys.exit(1)
else:
    sys.exit(0)
