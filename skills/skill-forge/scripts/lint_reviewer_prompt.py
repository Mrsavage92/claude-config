#!/usr/bin/env python3
"""Reviewer-prompt linter.

Scans the text of a prompt about to be sent to an independent reviewer agent
(skill-forge scorer, /critique, etc.) and rejects it if it contains priming
language that biases the reviewer toward confirming the requester's hypothesis.

This exists because on 2026-05-17 a primed reviewer gave skill-creator 95/PASS
when a cold reviewer found 3 showstoppers and gave 56/FAIL. The primed prompt
contained "this is a re-verification after fixes" and pointed at a hand-written
artifact. See ~/.claude/projects/.../memory/feedback_never_prime_reviewers.md.

Usage:
    python lint_reviewer_prompt.py <path-to-file-containing-prompt>
    echo "the prompt" | python lint_reviewer_prompt.py -
    python lint_reviewer_prompt.py --string "the prompt as inline arg"

Exit codes:
    0 — clean
    1 — priming detected; prints offending phrases and refuses to bless the prompt
    2 — usage error
"""

import argparse
import re
import sys
from pathlib import Path

# Each pattern is a (regex, why-it-primes) pair. Add new ones as failure modes appear.
PRIMING_PATTERNS = [
    (r"\b(re-?verif(?:y|ication|ied|ying)|re-?score|re-?review|re-?check)\b",
     "Frames the task as confirming a prior state. Cold reviewer should not know there was one."),
    (r"\bafter (?:the )?fix(?:es)?\b",
     "Tells the reviewer fixes happened — they should evaluate on present state only."),
    (r"\bcredit (?:demonstrated|the )?(?:fixes|improvements|changes)\b",
     "Instructs the reviewer to award points for changes they should evaluate independently."),
    (r"\bexpected? to (?:pass|succeed|be (?:better|good|ready))\b",
     "States expected outcome — biases toward confirming it."),
    (r"\bshould now (?:pass|score|succeed|be|clear)\b",
     "States expected outcome."),
    (r"\bverif(?:y|ies|ying) (?:that|the) (?:fix|fixes|patch|change)\b",
     "Reviewer's job is to score, not to verify a specific change."),
    (r"\bthe (?:previous|prior|last|first) (?:reviewer|review|score|agent)\b",
     "Anchors the reviewer on a prior verdict."),
    (r"\bthis time (?:should|will|expect)\b",
     "Implies prior failure + expected improvement."),
    (r"\bconfirm (?:that|the) (?:fix|improvement|change|patch)\b",
     "Confirmation bias trigger — reviewer should disconfirm if warranted."),
    (r"\bnow that (?:the )?(?:bug|issue|fix|patch) (?:is|has been)\b",
     "Tells the reviewer state changed — should not know."),
    (r"\bgive (?:it|this) a (?:fair|fresh|second) (?:shot|chance|look)\b",
     "Mood-priming language — implies the reviewer should be lenient."),
    (r"\bif you (?:agree|see) (?:that|the) (?:fix|improvement|change)\b",
     "Leading question that names the conclusion."),
]


def scan(prompt_text: str) -> list[tuple[str, str, int]]:
    """Return list of (matched_phrase, why_it_primes, line_number) tuples. Empty = clean."""
    hits: list[tuple[str, str, int]] = []
    for pattern, why in PRIMING_PATTERNS:
        regex = re.compile(pattern, flags=re.IGNORECASE)
        for line_no, line in enumerate(prompt_text.splitlines(), start=1):
            for match in regex.finditer(line):
                hits.append((match.group(0), why, line_no))
    return hits


def main():
    parser = argparse.ArgumentParser(description="Lint a reviewer-agent prompt for priming language")
    parser.add_argument("source", nargs="?", help="Path to a file containing the prompt, or '-' for stdin")
    parser.add_argument("--string", help="Pass the prompt as an inline string argument")
    args = parser.parse_args()

    if args.string:
        text = args.string
    elif args.source == "-":
        text = sys.stdin.read()
    elif args.source:
        path = Path(args.source)
        if not path.exists():
            print(f"ERROR: file not found: {args.source}", file=sys.stderr)
            sys.exit(2)
        text = path.read_text(encoding="utf-8")
    else:
        parser.print_help()
        sys.exit(2)

    hits = scan(text)

    if not hits:
        print("CLEAN: no priming language detected.")
        sys.exit(0)

    print(f"PRIMING DETECTED: {len(hits)} hit(s). Rewrite the prompt to be neutral before sending to reviewer.")
    print()
    for phrase, why, line_no in hits:
        print(f"  Line {line_no}: '{phrase}'")
        print(f"    Why it primes: {why}")
        print()
    print("Rule: cold reviewer must not know about prior reviews, prior verdicts, fixes applied, or expected outcomes.")
    print("See ~/.claude/projects/.../memory/feedback_never_prime_reviewers.md")
    sys.exit(1)


if __name__ == "__main__":
    main()
