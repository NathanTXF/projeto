#!/bin/bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://localhost}"
COOKIES_FILE="/tmp/cookies.txt"

curl -sk -X POST \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"admin"}' \
  -c "${COOKIES_FILE}" \
  "${BASE_URL}/api/auth/login" > /dev/null

echo "=== Financial API ==="
curl -sk -b "${COOKIES_FILE}" "${BASE_URL}/api/financial"

echo ""
echo "=== Audit API ==="
curl -sk -b "${COOKIES_FILE}" "${BASE_URL}/api/audit"
