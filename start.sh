#!/usr/bin/env sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
echo "Open http://localhost:8000 in your browser. Stop with Ctrl+C."
python3 -m http.server 8000
