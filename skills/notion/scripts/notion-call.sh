#!/usr/bin/env bash
# notion-call.sh — the ONLY sanctioned REST path to the Notion API.
#
# The skill forbids the model from writing any other auth code (no urllib.request, no
# inline TOKEN = '...', no Python wrappers). All Notion REST traffic flows through here.
#
# Reads NOTION_INTERNAL_TOKEN from env. Fails loudly with exit 1 if unset.
# Auto-chunks PATCH /v1/blocks/<id>/children at 100 blocks per request (Notion API limit).
# Logs every call to .notion-skill/api-log in the current working directory.
#
# Usage:
#   notion-call.sh GET    /v1/pages/<id>
#   notion-call.sh POST   /v1/pages          --body-file body.json
#   notion-call.sh PATCH  /v1/pages/<id>     --body-file patch.json
#   notion-call.sh PATCH  /v1/blocks/<id>/children --children-file blocks.json   # auto-chunked
#   notion-call.sh DELETE /v1/blocks/<id>

set -euo pipefail

# Require env var
if [[ -z "${NOTION_INTERNAL_TOKEN:-}" ]]; then
  echo "ERROR: NOTION_INTERNAL_TOKEN env var is not set." >&2
  echo "  Set it in ~/.claude/settings.json under \"env\" before invoking the notion skill." >&2
  echo "  If the leaked token was rotated, paste the NEW token there." >&2
  exit 1
fi

# Refuse the previously-leaked token by hash (literal scrubbed from git history 2026-06-29; no secret stored here)
if [[ "$(printf '%s' "$NOTION_INTERNAL_TOKEN" | sha256sum | cut -d' ' -f1)" == "596985c38e6ca3b5ef20a1d979c30495ea97ca3f8c39b800290f7e45eb426809" ]]; then
  echo "ERROR: NOTION_INTERNAL_TOKEN is set to the previously-leaked value." >&2
  echo "  Rotate at https://api.notion.com/my-integrations and update settings.json before continuing." >&2
  exit 1
fi

METHOD="${1:?usage: notion-call.sh <GET|POST|PATCH|DELETE> <path> [--body-file FILE | --children-file FILE]}"
PATH_URL="${2:?path required, e.g. /v1/pages/<id>}"
shift 2

BODY_FILE=""
CHILDREN_FILE=""
VERBOSE=""
while (( $# > 0 )); do
  case "$1" in
    --body-file) BODY_FILE="$2"; shift 2;;
    --children-file) CHILDREN_FILE="$2"; shift 2;;
    --verbose|-v) VERBOSE="yes"; shift;;
    *) echo "ERROR: unknown arg $1" >&2; exit 1;;
  esac
done

BASE="https://api.notion.com"
URL="${BASE}${PATH_URL}"
TS="$(date '+%Y-%m-%d %H:%M:%S')"

mkdir -p .notion-skill
LOG=".notion-skill/api-log"

# Standard headers
auth_header="Authorization: Bearer ${NOTION_INTERNAL_TOKEN}"
ver_header="Notion-Version: 2022-06-28"
ct_header="Content-Type: application/json"

# Helper — single curl call returning HTTP status and body
do_call() {
  local m="$1"; local u="$2"; local body="${3:-}"
  local out
  local vflag=""
  [[ "$VERBOSE" == "yes" ]] && vflag="-v"
  if [[ -n "$body" ]]; then
    out="$(curl $vflag -sS -X "$m" "$u" \
      -H "$auth_header" -H "$ver_header" -H "$ct_header" \
      -d @"$body" -w "\n__HTTP_STATUS__%{http_code}" 2>&1)"
  else
    out="$(curl $vflag -sS -X "$m" "$u" \
      -H "$auth_header" -H "$ver_header" -H "$ct_header" \
      -w "\n__HTTP_STATUS__%{http_code}" 2>&1)"
  fi
  echo "$out"
}

if [[ "$METHOD" == "PATCH" && "$PATH_URL" == *"/children" && -n "$CHILDREN_FILE" ]]; then
  # Auto-chunked block append
  if ! command -v jq > /dev/null; then
    echo "ERROR: jq required for chunked block append. Install jq." >&2
    exit 1
  fi
  TOTAL=$(jq '.children | length' "$CHILDREN_FILE")
  CHUNK=100
  OFFSET=0
  CHUNK_NUM=0
  while (( OFFSET < TOTAL )); do
    CHUNK_NUM=$((CHUNK_NUM + 1))
    TMP="$(mktemp -t notion-chunk-XXXXXX.json)"
    jq --argjson off "$OFFSET" --argjson n "$CHUNK" '{children: (.children[$off:$off+$n])}' "$CHILDREN_FILE" > "$TMP"
    RAW="$(do_call PATCH "$URL" "$TMP")"
    STATUS=$(echo "$RAW" | grep -oE '__HTTP_STATUS__[0-9]+$' | sed 's/__HTTP_STATUS__//')
    BODY=$(echo "$RAW" | sed '$d')
    echo "[$TS] PATCH $PATH_URL chunk=$CHUNK_NUM/$((((TOTAL-1)/CHUNK)+1)) range=[$OFFSET,$((OFFSET+CHUNK))) status=$STATUS" >> "$LOG"
    rm -f "$TMP"
    if [[ "$STATUS" != "200" ]]; then
      echo "ERROR: chunk $CHUNK_NUM failed with HTTP $STATUS" >&2
      echo "$BODY" >&2
      exit 2
    fi
    OFFSET=$((OFFSET + CHUNK))
  done
  echo "Appended $TOTAL blocks in $CHUNK_NUM chunks to $PATH_URL"
else
  # Single call
  if [[ -n "$BODY_FILE" ]]; then
    RAW="$(do_call "$METHOD" "$URL" "$BODY_FILE")"
  else
    RAW="$(do_call "$METHOD" "$URL")"
  fi
  STATUS=$(echo "$RAW" | grep -oE '__HTTP_STATUS__[0-9]+$' | sed 's/__HTTP_STATUS__//')
  BODY=$(echo "$RAW" | sed '$d')
  echo "[$TS] $METHOD $PATH_URL status=$STATUS" >> "$LOG"
  echo "$BODY"
  case "$STATUS" in
    2*) exit 0 ;;
    *) echo "ERROR: HTTP $STATUS" >&2; exit 2 ;;
  esac
fi
