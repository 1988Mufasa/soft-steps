#!/usr/bin/env bash
# Soft Steps — run on your Mac Terminal (not the cloud agent).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== Soft Steps local runner =="
echo "folder: $(pwd)"
echo "branch: $(git branch --show-current 2>/dev/null || echo unknown)"

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "ERROR: Node.js is not installed on this Mac."
  echo "1) Open https://nodejs.org and install the LTS version"
  echo "2) Quit Terminal completely and open a new window"
  echo "3) Run this script again"
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is missing. Reinstall Node.js LTS from https://nodejs.org"
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
echo "node: $(node -v)  npm: $(npm -v)"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "ERROR: Soft Steps needs Node 18+. You have $(node -v)."
  echo "Install a newer LTS from https://nodejs.org then reopen Terminal."
  exit 1
fi

if [ ! -d node_modules ] || [ ! -f node_modules/vite/package.json ]; then
  echo "Installing dependencies (first run can take a minute)…"
  npm install
fi

# Free the port if a stale Vite is stuck
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -ti tcp:5173 2>/dev/null || true)"
  if [ -n "${PIDS:-}" ]; then
    echo "Freeing port 5173…"
    # shellcheck disable=SC2086
    kill $PIDS 2>/dev/null || true
    sleep 1
  fi
fi

echo "Starting Soft Steps…"
echo "When you see Local: http://127.0.0.1:5173/  — open that link in Safari/Chrome."
echo "(Leave this Terminal window open while you use the app.)"
exec npm run dev -- --host 127.0.0.1 --port 5173
