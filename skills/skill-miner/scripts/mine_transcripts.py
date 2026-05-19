#!/usr/bin/env python3
"""
skill-miner: find recurring user-prompt patterns in Claude Code JSONL transcripts
that don't have a dedicated skill yet.

Pure stdlib. Cross-platform (uses pathlib). Streams files to handle 100MB+ logs.
"""

import argparse
import datetime as dt
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterator

# ---------------------------------------------------------------------------
# Constants

MIN_PROMPT_CHARS = 20
MAX_PROMPT_CHARS = 500
MIN_CLUSTER_SIZE = 5
SHARED_TRIGRAM_THRESHOLD = 3
DISTINCTIVE_IDF_MIN = 1.5  # trigrams in fewer than ~22% of prompts are "distinctive"

# Generic words that bloat clusters with noise — strip from trigram tokens
STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "i", "you", "we", "they", "it", "he", "she", "him", "her", "them", "us",
    "this", "that", "these", "those", "and", "or", "but", "if", "then", "else",
    "for", "of", "in", "on", "at", "to", "from", "by", "with", "about", "as",
    "do", "does", "did", "doing", "have", "has", "had", "having", "can", "could",
    "should", "would", "will", "may", "might", "must", "shall",
    "my", "your", "our", "their", "his", "its",
    "me", "so", "just", "also", "very", "really", "actually", "kind", "sort",
    "thanks", "please", "okay", "ok", "yeah", "yes", "no", "not", "any", "some",
    "let", "lets", "want", "need", "needs", "needed", "wanted", "wants",
    "make", "makes", "made", "go", "goes", "went", "going", "get", "gets", "got",
    "what", "when", "where", "why", "how", "who", "which",
    "all", "every", "each", "more", "most", "less", "few", "many",
    "now", "then", "here", "there", "out", "up", "down", "back",
}

# Generic prompt patterns to exclude entirely (don't cluster these)
GENERIC_PROMPT_PATTERNS = [
    re.compile(r"^continue\b", re.I),
    re.compile(r"^keep going\b", re.I),
    re.compile(r"^thanks\b", re.I),
    re.compile(r"^thank you\b", re.I),
    re.compile(r"^ok\b", re.I),
    re.compile(r"^yes\b", re.I),
    re.compile(r"^no\b", re.I),
    re.compile(r"^next\b", re.I),
    re.compile(r"^proceed\b", re.I),
    re.compile(r"^go\b", re.I),
    re.compile(r"^done\b", re.I),
]

# Prompts that are entirely system-injected and not real user intent.
# These come through the userType=external channel but are tool/UI artifacts.
SYSTEM_INJECTED_PREFIXES = (
    "<task-notification>",
    "<local-command-caveat>",
    "<local-command-stdout>",
    "<local-command-stderr>",
    "<command-name>",
    "<command-message>",
    "<command-args>",
    "<system-reminder>",
    "<user-prompt-submit-hook>",
    "<bash-stdout>",
    "<bash-stderr>",
    "<bash-input>",
    "<ide_opened_file>",
    "<ide_selection>",
    "<environment_details>",
    "[image:",
    "[request interrupted",
    "[tool_result]",
    "ps c:",   # PowerShell paste
    "ps c:\\", # PowerShell paste with backslash
)

