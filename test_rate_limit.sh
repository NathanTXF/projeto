#!/bin/bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://localhost}"
LOGIN_IP="${LOGIN_IP:-41.41.41.41}"
UPLOAD_IP="${UPLOAD_IP:-42.42.42.42}"
COOKIES_FILE="/tmp/rl_upload_cookies.txt"
IMG_FILE="/tmp/rl-test.png"

require_header() {
  local headers="$1"
  local name="$2"
  if ! echo "$headers" | grep -Eiq "^${name}:"; then
    echo "[ERRO] Header ausente: ${name}" >&2
    exit 1
  fi
}

echo "=== [1/3] Desbloqueando usuarios para evitar falso negativo ==="
npx tsx unlock.ts > /dev/null

echo "=== [2/3] Validando rate limit de login (${BASE_URL}) ==="
for _ in $(seq 1 20); do
  curl -sk -o /dev/null \
    -X POST "${BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -H "x-forwarded-for: ${LOGIN_IP}" \
    -d '{"usuario":"naoexiste","senha":"x"}'
done

LOGIN_HEADERS=$(curl -sk -D - -o /dev/null \
  -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: ${LOGIN_IP}" \
  -d '{"usuario":"naoexiste","senha":"x"}' | tr -d '\r')

LOGIN_STATUS=$(echo "${LOGIN_HEADERS}" | awk 'NR==1{print $2}')
if [[ "${LOGIN_STATUS}" != "429" ]]; then
  echo "[ERRO] Esperado 429 no login, recebido ${LOGIN_STATUS}" >&2
  exit 1
fi

require_header "${LOGIN_HEADERS}" "retry-after"
require_header "${LOGIN_HEADERS}" "x-ratelimit-limit"
require_header "${LOGIN_HEADERS}" "x-ratelimit-remaining"
require_header "${LOGIN_HEADERS}" "x-ratelimit-reset"

echo "[OK] Login rate limit respondeu 429 com headers"

echo "=== [3/3] Validando rate limit de upload autenticado ==="
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDAT\x08\xd7c\xf8\xff\xff?\x00\x05\xfe\x02\xfeA\xe2(\xdf\x00\x00\x00\x00IEND\xaeB`\x82' > "${IMG_FILE}"

LOGIN_OK_CODE=$(curl -sk -c "${COOKIES_FILE}" -o /dev/null -w "%{http_code}" \
  -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: ${UPLOAD_IP}" \
  -d '{"usuario":"admin","senha":"admin"}')

if [[ "${LOGIN_OK_CODE}" != "200" ]]; then
  echo "[ERRO] Login admin para upload falhou com status ${LOGIN_OK_CODE}" >&2
  exit 1
fi

for _ in $(seq 1 30); do
  CODE=$(curl -sk -b "${COOKIES_FILE}" -o /dev/null -w "%{http_code}" \
    -X POST "${BASE_URL}/api/upload" \
    -H "x-forwarded-for: ${UPLOAD_IP}" \
    -F "file=@${IMG_FILE};type=image/png")
  if [[ "${CODE}" != "200" ]]; then
    echo "[ERRO] Upload dentro da cota retornou ${CODE}" >&2
    exit 1
  fi
done

UPLOAD_HEADERS=$(curl -sk -D - -o /dev/null -b "${COOKIES_FILE}" \
  -X POST "${BASE_URL}/api/upload" \
  -H "x-forwarded-for: ${UPLOAD_IP}" \
  -F "file=@${IMG_FILE};type=image/png" | tr -d '\r')

UPLOAD_STATUS=$(echo "${UPLOAD_HEADERS}" | awk 'NR==1{print $2}')
if [[ "${UPLOAD_STATUS}" != "429" ]]; then
  echo "[ERRO] Esperado 429 no upload, recebido ${UPLOAD_STATUS}" >&2
  exit 1
fi

require_header "${UPLOAD_HEADERS}" "retry-after"
require_header "${UPLOAD_HEADERS}" "x-ratelimit-limit"
require_header "${UPLOAD_HEADERS}" "x-ratelimit-remaining"
require_header "${UPLOAD_HEADERS}" "x-ratelimit-reset"

echo "[OK] Upload rate limit respondeu 429 com headers"
echo "=== SUCESSO: validacao de rate limit concluida ==="
