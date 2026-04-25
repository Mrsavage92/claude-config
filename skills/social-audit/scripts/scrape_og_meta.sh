#!/usr/bin/env bash
# scrape_og_meta.sh — Extract follower counts and profile metadata from social platforms
# via Open Graph meta tags using facebookexternalhit UA.
# Works logged-out. No auth required. Rate-limited to avoid IP bans.
#
# Usage:
#   bash scrape_og_meta.sh <platform> <handle>
#   bash scrape_og_meta.sh instagram glossbeauty.bylouise
#   bash scrape_og_meta.sh tiktok glossbeautybylouise
#   bash scrape_og_meta.sh facebook glossbeauty.bylouise1
#   bash scrape_og_meta.sh all glossbeauty.bylouise  # tries all platforms
#
# Returns structured output for parsing.
# LIVE-VERIFIED selectors: 2026-04-25 against @evoquemakeup, @frank_bod,
# @glossbeauty.bylouise, @glossbeautybylouise, glossbeauty.bylouise1

set -euo pipefail

PLATFORM="${1:-}"
HANDLE="${2:-}"
UA="facebookexternalhit/1.1"
RETRY_COUNT=2
SLEEP_BETWEEN=1.5  # seconds between requests — avoids rate limiting

if [[ -z "$PLATFORM" || -z "$HANDLE" ]]; then
  echo "Usage: $0 <platform|all> <handle>"
  echo "Platforms: instagram tiktok facebook pinterest youtube linkedin all"
  exit 1
fi

probe() {
  local url="$1"
  local attempt=0
  local result=""
  while [[ $attempt -lt $RETRY_COUNT ]]; do
    result=$(curl -sL --connect-timeout 10 --max-time 25 -A "$UA" "$url" 2>/dev/null \
      | grep -oiE 'og:(description|title)[^>]{0,500}' | head -4) || true
    if [[ -n "$result" ]]; then
      echo "$result"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep "$SLEEP_BETWEEN"
  done
  echo "UNREACHABLE"
}

probe_http_status() {
  local url="$1"
  curl -sIL --connect-timeout 8 --max-time 15 -A "Mozilla/5.0" "$url" 2>/dev/null \
    | head -1 | awk '{print $2}' || echo "0"
}

scrape_instagram() {
  local handle="$1"
  local url="https://www.instagram.com/${handle}/"
  echo "PLATFORM: Instagram"
  echo "HANDLE: @${handle}"
  echo "URL: ${url}"
  local raw
  raw=$(probe "$url")
  echo "RAW_OG: ${raw}"
  if [[ "$raw" == "UNREACHABLE" ]]; then
    echo "STATUS: unreachable after ${RETRY_COUNT} attempts"
    return
  fi
  # Parse: "698K Followers, 5,995 Following, 12,038 Posts – see Instagram..."
  local followers
  followers=$(echo "$raw" | grep -oiE '[0-9,.]+[KkMm]? [Ff]ollower' | head -1)
  local posts
  posts=$(echo "$raw" | grep -oiE '[0-9,.]+[KkMm]? [Pp]ost' | head -1)
  local following
  following=$(echo "$raw" | grep -oiE '[0-9,.]+[KkMm]? [Ff]ollowing' | head -1)
  echo "FOLLOWERS: ${followers:-unknown}"
  echo "FOLLOWING: ${following:-unknown}"
  echo "POSTS: ${posts:-unknown}"
  sleep "$SLEEP_BETWEEN"
}

scrape_tiktok() {
  local handle="$1"
  local url="https://www.tiktok.com/@${handle}"
  echo "PLATFORM: TikTok"
  echo "HANDLE: @${handle}"
  echo "URL: ${url}"
  local raw
  raw=$(probe "$url")
  echo "RAW_OG: ${raw}"
  if [[ "$raw" == "UNREACHABLE" ]]; then
    echo "STATUS: unreachable after ${RETRY_COUNT} attempts"
    return
  fi
  # og:desc format: "@handle X Followers, Y Following, Z Likes - Watch..."
  local followers
  followers=$(echo "$raw" | grep -oiE '[0-9,.]+[KkMm]? [Ff]ollower' | head -1)
  local likes
  likes=$(echo "$raw" | grep -oiE '[0-9,.]+[KkMm]? [Ll]ike' | head -1)
  echo "FOLLOWERS: ${followers:-unknown}"
  echo "LIKES: ${likes:-unknown}"
  # Note: data-e2e selectors work in Puppeteer for more detail
  echo "NOTE: For video grid data, use Puppeteer (data-e2e selectors) — og:description is profile-only"
  sleep "$SLEEP_BETWEEN"
}