# System-injected content patterns to strip from user content
SYSTEM_BLOCK_RES = [
    re.compile(r"<system-reminder>.*?</system-reminder>", re.DOTALL),
    re.compile(r"<task-notification>.*?</task-notification>", re.DOTALL),
    re.compile(r"<local-command-caveat>.*?</local-command-caveat>", re.DOTALL),
    re.compile(r"<local-command-stdout>.*?</local-command-stdout>", re.DOTALL),
    re.compile(r"<local-command-stderr>.*?</local-command-stderr>", re.DOTALL),
    re.compile(r"<command-name>.*?</command-name>", re.DOTALL),
    re.compile(r"<command-message>.*?</command-message>", re.DOTALL),
    re.compile(r"<command-args>.*?</command-args>", re.DOTALL),
    re.compile(r"<user-prompt-submit-hook>.*?</user-prompt-submit-hook>", re.DOTALL),
    re.compile(r"<bash-stdout>.*?</bash-stdout>", re.DOTALL),
    re.compile(r"<bash-stderr>.*?</bash-stderr>", re.DOTALL),
    re.compile(r"<bash-input>.*?</bash-input>", re.DOTALL),
    re.compile(r"<ide_opened_file>.*?</ide_opened_file>", re.DOTALL),
    re.compile(r"<ide_selection>.*?</ide_selection>", re.DOTALL),
    re.compile(r"<environment_details>.*?</environment_details>", re.DOTALL),
    # Bracketed system markers
    re.compile(r"\[Image:[^\]]*\]", re.IGNORECASE),
    re.compile(r"Multiply coordinates by [\d.]+[^\n]*", re.IGNORECASE),
    re.compile(r"\[Request interrupted by user[^\]]*\]", re.IGNORECASE),
]
CODE_BLOCK_RE = re.compile(r"```.*?```", re.DOTALL)
FILE_REF_RE = re.compile(r"@[\w/.\-\\:]+")
SLASH_COMMAND_RE = re.compile(r"^/[a-z][a-z0-9-]*\b", re.I)
URL_RE = re.compile(r"https?://\S+")
WINDOWS_PATH_RE = re.compile(r"[a-z]:[\\/][\w\\/.\-]+", re.I)
UNIX_PATH_RE = re.compile(r"/[a-z][\w/.\-]+/[\w/.\-]+", re.I)


# ---------------------------------------------------------------------------
# Path discovery

def default_scan_paths() -> list[Path]:
    """Cross-platform default scan locations."""
    home = Path.home()
    candidates = [
        home / ".claude" / "projects",
        home / "Documents" / "Claude",
        home / ".claude-work",
    ]
    return [p for p in candidates if p.exists()]


def find_jsonl_files(roots: list[Path]) -> Iterator[Path]:
    """Walk roots recursively, yield *.jsonl files."""
    for root in roots:
        if not root.exists():
            continue
        yield from root.rglob("*.jsonl")


# ---------------------------------------------------------------------------
# JSONL parsing

def parse_iso_timestamp(s: str) -> dt.datetime | None:
    """Parse an ISO 8601 timestamp, return None on failure."""
    if not s:
        return None
    try:
        # Handle trailing Z (UTC)
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return dt.datetime.fromisoformat(s)
    except (ValueError, TypeError):
        return None


def extract_user_text(record: dict) -> str | None:
    """
    Pull user-typed text out of a Claude Code JSONL record.
    Returns None if this record isn't a real external user message.
    """
    if record.get("type") != "user":
        return None
    if record.get("userType") != "external":
        return None

    message = record.get("message", {})
    if not isinstance(message, dict):
        return None
    if message.get("role") != "user":
        return None

    content = message.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        # Array of {type, text} blocks; pick only text blocks (skip tool_result)
        parts = []
        for block in content:
            if not isinstance(block, dict):
                continue
            if block.get("type") == "text":
                t = block.get("text", "")
                if isinstance(t, str):
                    parts.append(t)
        return "\n".join(parts) if parts else None
    return None


def normalize_prompt(text: str) -> str:
    """Strip system blocks, code blocks, file refs, paths, URLs, lowercase, collapse whitespace."""
    if not text:
        return ""
    # Strip system-injected blocks BEFORE anything else
    for pat in SYSTEM_BLOCK_RES:
        text = pat.sub("", text)
    text = CODE_BLOCK_RE.sub("", text)
    text = URL_RE.sub("", text)
    text = FILE_REF_RE.sub("", text)
    text = WINDOWS_PATH_RE.sub("", text)
    text = UNIX_PATH_RE.sub("", text)
    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()
    return text


