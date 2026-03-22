#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CACHE_DIR=".cache"
APP_HASH_FILE="$CACHE_DIR/app-image.hash"
NGINX_HASH_FILE="$CACHE_DIR/nginx-image.hash"
WAIT_TIMEOUT_SECONDS=180
WAIT_INTERVAL_SECONDS=3

APP_WATCH_PATHS=(
  Dockerfile
  package.json
  package-lock.json
  next.config.ts
  tsconfig.json
  prisma
  src
  public
)

NGINX_WATCH_PATHS=(
  docker/nginx/Dockerfile
  docker/nginx/nginx.conf
  docker/nginx/entrypoint.sh
)

info() {
  printf '[INFO] %s\n' "$*"
}

warn() {
  printf '[WARN] %s\n' "$*"
}

error() {
  printf '[ERROR] %s\n' "$*" >&2
}

usage() {
  cat <<'EOF'
Usage: scripts/start-work.sh [command]

Commands:
  start        Start environment with smart rebuild (default)
  rebuild      Force rebuild app and nginx images, then start
  stop         Stop containers (keeps network/volumes)
  down         Stop and remove containers/network
  status       Show containers status
  logs [svc]   Follow logs (all services or one service)
  clear-cache  Remove local build hashes
  help         Show this help
EOF
}

require_tools() {
  command -v docker >/dev/null 2>&1 || {
    error "Docker nao encontrado. Instale o Docker primeiro."
    exit 1
  }

  docker compose version >/dev/null 2>&1 || {
    error "Docker Compose (plugin) nao encontrado."
    exit 1
  }

  command -v sha256sum >/dev/null 2>&1 || {
    error "sha256sum nao encontrado."
    exit 1
  }

  command -v curl >/dev/null 2>&1 || {
    error "curl nao encontrado."
    exit 1
  }
}

wait_for_command() {
  local description="$1"
  local timeout="$2"
  shift 2

  local elapsed=0
  while true; do
    if "$@" >/dev/null 2>&1; then
      info "$description: OK"
      return 0
    fi

    if [ "$elapsed" -ge "$timeout" ]; then
      error "$description: timeout apos ${timeout}s"
      return 1
    fi

    sleep "$WAIT_INTERVAL_SECONDS"
    elapsed=$((elapsed + WAIT_INTERVAL_SECONDS))
  done
}

wait_for_health() {
  info "Aguardando servicos ficarem prontos..."

  wait_for_command \
    "Banco de dados (PostgreSQL)" \
    "$WAIT_TIMEOUT_SECONDS" \
    docker compose exec -T db pg_isready -U admin -d dinheiro_facil

  wait_for_command \
    "Sistema HTTPS" \
    "$WAIT_TIMEOUT_SECONDS" \
    curl -skf https://localhost/

  wait_for_command \
    "pgAdmin HTTPS" \
    "$WAIT_TIMEOUT_SECONDS" \
    curl -skf https://localhost:5443/

  info "Todos os checks passaram. Ambiente pronto para uso."
}

hash_paths() {
  local paths=("$@")
  local files=()
  local path

  for path in "${paths[@]}"; do
    if [ -d "$path" ]; then
      while IFS= read -r file; do
        files+=("$file")
      done < <(find "$path" -type f | sort)
    elif [ -f "$path" ]; then
      files+=("$path")
    fi
  done

  if [ "${#files[@]}" -eq 0 ]; then
    echo ""
    return
  fi

  local tmp
  tmp="$(mktemp)"
  : > "$tmp"

  local file
  for file in "${files[@]}"; do
    # Include path and content hash to detect renames and content changes.
    printf '%s\n' "$file" >> "$tmp"
    sha256sum "$file" >> "$tmp"
  done

  sha256sum "$tmp" | awk '{print $1}'
  rm -f "$tmp"
}

image_exists() {
  local service="$1"
  local image_id

  image_id="$(docker compose images -q "$service" 2>/dev/null || true)"
  [ -n "$image_id" ]
}

should_build_service() {
  local service="$1"
  local hash_file="$2"
  local result_var="$3"
  shift 3
  local paths=("$@")
  local -n result_ref="$result_var"

  result_ref="$(hash_paths "${paths[@]}")"

  if [ -z "$result_ref" ]; then
    warn "Nao foi possivel calcular hash para o servico $service."
    return 0
  fi

  if [ ! -f "$hash_file" ]; then
    info "Primeira execucao detectada para $service."
    return 0
  fi

  if ! image_exists "$service"; then
    info "Imagem do servico $service nao encontrada."
    return 0
  fi

  local previous_hash
  previous_hash="$(cat "$hash_file")"

  if [ "$result_ref" != "$previous_hash" ]; then
    info "Mudancas detectadas para $service."
    return 0
  fi

  return 1
}

build_if_needed() {
  mkdir -p "$CACHE_DIR"

  local needs_build=0
  local app_hash=""
  local nginx_hash=""

  if should_build_service app "$APP_HASH_FILE" app_hash "${APP_WATCH_PATHS[@]}"; then
    needs_build=1
  fi

  if should_build_service nginx "$NGINX_HASH_FILE" nginx_hash "${NGINX_WATCH_PATHS[@]}"; then
    needs_build=1
  fi

  if [ "$needs_build" -eq 1 ]; then
    info "Build necessario. Construindo imagens app e nginx..."
    docker compose build app nginx

    if [ -n "$app_hash" ]; then
      echo "$app_hash" > "$APP_HASH_FILE"
    fi

    if [ -n "$nginx_hash" ]; then
      echo "$nginx_hash" > "$NGINX_HASH_FILE"
    fi
  else
    info "Sem mudancas relevantes. Reutilizando imagens existentes."
  fi
}

start_env() {
  require_tools
  build_if_needed

  info "Subindo containers..."
  docker compose up -d db pgadmin app nginx
  wait_for_health

  info "Status dos servicos:"
  docker compose ps

  cat <<'EOF'

Acessos:
- Sistema: https://localhost
- pgAdmin: https://localhost:5443
EOF
}

rebuild_env() {
  require_tools
  mkdir -p "$CACHE_DIR"

  info "Forcando rebuild de app e nginx..."
  docker compose build --no-cache app nginx

  hash_paths "${APP_WATCH_PATHS[@]}" > "$APP_HASH_FILE"
  hash_paths "${NGINX_WATCH_PATHS[@]}" > "$NGINX_HASH_FILE"

  info "Subindo containers..."
  docker compose up -d db pgadmin app nginx
  wait_for_health
  docker compose ps
}

stop_env() {
  require_tools
  docker compose stop
}

down_env() {
  require_tools
  docker compose down
}

status_env() {
  require_tools
  docker compose ps
}

logs_env() {
  require_tools

  if [ $# -gt 0 ]; then
    docker compose logs -f "$1"
  else
    docker compose logs -f
  fi
}

clear_cache() {
  rm -f "$APP_HASH_FILE" "$NGINX_HASH_FILE"
  info "Cache de hashes removido."
}

main() {
  local command="${1:-start}"
  shift || true

  case "$command" in
    start)
      start_env
      ;;
    rebuild)
      rebuild_env
      ;;
    stop)
      stop_env
      ;;
    down)
      down_env
      ;;
    status)
      status_env
      ;;
    logs)
      logs_env "$@"
      ;;
    clear-cache)
      clear_cache
      ;;
    help|-h|--help)
      usage
      ;;
    *)
      error "Comando invalido: $command"
      usage
      exit 1
      ;;
  esac
}

main "$@"