scrape_facebook() {
  local handle="$1"
  local url="https://www.facebook.com/${handle}/"
  echo "PLATFORM: Facebook"
  echo "HANDLE: ${handle}"
  echo "URL: ${url}"
  local raw
  raw=$(probe "$url")
  echo "RAW_OG: ${raw}"
  if [[ "$raw" == "UNREACHABLE" ]]; then
    echo "STATUS: unreachable after ${RETRY_COUNT} attempts"
    return
  fi
  # og:desc format: "Brand, Location. X likes · Y talking about this. Bio"
  local likes
  likes=$(echo "$raw" | grep -oiE '[0-9,]+ like' | head -1)
  local talking
  talking=$(echo "$raw" | grep -oiE '[0-9,]+ talking' | head -1)
  echo "LIKES: ${likes:-unknown}"
  echo "TALKING_ABOUT: ${talking:-unknown}"
  # body.innerText via Puppeteer gives richer data (email, linked socials, posts)
  echo "NOTE: Use Puppeteer for full FB data — body.innerText includes email, reviews, recent posts"
  sleep "$SLEEP_BETWEEN"
}

scrape_pinterest() {
  local handle="$1"
  local url="https://www.pinterest.com/${handle}/"
  echo "PLATFORM: Pinterest"
  echo "HANDLE: ${handle}"
  echo "URL: ${url}"
  local http_status
  http_status=$(probe_http_status "$url")
  echo "HTTP_STATUS: ${http_status}"
  if [[ "$http_status" == "200" ]]; then
    local raw
    raw=$(probe "$url")
    echo "RAW_OG: ${raw}"
    local views
    views=$(echo "$raw" | grep -oiE '[0-9,.]+[KkMm]? monthly' | head -1)
    echo "MONTHLY_VIEWS: ${views:-unknown}"
  else
    echo "STATUS: absent or blocked (HTTP ${http_status})"
  fi
  sleep "$SLEEP_BETWEEN"
}

scrape_youtube() {
  local handle="$1"
  local url="https://www.youtube.com/@${handle}"
  echo "PLATFORM: YouTube"
  echo "HANDLE: @${handle}"
  echo "URL: ${url}"
  local http_status
  http_status=$(probe_http_status "$url")
  echo "HTTP_STATUS: ${http_status}"
  if [[ "$http_status" == "200" ]]; then
    local raw
    raw=$(probe "$url")
    echo "RAW_OG: ${raw}"
    local subs
    subs=$(echo "$raw" | grep -oiE '[0-9,.]+[KkMm]? subscriber' | head -1)
    echo "SUBSCRIBERS: ${subs:-unknown}"
  else
    echo "STATUS: absent or blocked (HTTP ${http_status})"
  fi
  sleep "$SLEEP_BETWEEN"
}

scrape_linkedin() {
  local handle="$1"
  local url="https://www.linkedin.com/company/${handle}/"
  echo "PLATFORM: LinkedIn"
  echo "HANDLE: ${handle}"
  echo "URL: ${url}"
  local raw
  raw=$(probe "$url")
  echo "RAW_OG: ${raw}"
  local followers
  followers=$(echo "$raw" | grep -oiE '[0-9,]+ follower' | head -1)
  echo "FOLLOWERS: ${followers:-unknown}"
  sleep "$SLEEP_BETWEEN"
}

# ── Dispatch ──────────────────────────────────────────────────────────────────
echo "=== scrape_og_meta.sh — $(date '+%Y-%m-%d %H:%M:%S') ==="
echo ""

case "$PLATFORM" in
  instagram) scrape_instagram "$HANDLE" ;;
  tiktok) scrape_tiktok "$HANDLE" ;;
  facebook) scrape_facebook "$HANDLE" ;;
  pinterest) scrape_pinterest "$HANDLE" ;;
  youtube) scrape_youtube "$HANDLE" ;;
  linkedin) scrape_linkedin "$HANDLE" ;;
  all)
    scrape_instagram "$HANDLE"
    echo "---"
    scrape_tiktok "$HANDLE"
    echo "---"
    scrape_facebook "${HANDLE}1"  # Try common FB numeric suffix
    echo "---"
    scrape_pinterest "$HANDLE"
    echo "---"
    scrape_youtube "$HANDLE"
    echo "---"
    scrape_linkedin "$HANDLE"
    ;;
  *)
    echo "Unknown platform: $PLATFORM"
    echo "Supported: instagram tiktok facebook pinterest youtube linkedin all"
    exit 1
    ;;
esac