def is_qualifying_prompt(raw_text: str, normalized: str) -> bool:
    """Filters: length window, not generic, not pure slash command, not system-injected."""
    # Reject if the RAW prompt starts with a known system-injected marker
    raw_stripped = raw_text.lstrip().lower()
    for prefix in SYSTEM_INJECTED_PREFIXES:
        if raw_stripped.startswith(prefix):
            return False
    if len(normalized) < MIN_PROMPT_CHARS or len(normalized) > MAX_PROMPT_CHARS:
        return False
    if SLASH_COMMAND_RE.match(normalized) and len(normalized.split()) < 5:
        # Pure slash command invocation like "/audit https://..." — skip
        return False
    for pat in GENERIC_PROMPT_PATTERNS:
        if pat.search(normalized):
            return False
    # Reject if more than 50% of tokens look like path fragments or system noise
    tokens = normalized.split()
    if not tokens:
        return False
    noise_tokens = {"users", "adam", "claude-work", "appdata", "local", "temp",
                    "task-notification", "task-id", "tool-use-id", "toolu",
                    "output-file", "background", "command", "summary"}
    noise_count = sum(1 for t in tokens if t in noise_tokens)
    if noise_count / len(tokens) > 0.4:
        return False
    return True


# ---------------------------------------------------------------------------
# Tokenization & trigrams

WORD_RE = re.compile(r"[a-z][a-z0-9\-]+")


def tokenize(text: str) -> list[str]:
    """Words, lowercased, no stopwords, length >= 3."""
    return [w for w in WORD_RE.findall(text) if w not in STOPWORDS and len(w) >= 3]


def trigrams(tokens: list[str]) -> list[tuple[str, str, str]]:
    """Word trigrams (sliding window)."""
    if len(tokens) < 3:
        return []
    return [(tokens[i], tokens[i + 1], tokens[i + 2]) for i in range(len(tokens) - 2)]


# ---------------------------------------------------------------------------
# Streaming extraction

def collect_prompts(roots: list[Path], cutoff: dt.datetime | None) -> list[dict]:
    """
    Walk JSONL files, return list of {text, normalized, timestamp, file} dicts
    for qualifying user prompts.
    """
    prompts = []
    files_scanned = 0
    lines_parsed = 0
    parse_errors = 0

    for jsonl_path in find_jsonl_files(roots):
        files_scanned += 1
        try:
            with jsonl_path.open("r", encoding="utf-8", errors="replace") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    lines_parsed += 1
                    try:
                        record = json.loads(line)
                    except json.JSONDecodeError:
                        parse_errors += 1
                        continue

                    text = extract_user_text(record)
                    if text is None:
                        continue

                    ts = parse_iso_timestamp(record.get("timestamp", ""))
                    if cutoff and ts and ts.replace(tzinfo=None) < cutoff:
                        continue

                    normalized = normalize_prompt(text)
                    if not is_qualifying_prompt(text, normalized):
                        continue

                    prompts.append({
                        "raw": text[:80],
                        "normalized": normalized,
                        "timestamp": ts,
                        "file": str(jsonl_path),
                    })
        except (OSError, PermissionError) as e:
            print(f"[skip] {jsonl_path}: {e}", file=sys.stderr)
            continue

    print(
        f"[scan] files={files_scanned}  lines={lines_parsed}  "
        f"parse_errors={parse_errors}  qualifying_prompts={len(prompts)}",
        file=sys.stderr,
    )
    return prompts


# ---------------------------------------------------------------------------
# Clustering

def compute_trigram_idf(prompts: list[dict]) -> dict[tuple, float]:
    """Inverse document frequency for each trigram across all prompts."""
    import math

    df: Counter = Counter()
    for p in prompts:
        seen = set(trigrams(tokenize(p["normalized"])))
        for tg in seen:
            df[tg] += 1

    n = max(1, len(prompts))
    return {tg: math.log(n / count) for tg, count in df.items()}


def distinctive_trigrams_for(prompt: dict, idf: dict[tuple, float]) -> set[tuple]:
    """Return only trigrams with IDF above threshold (rare/distinctive ones)."""
    tgs = set(trigrams(tokenize(prompt["normalized"])))
    return {tg for tg in tgs if idf.get(tg, 0) >= DISTINCTIVE_IDF_MIN}


