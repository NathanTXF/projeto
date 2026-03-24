#!/bin/bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://localhost}"
COOKIES_FILE="/tmp/cookies.txt"

echo "=== Testing login at ${BASE_URL} ==="
curl -sk -X POST \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"admin"}' \
  -c "${COOKIES_FILE}" \
  "${BASE_URL}/api/auth/login"

echo ""
echo "=== Testing dashboard with cookie ==="
STATUS=$(curl -sk -o /dev/null -w "%{http_code}" -b "${COOKIES_FILE}" "${BASE_URL}/dashboard")
echo "Dashboard HTTP status: $STATUS"
