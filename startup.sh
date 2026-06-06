#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  npm install
fi

PORT="${PORT:-5173}"
HOST="${HOST:-127.0.0.1}"

exec npm run dev -- --host "$HOST" --port "$PORT" --open
