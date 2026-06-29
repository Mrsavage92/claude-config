#!/usr/bin/env python3
"""Free lint tier for skills.

Runs cheap structural checks before any paid forge/benchmark tier. Catches the
~80% of issues that don't need an LLM to find: invalid frontmatter, banned
phrases in skill content, broken Skill('X') references to skills that don't
exist, oversized files, missing required sections.

This is the gate that should fire BEFORE skill-creator's expensive dual-run
benchmark or skill-forge's independent reviewer. Cost: a few hundred ms,
no LLM calls.

Usage:
    python lint_skill.py <path-to-skill-folder>
    python lint_skill.py ~/.claude/skills/skill-creator --json

Exit codes:
    0 — clean
    1 — warnings only
    2 — blocking errors (do not advance to forge/benchmark tiers)
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml required. Install with: pip install pyyaml", file=sys.stderr)
    sys.exit(2)


BANNED_PHRASES = [
    "comprehensive", "robust", "production-ready", "world-class", "premium",
    "perfect", "10/10", "shit hot", "epic", "best-in-class", "enterprise-grade",
    "battle-tested",
]

# Third-party skills vendored verbatim from anthropics/skills. The banned-phrase
# self-flattery rule polices OUR authored prose; it must not rewrite upstream
# content (e.g. "pixel-perfect", "premium design", "comprehensive tool coverage"
# are legitimate instructional usage). These are exempt from the banned-phrase
# body scan only — all other checks still apply. Keep in sync with the upstream
# skill set when re-vendoring.
VENDORED_SKILLS = frozenset({
    "algorithmic-art", "brand-guidelines", "canvas-design", "claude-api",
    "doc-coauthoring", "docx", "frontend-design", "internal-comms",
    "mcp-builder", "pdf", "pptx", "slack-gif-creator", "theme-factory",
    "web-artifacts-builder", "webapp-testing", "xlsx",
})

# Words that are too generic to be useful as skill triggers
WEAK_DESCRIPTION_PHRASES = [
    "helps with", "assists with", "useful for", "various tasks", "general purpose",
]

ALLOWED_FRONTMATTER_KEYS = {
    "name", "description", "license", "allowed-tools", "metadata", "compatibility",
    "argument-hint", "disallowed-tools", "context", "disable-model-invocation",
    "when-to-use", "cost", "model", "effort",
}

MAX_SKILL_MD_LINES = 500
MAX_REFERENCE_LINES = 1000


def find_skills_root() -> Path:
    """Locate the user's ~/.claude/skills/ dir for cross-skill reference checks."""
    return Path.home() / ".claude" / "skills"


def discover_available_skills(skills_root: Path) -> set[str]:
    """Return the set of skill names that exist locally (one folder = one skill)."""
    if not skills_root.exists():
        return set()
    return {p.name for p in skills_root.iterdir() if p.is_dir() and (p / "SKILL.md").exists()}


