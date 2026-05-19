#!/usr/bin/env python3
"""
project-triage: walk parent directories, gather structural signals on every child
folder, emit REVIVE / KILL / IGNORE verdicts.

Pure stdlib. Cross-platform (uses pathlib). Calls `git` via subprocess when present.
"""

import argparse
import csv
import datetime as dt
import json
import re
import subprocess
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration

DEFAULT_REVIVE_DAYS = 90
DEFAULT_KILL_DAYS = 180
MIN_README_CHARS_FOR_INTENT = 200
MIN_COMMITS_FOR_SUBSTANCE = 20
MIN_SOURCE_FILES_FOR_PRESENCE = 5

SKIP_PREFIXES = {".", "_", "node_modules", "__pycache__", ".venv", ".git", "venv", "env"}
SOURCE_DIRS = ("src", "app", "pages", "lib", "components", "scripts", "tests")
MANIFEST_FILES = {
    "package.json": "typescript/javascript",
    "pyproject.toml": "python",
    "requirements.txt": "python",
    "Cargo.toml": "rust",
    "go.mod": "go",
    "Gemfile": "ruby",
    "pom.xml": "java",
    "build.gradle": "java",
    "Dockerfile": "container",
    "CLAUDE.md": "claude-project",
}
README_NAMES = ("README.md", "README", "readme.md", "README.txt", "Readme.md")


# ---------------------------------------------------------------------------
# Active project registry

def load_active_project_names() -> set[str]:
    """
    Read the user's active project registry files and extract folder names that
    should NEVER be killed.
    """
    names: set[str] = set()
    home = Path.home()

    candidates = [
        home / "Documents" / "Claude" / "outputs" / "active-revenue-projects.md",
        home / ".claude" / "CLAUDE.md",
        home / "audit-genius" / "CLAUDE.md",
        home / "Documents" / "Claude" / "growlocal" / "CLAUDE.md",
        home / "Documents" / "Claude" / "BDR Group.co.uk" / "CLAUDE.md",
        home / ".claude-work" / "projects" / "bdr-integrations" / "CLAUDE.md",
        home / "Documents" / "Claude" / "glossbeauty.com.au" / "repo" / "CLAUDE.md",
        home / "automation-agency" / "CLAUDE.md",
    ]

    for f in candidates:
        if not f.exists():
            continue
        try:
            text = f.read_text(encoding="utf-8", errors="replace")
        except (OSError, PermissionError):
            continue
        # Crude but effective: pull folder-like tokens
        # Match Windows or Unix paths to project roots
        for m in re.finditer(r"[A-Za-z]:[\\/][\w\-./\\]+|/[\w\-./]+", text):
            path_str = m.group(0)
            parts = re.split(r"[\\/]+", path_str)
            for p in parts:
                if p and len(p) > 2 and "." not in p and not p.startswith("Users"):
                    names.add(p.lower())

    # Hardcode known active projects from Adam's CLAUDE.md
    known = {
        "audit-genius", "audithq",
        "growlocal", "orbit-digital",
        "automation-agency",
        "bdr-integrations", "bdr group.co.uk",
        "glossbeauty.com.au",
        "claude-config", "skills-library",
    }
    names.update(known)
    return names


# ---------------------------------------------------------------------------
# Project signal collection

