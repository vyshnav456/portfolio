#!/usr/bin/env bash
#
# start.sh — run the portfolio.
#
#   ./start.sh            development server with hot reload (default)
#   ./start.sh prod       production build, then serve it
#   ./start.sh -p 4000    development server on a custom port
#   ./start.sh prod -p 80 port flag works in either mode
#
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

MODE="dev"
PORT="3000"

while [[ $# -gt 0 ]]; do
  case "$1" in
    dev|prod) MODE="$1"; shift ;;
    -p|--port) PORT="${2:?--port needs a value}"; shift 2 ;;
    -h|--help) sed -n '2,9p' "$0" | sed 's/^# \?//'; exit 0 ;;
    *) echo "unknown argument: $1 (try --help)" >&2; exit 1 ;;
  esac
done

command -v node >/dev/null || { echo "node is not installed."; exit 1; }

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( NODE_MAJOR < 20 )); then
  echo "Node 20+ required — found $(node -v)."
  exit 1
fi

# Install only when node_modules is missing or the lockfile is newer.
if [[ ! -d node_modules ]] || [[ package-lock.json -nt node_modules ]]; then
  echo "==> Installing dependencies"
  npm install
fi

# Next refuses to start a second dev server for the same project directory,
# whatever port it's on — so clear any earlier run of this app first.
for pid in $(pgrep -f "next.*dev" 2>/dev/null || true); do
  [[ "$pid" == "$$" ]] && continue
  if [[ "$(readlink -f "/proc/${pid}/cwd" 2>/dev/null)" == "$PWD" ]]; then
    echo "==> Stopping an earlier dev server for this project (pid ${pid})"
    kill "$pid" 2>/dev/null || true
    sleep 1
  fi
done

# Free the port if something else is holding it.
if command -v lsof >/dev/null && lsof -ti "tcp:${PORT}" >/dev/null 2>&1; then
  echo "==> Port ${PORT} is in use — stopping the process holding it"
  lsof -ti "tcp:${PORT}" | xargs -r kill 2>/dev/null || true
  sleep 1
fi

if [[ ! -f .env.local && -f .env.example ]]; then
  echo "==> No .env.local found. The contact form will log submissions to this"
  echo "    console instead of emailing them. See .env.example to enable Resend."
fi

if [[ "$MODE" == "prod" ]]; then
  echo "==> Building for production"
  npm run build
  echo "==> Serving on http://localhost:${PORT}"
  exec npx next start --port "$PORT"
else
  echo "==> Starting dev server on http://localhost:${PORT}"
  exec npx next dev --port "$PORT"
fi
