#!/usr/bin/env bash
# lint-svg-fontfamily.sh — refuses SVG elements that set fontFamily="var(--font-X)".
# CSS var() is not valid in SVG presentational attributes; the font falls back to default.
# This was caught in the forge baseline at ServicesSection.tsx lines 204/207/210.

set -euo pipefail

if (( $# == 0 )); then
  echo "usage: lint-svg-fontfamily.sh <file1.tsx> [file2.tsx ...]" >&2
  exit 1
fi

hits=()
for f in "$@"; do
  [[ ! -f "$f" ]] && continue
  # Look for inline SVG <text>, <tspan>, <textPath> with fontFamily="var(...)"
  # or fontFamily='var(...)' or fontFamily={`var(...)`} or fontFamily={"var(...)"}
  match=$(grep -nE 'fontFamily\s*=\s*["{`]?\s*var\(' "$f" || true)
  if [[ -n "$match" ]]; then
    while IFS= read -r line; do
      hits+=("$f:$line")
    done <<< "$match"
  fi
done

if (( ${#hits[@]} > 0 )); then
  echo "ERROR: SVG fontFamily=var(...) detected. CSS var() is not valid in SVG presentational attributes." >&2
  echo "  Use a literal font-stack string (e.g. fontFamily=\"Geist Sans, system-ui, sans-serif\") OR" >&2
  echo "  inline the SVG inside a CSS-styled parent and rely on inherited font-family." >&2
  echo "" >&2
  for h in "${hits[@]}"; do echo "  $h" >&2; done
  exit 2
fi

echo "SVG fontFamily lint clean: $# file(s) scanned."
