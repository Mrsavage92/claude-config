---
name: usage-report
description: Analyse Claude Code conversation history to show which agents, skills, and commands you actually use. Identifies unused tools and your most-reached-for workflows. Use when auditing your setup or deciding what to prune.
---

# Usage Report

Scans recent conversation JSONL files to find which agents, skills, and commands have actually been invoked. Shows usage frequency so you can prune what you never use and double down on what you do.

## Run It

Execute this Python script directly:

```python
import os, json
from collections import Counter
from datetime import datetime

projects_dir = os.path.expanduser("~/.claude/projects")
agent_dir = os.path.expanduser("~/.claude/agents")
cmd_dir = os.path.expanduser("~/.claude/commands")

known_agents = set(f.replace(".md","") for f in os.listdir(agent_dir) if f.endswith(".md"))
known_commands = set(f.replace(".md","") for f in os.listdir(cmd_dir) if f.endswith(".md"))

skill_uses = Counter()
command_uses = Counter()
agent_uses = Counter()
jsonl_files = []

for root, dirs, files in os.walk(projects_dir):
    for f in files:
        if f.endswith(".jsonl"):
            jsonl_files.append(os.path.join(root, f))

oldest = newest = None

for fpath in jsonl_files:
    try:
        raw = open(fpath, encoding="utf-8", errors="replace").read()
        # Scan for /command patterns in raw text
        for cmd in known_commands:
            count = raw.count(f"/{cmd}")
            if count: command_uses[cmd] += count
        # Scan for agent names
        for agent in known_agents:
            count = raw.count(agent)
            if count: agent_uses[agent] += count
        # Parse JSONL for structured tool use
        for line in raw.splitlines():
            if not line.strip(): continue
            try:
                msg = json.loads(line)
                ts = msg.get("timestamp","") or msg.get("created_at","")
                if ts:
                    try:
                        dt = datetime.fromisoformat(ts[:19])
                        if not oldest or dt < oldest: oldest = dt
                        if not newest or dt > newest: newest = dt
                    except: pass
                for block in (msg.get("message",{}).get("content") or []):
                    if isinstance(block, dict) and block.get("type") == "tool_use":
                        if block.get("name") == "Skill":
                            s = block.get("input",{}).get("skill","")
                            if s: skill_uses[s] += 1
            except: pass
    except: pass

date_range = f"{oldest.date()} to {newest.date()}" if oldest and newest else "all time"
print(f"\n{'='*55}")
print(f"  USAGE REPORT  |  {date_range}")
print(f"  Scanned {len(jsonl_files)} conversation files")
print(f"{'='*55}")

print(f"\n  SKILLS  (top 15)")
for name, n in skill_uses.most_common(15):
    print(f"  {n:4d}x  {name}")
if not skill_uses: print("  none recorded yet")

print(f"\n  COMMANDS  (top 15)")
for name, n in command_uses.most_common(15):
    print(f"  {n:4d}x  /{name}")

print(f"\n  AGENTS MENTIONED  (top 10)")
for name, n in agent_uses.most_common(10):
    print(f"  {n:4d}x  {name}")

unused = sorted(c for c in known_commands if command_uses.get(c, 0) == 0)
print(f"\n  NEVER-USED COMMANDS  ({len(unused)})")
for c in unused: print(f"         /{c}")

print(f"\n{'='*55}")
print("  Tip: prune commands with 0 uses after 30+ days.")
print("  Agents with very low counts may have routing issues.")
```

## What It Tells You

| Section | Action |
|---------|--------|
| Top skills | Your core workflows — protect these |
| Top commands | What you actually type — keep these sharp |
| Never-used commands | Candidates to prune after 30 days |
| Low-count agents | Check if description is precise enough for auto-routing |
