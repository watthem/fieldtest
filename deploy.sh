#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
DIST_DIR="$ROOT_DIR/docs/.vitepress/dist"

if [[ -f "$ROOT_DIR/.env" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

SITE_DEFAULT="39cce096-03bb-4b57-9beb-dfa1d6aa8948"
SITE="${NETLIFY_SITE:-${NETLIFY_SITE_ID:-${NETLIFY_SITE_NAME:-$SITE_DEFAULT}}}"
DEPLOY_MODE="prod"
DEPLOY_MESSAGE=""
RUN_LINT=0
RUN_TESTS=0
RUN_BIOME=0
SKIP_CHECKS=0

usage() {
  cat <<'USAGE'
Usage: ./deploy.sh [options]

Options:
  --site <name-or-id>   Netlify site name or ID (or set NETLIFY_SITE / NETLIFY_SITE_ID)
  --prod                Deploy to production (default)
  --preview             Deploy a draft/preview (no --prod)
  --message <text>      Deploy message
  --lint                Run pnpm lint before build
  --test                Run pnpm test before build
  --biome               Run pnpm biome:check before build
  --skip-checks          Skip all checks and build step
  -h, --help            Show help

Examples:
  ./deploy.sh --site 39cce096-03bb-4b57-9beb-dfa1d6aa8948 --prod
  ./deploy.sh --site 39cce096-03bb-4b57-9beb-dfa1d6aa8948 --preview --message "Docs update"
  NETLIFY_SITE=39cce096-03bb-4b57-9beb-dfa1d6aa8948 ./deploy.sh --lint --biome
USAGE
}

log() {
  printf "\n[%s] %s\n" "$(date +"%H:%M:%S")" "$*"
}

fail() {
  echo "Error: $*" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --site)
      SITE="${2:-}"; shift 2 ;;
    --prod)
      DEPLOY_MODE="prod"; shift ;;
    --preview)
      DEPLOY_MODE="preview"; shift ;;
    --message)
      DEPLOY_MESSAGE="${2:-}"; shift 2 ;;
    --lint)
      RUN_LINT=1; shift ;;
    --test)
      RUN_TESTS=1; shift ;;
    --biome)
      RUN_BIOME=1; shift ;;
    --skip-checks)
      SKIP_CHECKS=1; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      fail "Unknown option: $1" ;;
  esac
 done

command -v pnpm >/dev/null 2>&1 || fail "pnpm not found"
command -v node >/dev/null 2>&1 || fail "node not found"
command -v netlify >/dev/null 2>&1 || fail "netlify CLI not found (install with: npm i -g netlify-cli)"

if [[ -z "$SITE" ]]; then
  fail "Netlify site not set. Use --site or set NETLIFY_SITE/NETLIFY_SITE_ID."
fi

log "Validating Netlify CLI access"
netlify status --site "$SITE" >/dev/null

if [[ "$SKIP_CHECKS" -eq 0 ]]; then
  log "Running checks"
  if [[ "$RUN_BIOME" -eq 1 ]]; then
    pnpm biome:check
  fi
  if [[ "$RUN_LINT" -eq 1 ]]; then
    pnpm lint
  fi
  if [[ "$RUN_TESTS" -eq 1 ]]; then
    pnpm test
  fi

  log "Building docs"
  pnpm docs:build
else
  log "Skipping checks and build"
fi

if [[ ! -d "$DIST_DIR" ]]; then
  fail "Build output not found at $DIST_DIR"
fi

log "Deploying via Netlify CLI"
DEPLOY_CMD=(netlify deploy --dir "$DIST_DIR" --site "$SITE")
if [[ "$DEPLOY_MODE" == "prod" ]]; then
  DEPLOY_CMD+=(--prod)
fi
if [[ -n "$DEPLOY_MESSAGE" ]]; then
  DEPLOY_CMD+=(--message "$DEPLOY_MESSAGE")
fi

"${DEPLOY_CMD[@]}"

log "Deploy complete"
