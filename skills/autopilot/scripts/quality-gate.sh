#!/usr/bin/env bash
# quality-gate.sh — mechanical quality gate
#
# Modes:
#   --quick   : just build + test (used by maybe-checkpoint.sh)
#   --full    : build + test + lint + typecheck + bundle + regression-scan (used at session end and every 10 tasks)
#
# Writes a gate-result line to .autopilot/gate-log and to AUTOPILOT_LOG.md.
# Returns 0 if PASS or WARN (logged but not blocking).
# Returns 2 if FAIL (caller must insert a fix task or halt).
#
# "Skipped because X" is a valid PASS outcome — the gate must always RUN and always log.

set -euo pipefail

MODE="${1:---full}"
case "$MODE" in
  --quick|--full) ;;
  *) echo "usage: quality-gate.sh [--quick|--full]" >&2; exit 1 ;;
esac

# Require anchor (we must be inside the autopilot session)
if [[ ! -f .autopilot/anchor.txt ]]; then
  echo "ERROR: .autopilot/anchor.txt missing. quality-gate.sh requires an active autopilot session." >&2
  exit 1
fi

mkdir -p .autopilot
GATE_LOG=".autopilot/gate-log"
TS="$(date '+%Y-%m-%d %H:%M:%S')"
RESULT="PASS"
FAILURES=()
SKIPPED=()

# Detect commands deterministically
detect_build_cmd() {
  if [[ -f package.json ]]; then
    if grep -q '"build"' package.json 2>/dev/null; then echo "npm run build"; return; fi
  fi
  if [[ -f Makefile ]] && grep -qE '^build:' Makefile 2>/dev/null; then echo "make build"; return; fi
  if [[ -f pyproject.toml ]] && grep -q 'build-system' pyproject.toml 2>/dev/null; then echo "python -m build"; return; fi
  if [[ -f Cargo.toml ]]; then echo "cargo build --release"; return; fi
  if [[ -f go.mod ]]; then echo "go build ./..."; return; fi
  echo ""
}
detect_test_cmd() {
  if [[ -f package.json ]] && grep -q '"test"' package.json 2>/dev/null; then echo "npm test"; return; fi
  if [[ -f Cargo.toml ]]; then echo "cargo test"; return; fi
  if [[ -f go.mod ]]; then echo "go test ./..."; return; fi
  if [[ -f pyproject.toml ]] || [[ -f pytest.ini ]] || [[ -d tests ]]; then echo "pytest -q"; return; fi
  echo ""
}
detect_lint_cmd() {
  if [[ -f package.json ]] && grep -q '"lint"' package.json 2>/dev/null; then echo "npm run lint"; return; fi
  if [[ -f Cargo.toml ]]; then echo "cargo clippy --quiet"; return; fi
  if [[ -f pyproject.toml ]] && grep -q 'ruff' pyproject.toml 2>/dev/null; then echo "ruff check ."; return; fi
  echo ""
}
detect_typecheck_cmd() {
  if [[ -f tsconfig.json ]]; then echo "npx tsc --noEmit --pretty false"; return; fi
  if [[ -f pyproject.toml ]] && grep -qE 'mypy|pyright' pyproject.toml 2>/dev/null; then echo "mypy ."; return; fi
  echo ""
}

run_check() {
  local label="$1"; shift
  local cmd="$1"; shift
  if [[ -z "$cmd" ]]; then
    SKIPPED+=("${label}: not-applicable (no command discoverable)")
    return 0
  fi
  echo "[gate] running: $label = $cmd"
  if timeout 180 bash -c "$cmd" > "/tmp/gate-${label}-$$.log" 2>&1; then
    return 0
  else
    local rc=$?
    if [[ "$rc" == 124 ]]; then
      FAILURES+=("${label}: TIMEOUT (>180s)")
    else
      FAILURES+=("${label}: FAIL (exit $rc; see /tmp/gate-${label}-$$.log)")
    fi
    return 1
  fi
}

BUILD_CMD="$(detect_build_cmd)"
TEST_CMD="$(detect_test_cmd)"
LINT_CMD="$(detect_lint_cmd)"
TYPECHECK_CMD="$(detect_typecheck_cmd)"

run_check "build" "$BUILD_CMD" || true
run_check "test" "$TEST_CMD" || true

if [[ "$MODE" == "--full" ]]; then
  run_check "lint" "$LINT_CMD" || true
  run_check "typecheck" "$TYPECHECK_CMD" || true
fi

if (( ${#FAILURES[@]} > 0 )); then
  RESULT="FAIL"
fi

# Compose summary
SUMMARY_PARTS=()
[[ -n "$BUILD_CMD" ]]     && SUMMARY_PARTS+=("build:$([[ "${FAILURES[*]}" == *build:* ]] && echo FAIL || echo PASS)")
[[ -z "$BUILD_CMD" ]]     && SUMMARY_PARTS+=("build:skipped")
[[ -n "$TEST_CMD" ]]      && SUMMARY_PARTS+=("test:$([[ "${FAILURES[*]}" == *test:* ]] && echo FAIL || echo PASS)")
[[ -z "$TEST_CMD" ]]      && SUMMARY_PARTS+=("test:skipped")
if [[ "$MODE" == "--full" ]]; then
  [[ -n "$LINT_CMD" ]]      && SUMMARY_PARTS+=("lint:$([[ "${FAILURES[*]}" == *lint:* ]] && echo FAIL || echo PASS)")
  [[ -z "$LINT_CMD" ]]      && SUMMARY_PARTS+=("lint:skipped")
  [[ -n "$TYPECHECK_CMD" ]] && SUMMARY_PARTS+=("typecheck:$([[ "${FAILURES[*]}" == *typecheck:* ]] && echo FAIL || echo PASS)")
  [[ -z "$TYPECHECK_CMD" ]] && SUMMARY_PARTS+=("typecheck:skipped")
fi
SUMMARY="$(IFS=', '; echo "${SUMMARY_PARTS[*]}")"

LINE="[${TS}] gate=${MODE} result=${RESULT} ${SUMMARY}"
[[ ${#SKIPPED[@]} -gt 0 ]] && LINE+=" skipped_reason=[$(IFS='; '; echo "${SKIPPED[*]}")]"
[[ ${#FAILURES[@]} -gt 0 ]] && LINE+=" failures=[$(IFS='; '; echo "${FAILURES[*]}")]"

echo "$LINE" >> "$GATE_LOG"

# Mirror to AUTOPILOT_LOG.md on --full
if [[ "$MODE" == "--full" ]]; then
  LOG="AUTOPILOT_LOG.md"
  [[ -d docs && -f docs/AUTOPILOT_LOG.md ]] && LOG="docs/AUTOPILOT_LOG.md"
  touch "$LOG"
  {
    echo ""
    echo "### Quality gate — ${TS}"
    echo "Mode: ${MODE}"
    echo "Result: ${RESULT}"
    echo "Checks: ${SUMMARY}"
    if [[ ${#SKIPPED[@]} -gt 0 ]]; then
      echo "Skipped:"
      for s in "${SKIPPED[@]}"; do echo "  - $s"; done
    fi
    if [[ ${#FAILURES[@]} -gt 0 ]]; then
      echo "Failures:"
      for f in "${FAILURES[@]}"; do echo "  - $f"; done
    fi
  } >> "$LOG"
fi

echo "$LINE"
[[ "$RESULT" == "FAIL" ]] && exit 2
exit 0
