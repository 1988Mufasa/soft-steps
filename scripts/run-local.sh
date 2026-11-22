#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== Soft Steps local runner =="
echo "folder: $(pwd)"
echo "branch: $(git branch --show-current 2>/dev/null || echo unknown)"

if ! command -v node >/dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Install from https://nodejs.org (LTS), then reopen Terminal and run this again."
  exit 1
fi
if ! command -v npm >/dev/null; then
  echo "ERROR: npm is missing (comes with Node.js)."
  exit 1
fi

echo "node: $(node -v)  npm: $(npm -v)"

if [ ! -d node_modules ]; then
  echo "Installing dependencies…"
  npm install
fi

echo "Starting Soft Steps…"
echo "When Vite prints a Local URL, open that URL in your browser (usually http://127.0.0.1:5173/)."
exec npm run dev -- --host 127.0.0.1 --port 5173
