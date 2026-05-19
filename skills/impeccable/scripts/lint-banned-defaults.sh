#!/usr/bin/env bash
# lint-banned-defaults.sh — refuses code that reaches for banned default aesthetics
# per [feedback_taste_calibration].
#
# Banned defaults: Geist as PRIMARY font (heading), dark-navy+gold combo, bento grid
# without reference anchor, Lucide-tinted-squares icons, GSAP pinned-scroll as default,
# centered-hero+gradient-blob pattern.
#
# Override: add `// craft: banned-default-allowed reason: <ref>` on the line above
# the violation.

set -euo pipefail

if (( $# == 0 )); then
  echo "usage: lint-banned-defaults.sh <file1> [file2 ...]" >&2
  exit 1
fi

violations=()
check() {
  local label="$1"; shift
  local pattern="$1"; shift
  for f in "$@"; do
    [[ ! -f "$f" ]] && continue
    local match
    match=$(grep -niE "$pattern" "$f" 2>/dev/null || true)
    [[ -z "$match" ]] && continue
    while IFS= read -r ln; do
      LINE_NUM=$(echo "$ln" | cut -d: -f1)
      PREV_LINE=$(sed -n "$((LINE_NUM - 1))p" "$f" 2>/dev/null || true)
      if echo "$PREV_LINE" | grep -E 'craft:\s*banned-default-allowed' > /dev/null; then
        continue  # explicitly overridden
      fi
      violations+=("$f:$ln  [$label]")
    done <<< "$match"
  done
}

# Geist as primary heading font — looks for --font-display: var(--font-geist or font-family with Geist as first
check "Geist as primary" 'font-display\s*:\s*[^;]*[Gg]eist|font-family\s*:\s*["'"'"']?[Gg]eist[^;]*;.*--font-display' "$@"

# Dark navy + gold
check "Dark navy + gold accent" '(oklch\(.*230.*\).*gold|#0a0e1a.*#d4af37|navy-blue.*gold|dark-navy.*gold-accent)' "$@"

# Bento grid keyword
check "Bento grid keyword" '\b(bento|Bento|BentoGrid|bento-grid)\b' "$@"

# Lucide tinted squares pattern (icon inside a rounded color-tinted div)
check "Lucide tinted squares" 'rounded-(lg|md|xl)\s+bg-[a-z]+-(50|100|500/10).*Lucide|<Lucide[A-Z][a-z]+.*className=.*rounded-(lg|md|xl)\s+bg-' "$@"

# GSAP pinned scroll as default (ScrollTrigger pin: true without a comment justifying it)
check "GSAP pinned scroll" 'ScrollTrigger\.create\(.*pin:\s*true|trigger.*pin:\s*true' "$@"

# Centered hero + gradient blob heuristic — looking for hero/Hero section with absolute-positioned blur blob
check "Hero gradient blob" '(hero|Hero).*absolute.*(blur-3xl|filter:\s*blur\(.*\d{2,}px)' "$@"

if (( ${#violations[@]} > 0 )); then
  echo "ERROR: banned-default reaches detected in scanned files:" >&2
  for v in "${violations[@]}"; do echo "  $v" >&2; done
  echo "" >&2
  echo "  Override per-line by adding above the violation:" >&2
  echo "    // craft: banned-default-allowed reason: <reference-or-anchor>" >&2
  exit 2
fi

echo "Banned-defaults lint clean: $# file(s) scanned."
