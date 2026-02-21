#!/bin/bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"admin"}' \
  -c /tmp/cookies.txt \
  http://localhost:3000/api/auth/login > /dev/null

echo "=== Financial API ==="
curl -s -b /tmp/cookies.txt http://localhost:3000/api/financial

echo ""
echo "=== Audit API ==="
curl -s -b /tmp/cookies.txt http://localhost:3000/api/audit
