#!/bin/bash
echo "=== Testing login ==="
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"admin"}' \
  -c /tmp/cookies.txt \
  http://localhost:3000/api/auth/login

echo ""
echo "=== Testing dashboard with cookie ==="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/cookies.txt http://localhost:3000/dashboard)
echo "Dashboard HTTP status: $STATUS"
