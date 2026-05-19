#!/usr/bin/env python3
"""
Resolve which rubric to feed the independent reviewer agent.

Precedence (highest to lowest):
  1. ~/.claude/skills/<skill>/rubric.md          (user-written, pre-committed)
  2. ~/.claude/skills/<skill>/.forge-rubric.md   (back-compat)
  3. ~/.claude/skills/skill-forge/references/rubric.md  (default)

Prints the resolved path to stdout. Exits 2 if no rubric exists anywhere
(should never happen because the default is always installed).

Usage:
  python resolve_rubric.py <skill-name>
"""

import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) < 2:
        print("error: skill name required", file=sys.stderr)
        print("usage: resolve_rubric.py <skill-name>", file=sys.stderr)
        return 2

    skill_name = sys.argv[1].lstrip("/")
    skills_root = Path.home() / ".claude" / "skills"
    skill_dir = skills_root / skill_name

    candidates = [
        ("user", skill_dir / "rubric.md"),
        ("forge-rubric", skill_dir / ".forge-rubric.md"),
        ("default", skills_root / "skill-forge" / "references" / "rubric.md"),
    ]

    for label, path in candidates:
        if path.exists() and path.is_file():
            print(str(path))
            # Stderr signals which precedence layer won — so the caller agent
            # can announce in the report what it scored against
            print(f"[rubric] using {label} rubric: {path}", file=sys.stderr)
            return 0

    print("error: no rubric found in any precedence layer", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main())