def run_git(cwd: Path, args: list[str]) -> str | None:
    """Run a git command in cwd, return stdout (stripped) or None on failure."""
    try:
        result = subprocess.run(
            ["git"] + args,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        if result.returncode != 0:
            return None
        return result.stdout.strip()
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return None


def is_git_repo(p: Path) -> bool:
    return (p / ".git").exists()


def get_git_signals(project: Path) -> dict:
    """Return {last_commit_days, total_commits, has_git}."""
    if not is_git_repo(project):
        return {"has_git": False, "last_commit_days": None, "total_commits": 0}
    last_ts = run_git(project, ["log", "-1", "--format=%ct"])
    total = run_git(project, ["rev-list", "--count", "HEAD"])
    last_days = None
    if last_ts:
        try:
            commit_dt = dt.datetime.fromtimestamp(int(last_ts))
            last_days = (dt.datetime.now() - commit_dt).days
        except (ValueError, OSError):
            pass
    total_int = 0
    if total:
        try:
            total_int = int(total)
        except ValueError:
            pass
    return {"has_git": True, "last_commit_days": last_days, "total_commits": total_int}


def get_readme_signal(project: Path) -> tuple[bool, int]:
    """Return (has_readme, length_in_chars)."""
    for name in README_NAMES:
        f = project / name
        if f.exists() and f.is_file():
            try:
                return (True, len(f.read_text(encoding="utf-8", errors="replace")))
            except (OSError, PermissionError):
                continue
    return (False, 0)


def get_stack_signal(project: Path) -> str:
    """Identify recognized manifest files. Return comma-joined stack list, or 'none'."""
    found = []
    for name, stack in MANIFEST_FILES.items():
        if (project / name).exists():
            found.append(stack)
    return ", ".join(sorted(set(found))) if found else "none"


def get_source_file_count(project: Path) -> int:
    """Count source files in common source dirs (1 level deep)."""
    count = 0
    for d in SOURCE_DIRS:
        target = project / d
        if not target.exists() or not target.is_dir():
            continue
        try:
            for entry in target.iterdir():
                if entry.is_file() and entry.suffix in {
                    ".ts", ".tsx", ".js", ".jsx", ".py", ".rs", ".go",
                    ".java", ".rb", ".vue", ".svelte", ".css", ".scss",
                }:
                    count += 1
                elif entry.is_dir():
                    # Count one level deeper too
                    try:
                        for sub in entry.iterdir():
                            if sub.is_file() and sub.suffix in {
                                ".ts", ".tsx", ".js", ".jsx", ".py", ".rs",
                            }:
                                count += 1
                    except (OSError, PermissionError):
                        continue
        except (OSError, PermissionError):
            continue
    return count


def has_untangler_state(project: Path) -> bool:
    return (project / ".untangler" / "state.json").exists()


def collect_signals(project: Path) -> dict:
    """Gather all structural signals for one project folder."""
    git = get_git_signals(project)
    has_readme, readme_len = get_readme_signal(project)
    stack = get_stack_signal(project)
    src_count = get_source_file_count(project)
    untangler = has_untangler_state(project)

    return {
        "name": project.name,
        "path": str(project),
        "has_git": git["has_git"],
        "last_commit_days": git["last_commit_days"],
        "total_commits": git["total_commits"],
        "has_readme": has_readme,
        "readme_chars": readme_len,
        "stack": stack,
        "source_files": src_count,
        "untangler_in_progress": untangler,
    }


# ---------------------------------------------------------------------------
# Verdict logic

def decide_verdict(
    signals: dict,
    active_names: set[str],
    revive_days: int,
    kill_days: int,
    skip_registry_check: bool,
) -> tuple[str, str]:
    """Return (verdict, reason)."""
    name_lower = signals["name"].lower()

    if not skip_registry_check and name_lower in active_names:
        return ("IGNORE", "Listed in active project registry")

    if signals["untangler_in_progress"]:
        return ("IGNORE", "Mid-refactor (.untangler/state.json present)")

    last = signals["last_commit_days"]
    commits = signals["total_commits"]
    has_readme = signals["has_readme"]
    readme_chars = signals["readme_chars"]
    src = signals["source_files"]

    # No git, no docs, no source = nothing of value
    if not signals["has_git"] and readme_chars < MIN_README_CHARS_FOR_INTENT and src < MIN_SOURCE_FILES_FOR_PRESENCE:
        return ("KILL", "No git history, no README, no source files — empty shell")

    # Very stale stub
    if last is not None and last > kill_days and commits < MIN_COMMITS_FOR_SUBSTANCE:
        return (
            "KILL",
            f"Stale stub: {commits} commits, {last} days dormant, no recent edits",
        )

    # Dormant but substantive — REVIVE candidate
    if last is not None and last > revive_days and commits >= MIN_COMMITS_FOR_SUBSTANCE and has_readme:
        return (
            "REVIVE",
            f"Substantive ({commits} commits, {last} days dormant, README present)",
        )

    # Dormant with no captured intent
    if last is not None and last > revive_days and not has_readme:
        return (
            "KILL",
            f"Dormant {last} days with no README — no intent captured",
        )

    # Recent activity
    if last is not None and last <= revive_days:
        return ("IGNORE", f"Active or recent ({last} days since last commit)")

    return ("IGNORE", "No clear signal — left in place for human review")


# ---------------------------------------------------------------------------
# Walking

def default_parents() -> list[Path]:
    home = Path.home()
    candidates = [
        home / "Documents" / "Claude",
        home / ".claude-work" / "projects",
        home / "projects",
        home,  # Adam's top-level project folders (audit-genius, automation-agency, etc.)
    ]
    return [p for p in candidates if p.exists()]


def walk_parent(parent: Path) -> list[Path]:
    """Return direct child folders that look like potential projects."""
    children = []
    try:
        for entry in parent.iterdir():
            if not entry.is_dir():
                continue
            name = entry.name
            if any(name.startswith(prefix) for prefix in SKIP_PREFIXES):
                continue
            if name in {"Downloads", "AppData", "Music", "Videos", "Pictures"}:
                continue
            children.append(entry)
    except (OSError, PermissionError) as e:
        print(f"[skip-parent] {parent}: {e}", file=sys.stderr)
    return children


# ---------------------------------------------------------------------------
# Report writers

def write_markdown(path: Path, results: list[dict], scan_meta: dict) -> None:
    by_verdict = {"REVIVE": [], "KILL": [], "IGNORE": []}
    for r in results:
        by_verdict[r["verdict"]].append(r)

    lines = [
        f"# Project Triage — {dt.date.today().isoformat()}",
        "",
        f"**Parents scanned:** {', '.join(scan_meta['parents'])}",
        f"**Projects evaluated:** {len(results)}",
        f"**REVIVE:** {len(by_verdict['REVIVE'])}  |  "
        f"**KILL:** {len(by_verdict['KILL'])}  |  "
        f"**IGNORE:** {len(by_verdict['IGNORE'])}",
        "",
        "---",
        "",
    ]

    for verdict in ("REVIVE", "KILL", "IGNORE"):
        bucket = by_verdict[verdict]
        if not bucket:
            continue
        lines.append(f"## {verdict} ({len(bucket)})")
        lines.append("")
        lines.append("| Project | Days dormant | Commits | README | Stack | Reason |")
        lines.append("|---|---|---|---|---|---|")
        # Sort: REVIVE by commits desc, KILL by days dormant desc, IGNORE by recency
        if verdict == "REVIVE":
            bucket.sort(key=lambda r: -r["signals"]["total_commits"])
        elif verdict == "KILL":
            bucket.sort(key=lambda r: -(r["signals"]["last_commit_days"] or 0))
        else:
            bucket.sort(key=lambda r: r["signals"]["last_commit_days"] or 9999)

        for r in bucket:
            s = r["signals"]
            days = s["last_commit_days"] if s["last_commit_days"] is not None else "—"
            readme = f"{s['readme_chars']}b" if s["has_readme"] else "no"
            lines.append(
                f"| `{s['name']}` | {days} | {s['total_commits']} | {readme} | "
                f"{s['stack']} | {r['reason']} |"
            )
        lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")


def write_csv(path: Path, results: list[dict]) -> None:
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "verdict", "name", "path", "days_dormant", "total_commits",
            "has_readme", "readme_chars", "stack", "source_files", "reason",
        ])
        for r in results:
            s = r["signals"]
            writer.writerow([
                r["verdict"], s["name"], s["path"],
                s["last_commit_days"] if s["last_commit_days"] is not None else "",
                s["total_commits"], "yes" if s["has_readme"] else "no",
                s["readme_chars"], s["stack"], s["source_files"],
                r["reason"],
            ])


