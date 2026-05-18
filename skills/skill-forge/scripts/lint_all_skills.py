#!/usr/bin/env python3
"""Bulk skill linter — run lint_skill.py across every skill in ~/.claude/skills/.

Produces a prioritised report sorted by severity so you know which skills to
fix first. Free, ~1 second per skill (~3 min for a 200-skill library).

Usage:
    python lint_all_skills.py                    # scan ~/.claude/skills/
    python lint_all_skills.py --path /other/dir  # scan a different dir
    python lint_all_skills.py --json             # machine-readable output
    python lint_all_skills.py --errors-only      # skip clean + warnings-only skills
    python lint_all_skills.py --top 10           # show only the 10 worst
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path


def find_skills(skills_root: Path) -> list[Path]:
    """Return list of skill dirs (one folder = one skill if it has SKILL.md)."""
    if not skills_root.exists():
        return []
    return sorted(
        p for p in skills_root.iterdir()
        if p.is_dir() and (p / "SKILL.md").exists()
    )


def lint_one(skill_path: Path, lint_script: Path) -> dict:
    """Run lint_skill.py on one skill, return parsed JSON findings."""
    result = subprocess.run(
        [sys.executable, str(lint_script), str(skill_path), "--json"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {
            "skill_name": skill_path.name,
            "skill_path": str(skill_path),
            "errors": [{"check": "lint_crash", "msg": f"lint_skill.py crashed: {result.stderr[:200]}"}],
            "warnings": [],
            "info": [],
        }


def severity_score(findings: dict) -> int:
    """Higher = worse. Used for sorting."""
    return len(findings.get("errors", [])) * 100 + len(findings.get("warnings", [])) * 10 + len(findings.get("info", []))


def main():
    parser = argparse.ArgumentParser(description="Bulk-lint every skill in a directory")
    parser.add_argument("--path", default=str(Path.home() / ".claude" / "skills"),
                        help="Skills root directory (default: ~/.claude/skills)")
    parser.add_argument("--json", action="store_true", help="Machine-readable output")
    parser.add_argument("--errors-only", action="store_true", help="Skip skills with no errors")
    parser.add_argument("--top", type=int, default=None, help="Show only the worst N skills")
    args = parser.parse_args()

    skills_root = Path(args.path)
    lint_script = Path(__file__).parent / "lint_skill.py"

    if not lint_script.exists():
        print(f"ERROR: lint_skill.py not found at {lint_script}", file=sys.stderr)
        sys.exit(2)

    skills = find_skills(skills_root)
    if not skills:
        print(f"No skills found in {skills_root}", file=sys.stderr)
        sys.exit(2)

    all_findings = [lint_one(s, lint_script) for s in skills]

    # Sort by severity, worst first
    all_findings.sort(key=severity_score, reverse=True)

    if args.errors_only:
        all_findings = [f for f in all_findings if f.get("errors")]

    if args.top:
        all_findings = all_findings[:args.top]

    if args.json:
        print(json.dumps({"skills_root": str(skills_root), "total_scanned": len(skills), "findings": all_findings}, indent=2))
        sys.exit(0)

    # Human-readable report
    total = len(skills)
    n_errors = sum(1 for f in all_findings if f.get("errors"))
    n_warnings = sum(1 for f in all_findings if f.get("warnings") and not f.get("errors"))
    n_clean = total - n_errors - n_warnings if not args.errors_only else "n/a (errors-only mode)"

    print(f"Skill library lint report — {skills_root}")
    print(f"Scanned: {total} skills")
    print(f"  {n_errors} with errors (blocking)")
    print(f"  {n_warnings} with warnings only")
    print(f"  {n_clean} clean")
    print()
    print("=" * 70)

    if not all_findings:
        print()
        print("All clean. No action needed.")
        sys.exit(0)

    print(f"\nWorst {len(all_findings)} skills (sorted by severity):")
    print()

    for i, findings in enumerate(all_findings, 1):
        name = findings.get("skill_name", "?")
        n_err = len(findings.get("errors", []))
        n_warn = len(findings.get("warnings", []))
        n_info = len(findings.get("info", []))

        # Status badge
        if n_err > 0:
            badge = f"[FAIL {n_err}e/{n_warn}w]"
        elif n_warn > 0:
            badge = f"[WARN {n_warn}w/{n_info}i]"
        else:
            badge = f"[OK   {n_info}i]"

        print(f"{i:3}. {badge}  {name}")

        # Show the first 3 errors/warnings per skill (full detail available with --json)
        for err in findings.get("errors", [])[:3]:
            print(f"        ERROR: {err.get('check', '?')} — {err.get('msg', '')[:100]}")
        for warn in findings.get("warnings", [])[:2]:
            print(f"        WARN:  {warn.get('check', '?')} — {warn.get('msg', '')[:100]}")
        if n_err > 3 or n_warn > 2:
            print(f"        ...and {n_err + n_warn - min(n_err, 3) - min(n_warn, 2)} more issue(s) — use --json for full list")
        print()

    print("=" * 70)
    print(f"Next steps for the highest-severity skills:")
    print(f"  /skill-forge <name>          # cold-review the worst offenders")
    print(f"  Edit SKILL.md to fix errors  # then re-run this script")
    print(f"  /usage-report                # cross-reference: dead skills with errors = delete")
    sys.exit(1 if n_errors > 0 else 0)


if __name__ == "__main__":
    main()
