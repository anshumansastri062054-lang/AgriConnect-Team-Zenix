#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
(cd apps/api && node local-api.mjs) &
API_PID=$!
python3 -m http.server 5500 --directory apps/web &
WEB_PID=$!
trap 'kill $API_PID $WEB_PID 2>/dev/null || true' EXIT INT TERM
printf '\nAgriConnect Web: http://localhost:5500\nAgriConnect API: http://localhost:4000/api/health\n\nPress Ctrl+C to stop.\n'
wait