def write_json(path: Path, results: list[dict], scan_meta: dict) -> None:
    path.write_text(
        json.dumps({"meta": scan_meta, "results": results}, indent=2, default=str),
        encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# CLI

def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Triage dormant project folders into REVIVE / KILL / IGNORE.",
    )
    parser.add_argument(
        "--path", action="append",
        help="Override parent directory to scan (repeatable). Default: auto-detected.",
    )
    parser.add_argument("--revive-days", type=int, default=DEFAULT_REVIVE_DAYS)
    parser.add_argument("--kill-days", type=int, default=DEFAULT_KILL_DAYS)
    parser.add_argument(
        "--no-registry-check", action="store_true",
        help="Skip the active-project registry check (force verdicts on everything).",
    )
    parser.add_argument("--json", action="store_true", help="Emit JSON to stdout only.")
    parser.add_argument(
        "--out-dir",
        default=str(Path.home() / ".claude" / "project-triage"),
        help="Output directory (default: ~/.claude/project-triage/)",
    )
    args = parser.parse_args(argv)

    # Resolve parents
    if args.path:
        parents = [Path(p).expanduser() for p in args.path]
    else:
        parents = default_parents()

    if not parents:
        print("error: no parent directories exist", file=sys.stderr)
        return 2

    # Load active project registry (unless skipped)
    active_names = set() if args.no_registry_check else load_active_project_names()

    # Walk and collect
    all_projects: list[Path] = []
    for parent in parents:
        all_projects.extend(walk_parent(parent))

    if not all_projects:
        print("error: no project folders found", file=sys.stderr)
        return 1

    # Build results
    results = []
    for project in all_projects:
        try:
            signals = collect_signals(project)
        except (OSError, PermissionError) as e:
            print(f"[skip] {project}: {e}", file=sys.stderr)
            continue
        verdict, reason = decide_verdict(
            signals, active_names, args.revive_days, args.kill_days, args.no_registry_check,
        )
        results.append({"verdict": verdict, "reason": reason, "signals": signals})

    # Write outputs
    out_dir = Path(args.out_dir).expanduser()
    out_dir.mkdir(parents=True, exist_ok=True)
    today = dt.date.today().isoformat()

    scan_meta = {
        "parents": [str(p) for p in parents],
        "revive_days": args.revive_days,
        "kill_days": args.kill_days,
        "registry_check": not args.no_registry_check,
        "evaluated": len(results),
    }

    json_path = out_dir / f"triage-{today}.json"
    write_json(json_path, results, scan_meta)

    if args.json:
        print(json_path.read_text(encoding="utf-8"))
    else:
        md_path = out_dir / f"triage-{today}.md"
        csv_path = out_dir / f"triage-{today}.csv"
        write_markdown(md_path, results, scan_meta)
        write_csv(csv_path, results)
        counts = {"REVIVE": 0, "KILL": 0, "IGNORE": 0}
        for r in results:
            counts[r["verdict"]] = counts.get(r["verdict"], 0) + 1
        print(f"[ok] markdown: {md_path}")
        print(f"[ok] csv: {csv_path}")
        print(f"[ok] json: {json_path}")
        print(
            f"[result] {counts['REVIVE']} REVIVE, "
            f"{counts['KILL']} KILL, "
            f"{counts['IGNORE']} IGNORE"
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