def cluster_by_trigram_overlap(prompts: list[dict], idf: dict[tuple, float]) -> list[list[int]]:
    """
    Group prompts that share >= SHARED_TRIGRAM_THRESHOLD distinctive trigrams.
    Index-based: for each distinctive trigram, list which prompts contain it,
    then candidate-merge using a union-find.
    """
    # Pre-compute distinctive trigrams per prompt
    prompt_dtg = [distinctive_trigrams_for(p, idf) for p in prompts]

    # Index: trigram -> set of prompt indices
    inverted: dict[tuple, set[int]] = defaultdict(set)
    for i, dtgs in enumerate(prompt_dtg):
        for tg in dtgs:
            inverted[tg].add(i)

    # For each prompt, find candidates (other prompts sharing >=1 distinctive tg)
    # Then check the SHARED_TRIGRAM_THRESHOLD condition
    parent = list(range(len(prompts)))

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a: int, b: int) -> None:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for i, dtgs in enumerate(prompt_dtg):
        if len(dtgs) < SHARED_TRIGRAM_THRESHOLD:
            continue
        candidate_counts: Counter = Counter()
        for tg in dtgs:
            for j in inverted[tg]:
                if j != i:
                    candidate_counts[j] += 1
        for j, shared in candidate_counts.items():
            if shared >= SHARED_TRIGRAM_THRESHOLD:
                union(i, j)

    groups: dict[int, list[int]] = defaultdict(list)
    for i in range(len(prompts)):
        groups[find(i)].append(i)

    return [g for g in groups.values() if len(g) >= MIN_CLUSTER_SIZE]


# ---------------------------------------------------------------------------
# Skill inventory

DESCRIPTION_RE = re.compile(r"^description:\s*(.+?)$", re.M)
NAME_RE = re.compile(r"^name:\s*(.+?)$", re.M)


def load_skill_inventory(skills_root: Path) -> list[dict]:
    """Read each SKILL.md's frontmatter description + name."""
    inventory = []
    if not skills_root.exists():
        return inventory
    for skill_md in skills_root.glob("*/SKILL.md"):
        try:
            head = skill_md.read_text(encoding="utf-8", errors="replace")[:4000]
        except (OSError, PermissionError):
            continue
        # Extract frontmatter block (between two --- lines)
        if not head.startswith("---"):
            continue
        end = head.find("---", 3)
        if end == -1:
            continue
        fm = head[3:end]
        name_m = NAME_RE.search(fm)
        desc_m = DESCRIPTION_RE.search(fm)
        if not name_m or not desc_m:
            continue
        # Description can be multi-line; take the line and any continuation
        desc = desc_m.group(1).strip().strip('"').strip("'")
        inventory.append({
            "name": name_m.group(1).strip(),
            "description": desc.lower(),
            "path": str(skill_md),
        })
    return inventory


def match_cluster_to_skill(
    cluster_tokens: set[str],
    inventory: list[dict],
    token_idf: dict[str, float],
    exclude: set[str] | None = None,
) -> str | None:
    """
    Return the name of an existing skill whose description shares
    >= 2 high-IDF (distinctive) tokens with the cluster.
    Common words like 'audit' or 'page' are weighted lower; rare tokens win.
    """
    if not cluster_tokens:
        return None
    exclude = exclude or set()
    best = None
    best_score = 0.0
    for skill in inventory:
        if skill["name"] in exclude:
            continue
        desc_tokens = set(WORD_RE.findall(skill["description"])) - STOPWORDS
        shared = cluster_tokens & desc_tokens
        if len(shared) < 2:
            continue
        # Weight by IDF — rare shared tokens score higher
        score = sum(token_idf.get(t, 0.5) for t in shared)
        if score > best_score:
            best = skill["name"]
            best_score = score
    # Require a meaningful aggregate IDF score, not just any 2 shared common words
    if best_score >= 4.0:
        return best
    return None


def compute_token_idf(prompts: list[dict]) -> dict[str, float]:
    """Inverse document frequency for single tokens — used for distinctive-token weighting in inventory matching."""
    import math

    df: Counter = Counter()
    for p in prompts:
        seen = set(tokenize(p["normalized"]))
        for tok in seen:
            df[tok] += 1
    n = max(1, len(prompts))
    return {tok: math.log(n / count) for tok, count in df.items()}


# ---------------------------------------------------------------------------
# Cluster summarization

