#!/usr/bin/env bash
# Handoff checklist — pre-commit gate for any built page.
# Usage: bash run-handoff-check.sh <path-to-built-file>
# Exit 0 = ship | Exit 1 = banned violation found | Exit 2 = misconfigured

set -u

FILE="${1:-}"
if [ -z "$FILE" ]; then
  echo "[handoff-check] usage: $0 <file>" >&2
  exit 2
fi
if [ ! -f "$FILE" ]; then
  echo "[handoff-check] file not found: $FILE" >&2
  exit 2
fi

TASTE_CHECK="$HOME/.claude/skills/taste-skill/data/check_taste.py"
if [ ! -f "$TASTE_CHECK" ]; then
  # Windows path fallback (git bash on Windows resolves $HOME to /c/Users/Adam)
  TASTE_CHECK="/c/Users/Adam/.claude/skills/taste-skill/data/check_taste.py"
fi

BANNED_HITS=0
CAUTION_HITS=0
REPORT=""

log_banned() {
  REPORT="${REPORT}  [banned]   $1  ::  $2\n"
  BANNED_HITS=$((BANNED_HITS + 1))
}
log_caution() {
  REPORT="${REPORT}  [caution]  $1  ::  $2\n"
  CAUTION_HITS=$((CAUTION_HITS + 1))
}

# ---------- check 1: taste-rules.csv ----------
if [ -f "$TASTE_CHECK" ]; then
  # Default text output is "[severity] id matched: '...' / rule: ... / fix: ..."
  # Grep banned lines directly; skip JSON intermediate to dodge cross-platform /tmp resolution.
  TASTE_OUT=$(python "$TASTE_CHECK" "$FILE" 2>/dev/null || true)
  while IFS= read -r line; do
    if echo "$line" | grep -qE '^\[banned'; then
      RULE_ID=$(echo "$line" | sed -E 's/^\[[^]]+\][[:space:]]+([a-z0-9-]+).*/\1/')
      MATCHED=$(echo "$line" | grep -oE "matched: '[^']+'" || echo "match")
      log_banned "$RULE_ID" "$MATCHED"
    fi
  done <<< "$TASTE_OUT"
else
  log_caution "taste-check-missing" "taste-skill/data/check_taste.py not found at $TASTE_CHECK"
fi

# ---------- check 2: debug code shipped ----------
if grep -nE '(console\.(log|debug|trace)|debugger;|console\.warn)' "$FILE" >/dev/null 2>&1; then
  HITS=$(grep -nE '(console\.(log|debug|trace)|debugger;)' "$FILE" | head -3 | tr '\n' ';')
  log_banned "debug-code-shipped" "$HITS"
fi

# ---------- check 3: focus states on interactive elements ----------
if grep -qE '<(button|a)\b' "$FILE" 2>/dev/null; then
  if ! grep -qE '(focus-visible:|focus:ring|focus:outline)' "$FILE" 2>/dev/null; then
    log_banned "missing-focus-state" "interactive element without focus-visible:/focus:ring/focus:outline"
  fi
fi

# ---------- check 4: prefers-reduced-motion respected when motion lib imported ----------
if grep -qE "from\s+['\"](framer-motion|gsap|@react-spring)" "$FILE" 2>/dev/null; then
  # check whole project dir for any motion guard
  PROJECT_DIR=$(dirname "$FILE")
  if ! grep -rqE '(motion-safe:|useReducedMotion|prefers-reduced-motion)' "$PROJECT_DIR" --include='*.tsx' --include='*.ts' --include='*.css' 2>/dev/null; then
    log_banned "missing-reduced-motion-guard" "motion library imported without prefers-reduced-motion guard anywhere in $(basename "$PROJECT_DIR")"
  fi
fi

# ---------- check 5: file size <=800 ----------
LINES=$(wc -l < "$FILE")
if [ "$LINES" -gt 800 ]; then
  log_banned "file-too-large" "$LINES lines (max 800)"
fi

# ---------- check 6: no custom cursor unless explicit opt-in ----------
if grep -qE '(cursor:\s*url\(|cursor-custom)' "$FILE" 2>/dev/null; then
  if ! grep -qE '(custom-cursor:\s*explicit-opt-in|cursor-opt-in)' "$FILE" 2>/dev/null; then
    log_banned "custom-cursor-default" "custom cursor without explicit opt-in comment"
  fi
fi

# ---------- check 7: per-page SEO ----------
if echo "$FILE" | grep -qE '(page\.tsx|page\.jsx)$'; then
  # Next.js page
  if ! grep -qE 'export\s+(const|async\s+function)\s+(metadata|generateMetadata)' "$FILE" 2>/dev/null; then
    log_caution "missing-page-metadata" "Next.js page without exported metadata/generateMetadata"
  fi
elif echo "$FILE" | grep -qE 'src/pages/.*\.tsx$'; then
  # Vite page
  if ! grep -qE 'useSeo\(' "$FILE" 2>/dev/null; then
    log_caution "missing-useSeo" "Vite page without useSeo() call"
  fi
fi

# ---------- check 8: fake placeholder content ----------
if grep -qE '(John Doe|Sarah Chan|Jane Doe|Jack Su|Acme Corp|99\.99|123-456-7890)' "$FILE" 2>/dev/null; then
  HITS=$(grep -oE '(John Doe|Sarah Chan|Jane Doe|Acme Corp|99\.99)' "$FILE" | sort -u | tr '\n' ',' | sed 's/,$//')
  log_caution "fake-placeholder-content" "found: $HITS"
fi

# ---------- check 9: undersized tap targets ----------
if grep -qE '<button[^>]*\bh-[1-9]\b' "$FILE" 2>/dev/null && ! grep -qE '<button[^>]*\bh-(10|11|12)' "$FILE" 2>/dev/null; then
  log_caution "tap-target-undersize" "button with h-1..h-9 (under 40px); mobile tap target needs >=44px"
fi

# ---------- check 10: no Inter literal ----------
if grep -qE "(font-family:\s*[\"']?Inter|fontFamily:\s*['\"]Inter)" "$FILE" 2>/dev/null; then
  log_banned "inter-font-literal" "font-family: Inter found"
fi

# ---------- summary ----------
TOTAL=$((BANNED_HITS + CAUTION_HITS))
if [ "$TOTAL" -eq 0 ]; then
  echo "[PASS] no handoff violations in $FILE"
  exit 0
fi

echo "[handoff-check] $FILE"
printf "%b" "$REPORT"
echo "Banned: $BANNED_HITS | Caution: $CAUTION_HITS"

if [ "$BANNED_HITS" -gt 0 ]; then
  echo "Commit blocked. Fix banned items, re-run."
  exit 1
fi
exit 0
