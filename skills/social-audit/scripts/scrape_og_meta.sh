#!/usr/bin/env bash
# scrape_og_meta.sh — Extract follower counts and profile metadata from social platforms
# via Open Graph meta tags using facebookexternalhit UA.
# Works logged-out. No auth required.
#
# Usage:
#   bash scrape_og_meta.sh <platform> <handle>
#   bash scrape_og_meta.sh instagram glossbeauty.bylouise
#   bash scrape_og_meta.sh tiktok glossbeautybylouise
#   bash scrape_og_meta.sh facebook glossbeauty.bylouise1
#
# Returns JSON-like output for parsing.

set -euo pipefail

PLATFORM="${1:-}"
HANDLE="${2:-}"
UA="facebookexternalhit/1.1"

if [[ -z "$PLATFORM" || -z "$HANDLE" ]]; then
  echo "Usage: $0 <platform> <handle>"
  echo "Platforms: instagram tiktok facebook pinterest youtube linkedin"
  exit 1
fi

probe() {
  local url="$1"
  curl -sL --connect-timeout 10 --max-time 20 -A "$UA" "$url" \
    | grep -oiE 'og:(description|title)[^>]{0,400}' \
    | sed 's/og:description[^"]*"//;s/og:title[^"]*"//;s/" \/?>//g' \
    | head -3
}

case "$PLATFORM" in
  instagram)
    URL="https://www.instagram.com/${HANDLE}/"
    RAW=$(probe "$URL")
    echo "PLATFORM: Instagram"
    echo "HANDLE: @${HANDLE}"
    echo "URL: ${URL}"
    echo "RAW_META: ${RAW}"
    # Extract: "4,478 Followers, 3,040 Following, 180 Posts"
    FOLLOWERS=$(echo "$RAW" | grep -oiE '[0-9,.]+[kKmM]? [Ff]ollower' | head -1)
    POSTS=$(echo "$RAW" | grep -oiE '[0-9,.]+ [Pp]ost' | head -1)
    echo "FOLLOWERS: ${FOLLOWERS:-unknown}"
    echo "POSTS: ${POSTS:-unknown}"
    ;;

  tiktok)
    URL="https://www.tiktok.com/@${HANDLE}"
    RAW=$(probe "$URL")
    echo "PLATFORM: TikTok"
    echo "HANDLE: @${HANDLE}"
    echo "URL: ${URL}"
    echo "RAW_META: ${RAW}"
    FOLLOWERS=$(echo "$RAW" | grep -oiE '[0-9,.]+[kKmM]? [Ff]ollower' | head -1)
    LIKES=$(echo "$RAW" | grep -oiE '[0-9,.]+[kKmM]? [Ll]ike' | head -1)
    echo "FOLLOWERS: ${FOLLOWERS:-unknown}"
    echo "LIKES: ${LIKES:-unknown}"
    ;;

  facebook)
    URL="https://www.facebook.com/${HANDLE}/"
    RAW=$(probe "$URL")
    echo "PLATFORM: Facebook"
    echo "HANDLE: ${HANDLE}"
    echo "URL: ${URL}"
    echo "RAW_META: ${RAW}"
    LIKES=$(echo "$RAW" | grep -oiE '[0-9,]+ like' | head -1)
    echo "LIKES: ${LIKES:-unknown}"
    ;;

  pinterest)
    URL="https://www.pinterest.com/${HANDLE}/"
    HTTP=$(curl -sIL --connect-timeout 5 -A "Mozilla/5.0" "$URL" | head -1 | awk '{print $2}')
    echo "PLATFORM: Pinterest"
    echo "HANDLE: ${HANDLE}"
    echo "URL: ${URL}"
    echo "HTTP_STATUS: ${HTTP}"
    if [[ "$HTTP" == "200" ]]; then
      RAW=$(probe "$URL")
      echo "RAW_META: ${RAW}"
    else
      echo "STATUS: ABSENT or requires auth (HTTP ${HTTP})"
    fi
    ;;

  youtube)
    URL="https://www.youtube.com/@${HANDLE}"
    HTTP=$(curl -sIL --connect-timeout 5 -A "Mozilla/5.0" "$URL" | head -1 | awk '{print $2}')
    echo "PLATFORM: YouTube"
    echo "HANDLE: @${HANDLE}"
    echo "URL: ${URL}"
    echo "HTTP_STATUS: ${HTTP}"
    if [[ "$HTTP" == "200" ]]; then
      RAW=$(probe "$URL")
      echo "RAW_META: ${RAW}"
    fi
    ;;

  linkedin)
    URL="https://www.linkedin.com/company/${HANDLE}/"
    RAW=$(probe "$URL")
    echo "PLATFORM: LinkedIn"
    echo "HANDLE: ${HANDLE}"
    echo "URL: ${URL}"
    FOLLOWERS=$(echo "$RAW" | grep -oiE '[0-9,]+ follower' | head -1)
    echo "FOLLOWERS: ${FOLLOWERS:-unknown}"
    echo "RAW_META: ${RAW}"
    ;;

  *)
    echo "Unknown platform: $PLATFORM"
    echo "Supported: instagram tiktok facebook pinterest youtube linkedin"
    exit 1
    ;;
esac
