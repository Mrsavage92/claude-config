#!/usr/bin/env python3
"""Find skill candidates for archival.

A skill is a candidate if ALL of these are true:
  1. Zero structured Skill() tool_use invocations recorded in conversation history
  2. Not referenced as Skill('X') or `/X` in any OTHER skill's SKILL.md
  3. Not referenced in any OTHER skill's references/ markdown files
  4. Not listed in CLAUDE.md, global-context.md, web-system-prompt.md, or settings.json
  5. SKILL.md file not modified in the last 30 days (proxy for "actively worked on")

A skill that's never invoked but actively cross-referenced is probably load-bearing
infrastructure. Only flag truly orphaned skills.

Output:
  - JSON: per-skill scores
  - Markdown: ranked archive candidates with reasoning

Usage:
    python find_unused_skills.py [--json]
"""

import argparse
import json
import os
import re
import sys
import time
from collections import Counter
from pathlib import Path


HOME = Path.home()
SKILLS_DIR = HOME / ".claude" / "skills"
PROJECTS_DIR = HOME / ".claude" / "projects"
EXCLUDE_NAMES = {"shared", "archive", ".git", ".gitignore"}
PROTECT_NAMES = {
    # Never archive these — they're load-bearing infrastructure
    "skill-creator", "skill-forge", "sync-knowledge-base", "find-skills",
}
ANCHOR_FILES = [
    HOME / ".claude" / "CLAUDE.md",
    HOME / ".claude" / "web-system-prompt.md",
    HOME / ".claude" / "settings.json",
    HOME / "Documents" / "Git" / "claude-config" / "global-context.md",
    HOME / "Documents" / "Git" / "claude-config" / "README.md",
]


def discover_skills():
    return sorted([
        p.name for p in SKILLS_DIR.iterdir()
        if p.is_dir()
        and p.name not in EXCLUDE_NAMES
        and not p.name.startswith(".")
        and (p / "SKILL.md").exists()
    ])


def count_structured_invocations(skills):
    """Count Skill() tool_use invocations from JSONL conversation history."""
    counts = Counter()
    if not PROJECTS_DIR.exists():
        return counts
    for root, _, files in os.walk(PROJECTS_DIR):
        for f in files:
            if not f.endswith(".jsonl"):
                continue
            path = Path(root) / f
            try:
                raw = path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            for line in raw.splitlines():
                if not line.strip():
                    continue
                try:
                    msg = json.loads(line)
                except json.JSONDecodeError:
                    continue
                for block in (msg.get("message", {}).get("content") or []):
                    if isinstance(block, dict) and block.get("type") == "tool_use":
                        if block.get("name") == "Skill":
                            s = block.get("input", {}).get("skill", "")
                            if s and s in skills:
                                counts[s] += 1
    return counts


def count_cross_references(skills):
    """For each skill, count how many OTHER skills' files mention it.

    Catches all of:
      Skill('foo'), Skill("foo"),     - explicit invocation
      `/foo`, /foo                    - slash command in prose
      bare 'foo' as kebab-case token  - mapping tables, numbered lists

    Only matches multi-word kebab-case names (containing a hyphen) when used as
    bare tokens — single-word names like 'critique' or 'audit' would cause too
    many false positives against English prose.
    """
    refs = Counter()
    # Pre-build per-skill regex so we can search each other-skill's text once.
    per_skill_patterns = {}
    for s in skills:
        # Always match Skill('s') and Skill("s")
        # Match `/s` and /s as slash command tokens
        # Match bare 's' as a standalone token ONLY if name contains a hyphen
        parts = [
            r"Skill\(['\"]" + re.escape(s) + r"['\"]\)",
            r"`/" + re.escape(s) + r"`",
            r"(?<![\w/])/" + re.escape(s) + r"(?![\w-])",
        ]
        if "-" in s:
            parts.append(r"\b" + re.escape(s) + r"\b")
        per_skill_patterns[s] = re.compile("|".join(parts))

    for skill in skills:
        pat = per_skill_patterns[skill]
        for other in skills:
            if other == skill:
                continue
            other_folder = SKILLS_DIR / other
            files = [other_folder / "SKILL.md"]
            for sub in ("references", "agents", "templates"):
                sub_path = other_folder / sub
                if sub_path.exists():
                    files.extend(sub_path.glob("*.md"))
            found = False
            for f in files:
                if found:
                    break
                try:
                    text = f.read_text(encoding="utf-8", errors="replace")
                except OSError:
                    continue
                if pat.search(text):
                    refs[skill] += 1
                    found = True
    return refs


def count_anchor_mentions(skills):
    """For each skill, check if it's mentioned in CLAUDE.md or other anchor files.
    A mention in a load-bearing system prompt = the skill is wired into core behaviour."""
    mentions = Counter()
    pattern_cache = {s: re.compile(r"\b" + re.escape(s) + r"\b") for s in skills}
    for anchor in ANCHOR_FILES:
        if not anchor.exists():
            continue
        try:
            text = anchor.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for skill, pat in pattern_cache.items():
            if pat.search(text):
                mentions[skill] += 1
    return mentions


def mtime_days(path):
    try:
        return (time.time() - path.stat().st_mtime) / 86400
    except OSError:
        return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    skills = set(discover_skills())
    invocations = count_structured_invocations(skills)
    cross_refs = count_cross_references(skills)
    anchors = count_anchor_mentions(skills)

    results = []
    for skill in sorted(skills):
        skill_md = SKILLS_DIR / skill / "SKILL.md"
        days_old = mtime_days(skill_md)
        protected = skill in PROTECT_NAMES
        inv = invocations.get(skill, 0)
        ref = cross_refs.get(skill, 0)
        anc = anchors.get(skill, 0)

        is_candidate = (
            not protected
            and inv == 0
            and ref == 0
            and anc == 0
            and (days_old is None or days_old > 30)
        )
        results.append({
            "skill": skill,
            "invocations": inv,
            "cross_refs": ref,
            "anchor_mentions": anc,
            "skill_md_age_days": round(days_old, 1) if days_old is not None else None,
            "protected": protected,
            "archive_candidate": is_candidate,
        })

    if args.json:
        print(json.dumps(results, indent=2))
        return

    candidates = [r for r in results if r["archive_candidate"]]
    used = [r for r in results if r["invocations"] > 0]
    ref_only = [r for r in results if r["invocations"] == 0 and r["cross_refs"] > 0]
    anchor_only = [r for r in results if r["invocations"] == 0 and r["cross_refs"] == 0 and r["anchor_mentions"] > 0]

    print(f"Total skills: {len(results)}")
    print(f"  Directly invoked (tool_use):     {len(used)}")
    print(f"  Cross-referenced by other skills: {len(ref_only)}")
    print(f"  Mentioned in anchor files only:   {len(anchor_only)}")
    print(f"  Archive candidates (orphaned):    {len(candidates)}")
    print()
    print("=== ARCHIVE CANDIDATES (orphaned, never invoked, no cross-refs, no anchor mentions) ===")
    for r in candidates:
        age = r["skill_md_age_days"]
        print(f"  {r['skill']:<35} age={age}d")


if __name__ == "__main__":
    main()
