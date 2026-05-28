#!/usr/bin/env bash
# Usage: bash scripts/test-api.sh [base_url]
# Example: bash scripts/test-api.sh http://localhost:3000

BASE="${1:-http://localhost:3000}"
COOKIES="/tmp/tt_test_cookies.txt"
DNI="43811021"
PASSWORD="12345678"

sep() { echo -e "\n\033[1;34m── $1 ──\033[0m"; }
ok()  { echo -e "\033[0;32m✓ $1\033[0m"; }
err() { echo -e "\033[0;31m✗ $1\033[0m"; }

# ── 1. Check DNI ──────────────────────────────────────────────────────────────
sep "POST /api/client/auth/check"
RES=$(curl -s -X POST "$BASE/api/client/auth/check" \
  -H "Content-Type: application/json" \
  -d "{\"dni\":\"$DNI\"}")
echo "$RES" | python3 -m json.tool
echo "$RES" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; exit(0 if d.get('exists') else 1)" \
  && ok "DNI found" || err "DNI not found"

# ── 2. Login ──────────────────────────────────────────────────────────────────
sep "POST /api/client/auth/login"
RES=$(curl -s -X POST "$BASE/api/client/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIES" \
  -d "{\"dni\":\"$DNI\",\"password\":\"$PASSWORD\"}")
echo "$RES" | python3 -m json.tool
echo "$RES" | python3 -c "import sys,json; json.load(sys.stdin)['data']['name']" 2>/dev/null \
  && ok "Login OK — cookies saved to $COOKIES" || err "Login failed"

# ── 3. Me (full profile) ──────────────────────────────────────────────────────
sep "GET /api/client/auth/me"
RES=$(curl -s "$BASE/api/client/auth/me" -b "$COOKIES")
echo "$RES" | python3 -m json.tool
echo "$RES" | python3 -c "import sys,json; json.load(sys.stdin)['data']['dni']" 2>/dev/null \
  && ok "Session valid" || err "Not authenticated"

# ── 4. Schedules ──────────────────────────────────────────────────────────────
sep "GET /api/client/$DNI (schedules)"
RES=$(curl -s "$BASE/api/client/$DNI" -b "$COOKIES")
COUNT=$(echo "$RES" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']['schedules']))" 2>/dev/null)
echo "$RES" | python3 -m json.tool 2>/dev/null | head -40
[ -n "$COUNT" ] && ok "$COUNT schedule(s) found" || err "Failed to fetch schedules"

# ── 5. Presign (avatar upload URL) ───────────────────────────────────────────
sep "POST /api/client/auth/presign"
RES=$(curl -s -X POST "$BASE/api/client/auth/presign" \
  -b "$COOKIES" \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.png","contentType":"image/png"}')
echo "$RES" | python3 -m json.tool
UPLOAD_URL=$(echo "$RES" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['uploadUrl'])" 2>/dev/null)
[ -n "$UPLOAD_URL" ] && ok "Presign OK — uploadUrl: ${UPLOAD_URL:0:60}..." || err "Presign failed"

# ── 6. Logout ─────────────────────────────────────────────────────────────────
sep "POST /api/client/auth/logout"
RES=$(curl -s -X POST "$BASE/api/client/auth/logout" -b "$COOKIES" -c "$COOKIES")
echo "$RES" | python3 -m json.tool
ok "Logged out"

# ── 7. Me after logout (should 401) ──────────────────────────────────────────
sep "GET /api/client/auth/me (after logout — expect 401)"
RES=$(curl -s -w "\nHTTP %{http_code}" "$BASE/api/client/auth/me" -b "$COOKIES")
echo "$RES"
echo "$RES" | grep -q "401" && ok "Correctly returned 401" || err "Should have been 401"

echo -e "\n\033[1;32mDone.\033[0m"