def lint(skill_path: Path) -> dict[str, Any]:
    """Run all checks. Return structured findings dict."""
    findings = {
        "skill_path": str(skill_path),
        "skill_name": skill_path.name,
        "errors": [],   # blocking — exit 2
        "warnings": [], # non-blocking — exit 1
        "info": [],     # FYI — exit 0
    }

    skill_md = skill_path / "SKILL.md"

    # ===== Check 1: SKILL.md exists =====
    if not skill_md.exists():
        findings["errors"].append({"check": "skill_md_present", "msg": f"SKILL.md not found at {skill_md}"})
        return findings  # Can't continue without SKILL.md

    content = skill_md.read_text(encoding="utf-8", errors="replace")

    # ===== Check 2: frontmatter present and valid =====
    if not content.startswith("---\n"):
        findings["errors"].append({"check": "frontmatter_present", "msg": "SKILL.md must start with YAML frontmatter (--- on line 1)"})
        return findings

    match = re.match(r"^---\n(.*?)\n---", content, flags=re.DOTALL)
    if not match:
        findings["errors"].append({"check": "frontmatter_format", "msg": "Invalid frontmatter — must be delimited by --- on its own line"})
        return findings

    try:
        frontmatter = yaml.safe_load(match.group(1))
    except yaml.YAMLError as e:
        findings["errors"].append({"check": "frontmatter_yaml", "msg": f"Invalid YAML in frontmatter: {e}"})
        return findings

    if not isinstance(frontmatter, dict):
        findings["errors"].append({"check": "frontmatter_dict", "msg": "Frontmatter must be a YAML mapping (key: value)"})
        return findings

    # ===== Check 3: required frontmatter keys =====
    for required in ("name", "description"):
        if required not in frontmatter:
            findings["errors"].append({"check": f"frontmatter_{required}", "msg": f"Missing required frontmatter key: {required}"})

    unexpected = set(frontmatter.keys()) - ALLOWED_FRONTMATTER_KEYS
    if unexpected:
        findings["errors"].append({
            "check": "frontmatter_unexpected_keys",
            "msg": f"Unexpected frontmatter keys: {sorted(unexpected)}. Allowed: {sorted(ALLOWED_FRONTMATTER_KEYS)}",
        })

    # ===== Check 4: description quality =====
    desc = frontmatter.get("description", "")
    if isinstance(desc, str):
        if len(desc) < 30:
            findings["warnings"].append({"check": "description_too_short", "msg": f"Description is {len(desc)} chars. Aim for at least 50 — needs trigger keywords AND when-to-use context."})
        elif len(desc) > 1500:
            findings["warnings"].append({"check": "description_too_long", "msg": f"Description is {len(desc)} chars. Over 1500 wastes context window — move detail into SKILL.md body."})

        for weak in WEAK_DESCRIPTION_PHRASES:
            if weak.lower() in desc.lower():
                findings["warnings"].append({"check": "description_weak_phrase", "msg": f"Weak trigger phrase '{weak}' in description — Claude will undertrigger. Be specific about WHEN to use."})

    # ===== Check 5: banned phrases across all skill content =====
    phrase_pattern = re.compile(r"\b(" + "|".join(re.escape(p) for p in BANNED_PHRASES) + r")\b", flags=re.IGNORECASE)
    files_to_scan = [skill_md]
    for sub in ("agents", "references", "templates"):
        sub_path = skill_path / sub
        if sub_path.exists():
            files_to_scan.extend(sorted(sub_path.glob("*.md")))

    # The skill-forge skill itself has to LIST the banned phrases as part of its job.
    # Exempt it from its own banned-phrase scan.
    is_self_exempt = skill_path.name == "skill-forge" or skill_path.name in VENDORED_SKILLS

    # Skip lines that are clearly meta-discussion of the banned-phrase rule rather than
    # self-praise usage. Trigger words: ban / banned / bans / banning / forbidden / forbid /
    # do not use / self-flattery / self-praise / banlist.
    skip_pattern = re.compile(
        r"\b(ban|banned|bans|banning|forbidden|forbid|self-flattery|self-praise|banlist)\b|do not use",
        re.IGNORECASE,
    )

    # Explicit per-line opt-out marker for legitimate technical use of a banned
    # word as a tier/grade/flag name (e.g. a quality tier literally named
    # "world-class" or a CLI flag --world-class). Markdown HTML-comment form:
    #   <!-- lint:allow-banned-phrase=world-class -->
    # Shell/python comment form:
    #   # lint:allow-banned-phrase=world-class
    # The marker MUST appear on the same line as the offending phrase.
    allow_marker_pattern = re.compile(
        r"lint:allow-banned-phrase=([a-z0-9 ,\-]+)",
        re.IGNORECASE,
    )

    # Filename-level exemption: a reference file whose stem contains a banned
    # phrase (e.g. references/world-class-tier.md) is documenting that quality
    # tier — its body will naturally contain the phrase. Skip the scan for the
    # phrase that appears in the filename.
    #
    # Also: any reference doc with "tier" / "grade" / "level" in the stem is a
    # categorical reference — it WILL legitimately reference other tier names
    # (premium tier, world-class tier, etc.) as comparison points. Exempt the
    # whole file in that case.
    TIER_DOC_MARKERS = ("-tier", "tier-", "-grade", "grade-", "-level", "level-")

    def filename_exempts(filepath: Path, phrase: str) -> bool:
        stem_norm = filepath.stem.lower().replace("_", "-")
        if any(marker in stem_norm for marker in TIER_DOC_MARKERS):
            return True
        phrase_norm = phrase.lower().replace("_", "-").replace(" ", "-")
        return phrase_norm in stem_norm

    for f in files_to_scan:
        if is_self_exempt:
            break
        try:
            text = f.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for line_no, line in enumerate(text.splitlines(), start=1):
            for match in phrase_pattern.finditer(line):
                if skip_pattern.search(line):
                    continue
                # Per-line explicit opt-out
                allow_match = allow_marker_pattern.search(line)
                if allow_match:
                    allowed = {p.strip().lower() for p in allow_match.group(1).split(",")}
                    if match.group(0).lower() in allowed:
                        continue
                # Filename-level exemption for tier/grade reference docs
                if filename_exempts(f, match.group(0)):
                    continue
                rel = f.relative_to(skill_path)
                findings["errors"].append({
                    "check": "banned_phrase",
                    "msg": f"{rel}:{line_no}: banned self-flattery phrase '{match.group(0)}' in skill content. Forces FAIL per skill-forge rubric.",
                })

    # ===== Check 6: file size limits =====
    skill_md_lines = len(content.splitlines())
    if skill_md_lines > MAX_SKILL_MD_LINES:
        findings["warnings"].append({
            "check": "skill_md_too_long",
            "msg": f"SKILL.md is {skill_md_lines} lines, max recommended {MAX_SKILL_MD_LINES}. Move detail into references/ with read-pointers.",
        })

    references_dir = skill_path / "references"
    if references_dir.exists():
        for ref_file in references_dir.glob("*.md"):
            ref_lines = len(ref_file.read_text(encoding="utf-8", errors="replace").splitlines())
            if ref_lines > MAX_REFERENCE_LINES:
                findings["warnings"].append({
                    "check": "reference_too_long",
                    "msg": f"references/{ref_file.name} is {ref_lines} lines, max recommended {MAX_REFERENCE_LINES}. Split into smaller files.",
                })

    # ===== Check 7: broken Skill('X') references =====
    skills_root = find_skills_root()
    available = discover_available_skills(skills_root)
    if available:
        # Match: Skill('foo') | Skill("foo") | /foo (as a slash command in prose)
        skill_call_pattern = re.compile(r"""(?:Skill\(['"]([a-z][a-z0-9_-]+)['"]\)|`/([a-z][a-z0-9_-]+)`)""")
        referenced = set()
        for f in files_to_scan:
            try:
                text = f.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            for match in skill_call_pattern.finditer(text):
                name = match.group(1) or match.group(2)
                if name:
                    referenced.add(name)

        broken = referenced - available - {skill_path.name}
        # Soft-allowlist: built-in CLI commands + common web route names that look like skill refs in prose
        soft_allow = {
            # Built-in Claude Code commands
            "help", "clear", "compact", "memory", "config", "model", "init", "review", "security-review",
            # Common web page route names (false positives when web-* skills mention them in prose)
            "about", "index", "pricing", "services", "home", "contact", "blog", "docs",
            "login", "signup", "dashboard", "settings", "account", "profile", "auth",
            "onboarding", "setup", "analytics", "monitor", "overview", "billing",
            "checkout", "cart", "search", "support", "faq", "terms", "privacy",
            "tmp", "var", "etc", "usr", "bin",  # path-like fragments
        }
        broken -= soft_allow
        for b in sorted(broken):
            findings["warnings"].append({
                "check": "broken_skill_reference",
                "msg": f"Referenced skill '/{b}' or Skill('{b}') does not exist at {skills_root}/{b}/. Either the reference is stale or the skill is missing.",
            })

    # ===== Check 8: anti-patterns section present =====
    body = content[match.end():] if match else ""
    if not re.search(r"^#+\s*Anti[- ]patterns?\b", body, flags=re.IGNORECASE | re.MULTILINE):
        findings["info"].append({
            "check": "no_anti_patterns_section",
            "msg": "SKILL.md has no 'Anti-patterns' section. Recommended: list 3-6 specific failure modes to avoid.",
        })

    return findings


