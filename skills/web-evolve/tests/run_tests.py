#!/usr/bin/env python3
"""
Structural tests for web-evolve SKILL.md.
Tests that the spec is internally consistent — not that it works at runtime.

Run: python tests/run_tests.py
Exit 0 = all pass. Exit 1 = failures.
"""

import json, re, sys
from pathlib import Path

SKILL = Path(__file__).parent.parent / "SKILL.md"
text = SKILL.read_text(encoding="utf-8", errors="ignore")

failures = []

def check(name, condition, detail=""):
    if not condition:
        failures.append(f"FAIL: {name}" + (f" — {detail}" if detail else ""))
    else:
        print(f"PASS: {name}")

# 1. Required sections present
for section in ["## Definitions", "## Per-run flow", "## Scoring rubric",
                 "## Fix routing", "## Area enumeration", "## State schema",
                 "## Output format", "## Anti-patterns", "## References"]:
    check(f"Section present: {section}", section in text)

# 2. All 7 step headers present
for step in ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5", "Step 6", "Step 7"]:
    check(f"Step present: {step}", f"### {step}" in text)

# 3. State schema is valid JSON
m = re.search(r"```json\n(\{.*?\})\n```", text, re.DOTALL)
if m:
    try:
        state = json.loads(m.group(1))
        check("State schema valid JSON", True)
        check("State schema has run_counter", "run_counter" in state)
        check("State schema has session_skill_calls", "session_skill_calls" in state)
        check("State schema has last_scope", "last_scope" in state)
        areas = state.get("areas", [])
        check("State schema has areas", len(areas) >= 1)
        if areas:
            done = next((a for a in areas if a.get("status") == "done"), None)
            if done:
                check("Done area has pass field", "pass" in done)
                check("Done area has taste_verified field", "taste_verified" in done)
            pending = next((a for a in areas if a.get("status") == "pending"), None)
            if pending:
                check("Pending area has pass: 0", pending.get("pass") == 0)
                check("Pending area score is null", pending.get("score") is None)
    except json.JSONDecodeError as e:
        check("State schema valid JSON", False, str(e))
else:
    check("State schema JSON block found", False)

# 4. Scoring rubric has 4 dimensions
for dim in ["### Hook", "### Visuals", "### Clarity", "### Function"]:
    check(f"Rubric dimension: {dim}", dim in text)

# 5. Hook rubric has 10-test checklist
check("Hook has 10-test calibration", "10 sales-page tests" in text or
      re.search(r"Score \d+–\d+ if .*8 pass", text) is not None)

# 6. Clarity has 6-test checklist
check("Clarity has 6-test calibration", "6 tests" in text.lower() or
      re.search(r"Score \d+–\d+ if .*5 pass", text) is not None)

# 7. Visuals has 6-check calibration
check("Visuals has 6-check calibration", "6 binary checks" in text or
      re.search(r"Score \d+–\d+ if all 6 pass", text) is not None)

# 8. Fix routing table has expected dimension rows
for dim in ["Hook", "Visuals", "Clarity", "Function"]:
    check(f"Fix routing has {dim} row", dim in text.split("## Fix routing")[1].split("## Area")[0])

# 9. Anti-patterns section non-empty
ap_section = text.split("## Anti-patterns")[1] if "## Anti-patterns" in text else ""
check("Anti-patterns has at least 5 entries",
      len(re.findall(r"^- \*\*", ap_section, re.MULTILINE)) >= 5)

# 10. No broken [PLACEHOLDER] tokens left in routing table
routing_section = text.split("## Fix routing")[1].split("## Area")[0] if "## Fix routing" in text else ""
check("No [placeholder] tokens in routing table",
      "[route]" not in routing_section or "mode:rebuild" in routing_section,
      "Check that [route] is only used as part of mode:rebuild pattern")

# 11. Taste gate has both PowerShell and Bash variants
check("Taste gate has PowerShell variant", "$env:USERPROFILE" in text)
check("Taste gate has Bash variant", "~/.claude/skills/taste-skill" in text)

# 12. context budget uses session_skill_calls (persisted)
check("Budget check references session_skill_calls", "session_skill_calls" in text.split("## Fix routing")[0])

# 13. session_skill_calls NOT reset on scope switch (spec says Do NOT reset)
check("session_skill_calls not reset on scope switch",
      "Do NOT reset" in text and "session_skill_calls" in text[text.find("Do NOT reset")-50:text.find("Do NOT reset")+100])

# 14. taste gate has max iteration tracking
check("Taste gate has max iteration limit", "taste_gate_attempts" in text and "Max 2" in text)

# 15. run_counter and area.run are explicitly two separate writes
check("run_counter vs area.run explicitly separated",
      "Two separate" in text or "two separate" in text or "do not conflate" in text.lower())

# 16. Execution-path: regression revert must not increment run_counter
check("Regression revert must NOT increment run_counter",
      "Do NOT increment `run_counter`. A revert" in text)

# 17. Execution-path: revert failure is handled
check("Revert failure halts with message",
      "REVERT_FAILED" in text or "revert.*failed" in text.lower())

# 18. Execution-path: taste gate no-op detection
check("Taste gate no-op prevented",
      "different change" in text or "no-op" in text)

# 19. area.pass reset on needs-work re-entry
check("area.pass reset on needs-work re-entry",
      "reset `area.pass` to 0" in text or "reset area.pass" in text.lower())

# 20. halt message includes session_skill_calls value
check("Halt message includes session_skill_calls",
      "session_skill_calls=" in text or "session_skill_calls=[" in text)

# Summary
print(f"\n{len(failures)} failure(s) out of 26 checks.")
if failures:
    for f in failures:
        print(f)
    sys.exit(1)
else:
    print("All checks passed.")
    sys.exit(0)
