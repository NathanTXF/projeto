#!/bin/sh
set -eu

CERT_DIR="/etc/nginx/certs"
CERT_KEY="$CERT_DIR/localhost.key"
CERT_CRT="$CERT_DIR/localhost.crt"

mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_KEY" ] || [ ! -f "$CERT_CRT" ]; then
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$CERT_KEY" \
    -out "$CERT_CRT" \
    -subj "/C=BR/ST=Local/L=Local/O=DinheiroFacil/OU=Dev/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
fi

exec nginx -g "daemon off;"