def main():
    parser = argparse.ArgumentParser(description="Free lint tier for skills — runs cheap structural checks")
    parser.add_argument("skill_path", help="Path to skill folder (containing SKILL.md)")
    parser.add_argument("--json", action="store_true", help="Output findings as JSON instead of human-readable")
    args = parser.parse_args()

    skill_path = Path(args.skill_path).resolve()
    if not skill_path.is_dir():
        print(f"ERROR: not a directory: {skill_path}", file=sys.stderr)
        sys.exit(2)

    findings = lint(skill_path)

    if args.json:
        print(json.dumps(findings, indent=2))
    else:
        print(f"Lint report — {findings['skill_name']}")
        print(f"Path: {findings['skill_path']}")
        print()
        n_err = len(findings["errors"])
        n_warn = len(findings["warnings"])
        n_info = len(findings["info"])

        if n_err == 0 and n_warn == 0:
            print(f"CLEAN: 0 errors, 0 warnings, {n_info} info note(s).")
        else:
            print(f"Summary: {n_err} error(s), {n_warn} warning(s), {n_info} info note(s).")
        print()

        for severity, items in (("ERROR", findings["errors"]), ("WARNING", findings["warnings"]), ("INFO", findings["info"])):
            for item in items:
                print(f"  [{severity}] {item['check']}")
                print(f"    {item['msg']}")
                print()

    if findings["errors"]:
        sys.exit(2)
    if findings["warnings"]:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