def summarize_cluster(cluster: list[int], prompts: list[dict], idf: dict[tuple, float]) -> dict:
    """Build the report entry for one cluster."""
    members = [prompts[i] for i in cluster]
    members_sorted = sorted(members, key=lambda p: p["timestamp"] or dt.datetime.min)

    # Aggregate distinctive trigrams across the cluster
    all_dtg: Counter = Counter()
    for m in members:
        for tg in distinctive_trigrams_for(m, idf):
            all_dtg[tg] += 1

    # Top 5 distinctive trigrams (most shared within cluster)
    top_trigrams = [tg for tg, _ in all_dtg.most_common(5)]
    top_trigram_strs = [" ".join(tg) for tg in top_trigrams]

    # Distinctive tokens for inventory matching
    distinctive_tokens = set()
    for tg in top_trigrams:
        for tok in tg:
            distinctive_tokens.add(tok)

    # Date span
    timestamps = [m["timestamp"] for m in members if m["timestamp"]]
    date_min = min(timestamps).date().isoformat() if timestamps else "unknown"
    date_max = max(timestamps).date().isoformat() if timestamps else "unknown"

    # Cluster name: first two distinctive trigrams joined
    if top_trigram_strs:
        name = top_trigram_strs[0]
    else:
        name = "unnamed cluster"

    return {
        "name": name,
        "occurrences": len(members),
        "date_first": date_min,
        "date_last": date_max,
        "samples": [m["raw"] for m in members_sorted[:5]],
        "distinctive_trigrams": top_trigram_strs,
        "distinctive_tokens": sorted(distinctive_tokens),
    }


def recommend_action(
    cluster_summary: dict,
    inventory: list[dict],
    token_idf: dict[str, float],
) -> tuple[str, str, str]:
    """Return (action, target, reason). Excludes 'skill-miner' itself from matches."""
    tokens = set(cluster_summary["distinctive_tokens"])
    match = match_cluster_to_skill(
        tokens, inventory, token_idf, exclude={"skill-miner"},
    )
    if match:
        return ("EXTEND", match, f"Cluster shares distinctive tokens with existing skill /{match}")

    # IGNORE if trigrams look generic (e.g., only common verbs)
    if not cluster_summary["distinctive_trigrams"]:
        return ("IGNORE", "", "No distinctive trigrams — pattern is too generic")

    return (
        "NEW SKILL",
        cluster_summary["name"].replace(" ", "-"),
        f"Recurring {cluster_summary['occurrences']} times, no existing skill matches the distinctive tokens",
    )


# ---------------------------------------------------------------------------
# Report writers

def write_markdown_report(path: Path, clusters: list[dict], scan_meta: dict) -> None:
    lines = [
        f"# Skill Miner Report — {dt.date.today().isoformat()}",
        "",
        f"**Scan window:** last {scan_meta['days']} days",
        f"**Paths scanned:** {', '.join(scan_meta['paths']) or '(none)'}",
        f"**Qualifying prompts:** {scan_meta['prompts']}",
        f"**Clusters found:** {len(clusters)}",
        "",
        "---",
        "",
    ]

    if not clusters:
        lines.append("No qualifying clusters found.")
        lines.append("")
        lines.append("Try `--days 180` for a wider window, or `--top 25` for less-frequent patterns.")
        path.write_text("\n".join(lines), encoding="utf-8")
        return

    # Top recommendation banner
    top = clusters[0]
    lines.append(f"## Top recommendation: {top['action']} — `{top['target']}` ({top['occurrences']} occurrences)")
    lines.append("")
    lines.append(f"_Reason: {top['reason']}_")
    lines.append("")
    if top["action"] == "NEW SKILL":
        lines.append(f"Run: `Skill('skill-creator')` with the JSON sidecar to author this skill.")
    elif top["action"] == "EXTEND":
        lines.append(f"Run: `Skill('skill-forge', '{top['target']}')` to review and extend.")
    lines.append("")
    lines.append("---")
    lines.append("")

    for i, c in enumerate(clusters, 1):
        lines.append(f"### Cluster {i} — \"{c['name']}\" ({c['occurrences']} occurrences, {c['date_first']} → {c['date_last']})")
        lines.append("")
        lines.append("**Sample prompts:**")
        for s in c["samples"]:
            lines.append(f"- `{s}`")
        lines.append("")
        lines.append("**Distinctive trigrams:** " + ", ".join(f"`{t}`" for t in c["distinctive_trigrams"]))
        lines.append("")
        lines.append(f"**Recommendation:** {c['action']}" + (f" — `{c['target']}`" if c["target"] else ""))
        lines.append("")
        lines.append(f"**Reason:** {c['reason']}")
        lines.append("")
        lines.append("---")
        lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")


