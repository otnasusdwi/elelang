#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:8080/api}"

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASS="${ADMIN_PASS:-password123}"

BUYER_EMAIL="${BUYER_EMAIL:-buyer1@example.com}"
BUYER_PASS="${BUYER_PASS:-password123}"

echo "==> API_BASE: $API_BASE"

require() { command -v "$1" >/dev/null 2>&1 || { echo "Missing dependency: $1"; exit 1; }; }
require curl
require jq
require date

login() {
  local email="$1"
  local pass="$2"
  curl -sS -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$pass\"}"
}

echo "==> Login admin..."
ADMIN_LOGIN_JSON="$(login "$ADMIN_EMAIL" "$ADMIN_PASS")"
ADMIN_TOKEN="$(echo "$ADMIN_LOGIN_JSON" | jq -r '.token')"
if [[ -z "$ADMIN_TOKEN" || "$ADMIN_TOKEN" == "null" ]]; then
  echo "Admin login failed: $ADMIN_LOGIN_JSON"
  exit 1
fi
echo "    Admin token OK"

echo "==> Login buyer..."
BUYER_LOGIN_JSON="$(login "$BUYER_EMAIL" "$BUYER_PASS")"
BUYER_TOKEN="$(echo "$BUYER_LOGIN_JSON" | jq -r '.token')"
if [[ -z "$BUYER_TOKEN" || "$BUYER_TOKEN" == "null" ]]; then
  echo "Buyer login failed: $BUYER_LOGIN_JSON"
  exit 1
fi
echo "    Buyer token OK"

echo "==> List auctions (live)..."
LIVE_JSON="$(curl -sS "$API_BASE/auctions?status=live")"
LIVE_COUNT="$(echo "$LIVE_JSON" | jq -r '.total // 0')"
echo "    Live auctions: $LIVE_COUNT"

if [[ "$LIVE_COUNT" -lt 1 ]]; then
  echo "No live auctions found. Did you run seed?"
  exit 1
fi

AUCTION_ID="$(echo "$LIVE_JSON" | jq -r '.data[0].id')"
echo "==> Pick live auction_id: $AUCTION_ID"

echo "==> Fetch current bids..."
BIDS_JSON="$(curl -sS "$API_BASE/auctions/$AUCTION_ID/bids")"
HIGHEST="$(echo "$BIDS_JSON" | jq -r '[.data[].amount | tonumber] | max // 0')"
echo "    Current highest: $HIGHEST"

echo "==> Force anti-sniping window (admin patch end_at = now + 5s)..."
NOW_PLUS_5="$(date -u +"%Y-%m-%d %H:%M:%S" -d "+5 seconds" 2>/dev/null || date -u -v+5S +"%Y-%m-%d %H:%M:%S")"

PATCH_RES="$(curl -sS -X PATCH "$API_BASE/admin/auctions/$AUCTION_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"end_at\":\"$NOW_PLUS_5\",\"anti_sniping_seconds\":10,\"extend_minutes\":10,\"status\":\"live\"}")"

echo "    Patched. end_at set to (UTC) $NOW_PLUS_5"

NEW_BID_AMOUNT="$(awk "BEGIN {printf \"%.2f\", $HIGHEST + 50000}")"
echo "==> Place bid (buyer) amount=$NEW_BID_AMOUNT ..."
BID_RES="$(curl -sS -X POST "$API_BASE/auctions/$AUCTION_ID/bids" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"amount\":$NEW_BID_AMOUNT}")"

echo "    Response: $(echo "$BID_RES" | jq -c '{extended:.extended, auction_id:.auction.id, end_at:.auction.end_at, extended_count:.auction.extended_count}')"

EXTENDED="$(echo "$BID_RES" | jq -r '.extended')"
if [[ "$EXTENDED" != "true" ]]; then
  echo "❌ Expected extended=true but got: $EXTENDED"
  exit 1
fi
echo "✅ Anti-sniping extended=true"

echo "==> Validate auction end_at updated..."
DETAIL="$(curl -sS "$API_BASE/auctions/$AUCTION_ID")"
END_AT="$(echo "$DETAIL" | jq -r '.end_at')"
EXT_COUNT="$(echo "$DETAIL" | jq -r '.extended_count')"
echo "    Auction end_at: $END_AT"
echo "    extended_count: $EXT_COUNT"

if [[ "$EXT_COUNT" -lt 1 ]]; then
  echo "❌ Expected extended_count >= 1"
  exit 1
fi
echo "✅ extended_count OK"

echo
echo "🎉 SMOKE TEST PASSED"