def write_json_sidecar(path: Path, clusters: list[dict], scan_meta: dict) -> None:
    payload = {
        "generated": dt.datetime.now().isoformat(timespec="seconds"),
        "scan_meta": scan_meta,
        "clusters": clusters,
    }
    path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")


# ---------------------------------------------------------------------------
# CLI

def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Mine Claude Code JSONL transcripts for recurring prompts that need a skill.",
    )
    parser.add_argument("--days", type=int, default=90, help="Look-back window in days (default: 90)")
    parser.add_argument("--top", type=int, default=10, help="Top N clusters to report (default: 10)")
    parser.add_argument("--path", action="append", help="Override scan path (repeatable)")
    parser.add_argument("--json", action="store_true", help="Print JSON to stdout only (no markdown)")
    parser.add_argument(
        "--skills-root",
        default=str(Path.home() / ".claude" / "skills"),
        help="Skill inventory directory (default: ~/.claude/skills/)",
    )
    parser.add_argument(
        "--out-dir",
        default=str(Path.home() / ".claude" / "skill-miner"),
        help="Output directory (default: ~/.claude/skill-miner/)",
    )
    args = parser.parse_args(argv)

    # Resolve scan paths
    if args.path:
        roots = [Path(p).expanduser() for p in args.path]
    else:
        roots = default_scan_paths()

    if not roots:
        print("error: no scan paths exist", file=sys.stderr)
        return 2

    cutoff = dt.datetime.now() - dt.timedelta(days=args.days)

    # Collect prompts
    prompts = collect_prompts(roots, cutoff)
    if not prompts:
        print("[result] no qualifying prompts in window", file=sys.stderr)
        return 1

    # Cluster
    idf = compute_trigram_idf(prompts)
    raw_clusters = cluster_by_trigram_overlap(prompts, idf)

    # Sort clusters by size desc, take top N
    raw_clusters.sort(key=len, reverse=True)
    raw_clusters = raw_clusters[: args.top]

    if not raw_clusters:
        print("[result] no clusters met threshold", file=sys.stderr)
        return 1

    # Load skill inventory
    inventory = load_skill_inventory(Path(args.skills_root).expanduser())
    print(f"[inventory] {len(inventory)} existing skills loaded", file=sys.stderr)

    # Token IDF used for inventory-matching weights
    token_idf = compute_token_idf(prompts)

    # Summarize + recommend
    final_clusters = []
    for cluster in raw_clusters:
        summary = summarize_cluster(cluster, prompts, idf)
        action, target, reason = recommend_action(summary, inventory, token_idf)
        summary["action"] = action
        summary["target"] = target
        summary["reason"] = reason
        final_clusters.append(summary)

    # Write outputs
    out_dir = Path(args.out_dir).expanduser()
    out_dir.mkdir(parents=True, exist_ok=True)
    today = dt.date.today().isoformat()

    scan_meta = {
        "days": args.days,
        "paths": [str(r) for r in roots],
        "prompts": len(prompts),
    }

    json_path = out_dir / f"report-{today}.json"
    write_json_sidecar(json_path, final_clusters, scan_meta)

    if args.json:
        print(json_path.read_text(encoding="utf-8"))
    else:
        md_path = out_dir / f"report-{today}.md"
        write_markdown_report(md_path, final_clusters, scan_meta)
        print(f"[ok] report: {md_path}")
        print(f"[ok] sidecar: {json_path}")
        if final_clusters:
            top = final_clusters[0]
            print(f"[next] Top: {top['action']} — {top['target']} ({top['occurrences']} occurrences)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
