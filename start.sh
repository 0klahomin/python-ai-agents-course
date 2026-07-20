#!/usr/bin/env sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
echo "Open http://localhost:4000 in your browser. Stop with Ctrl+C."
python3 -m http.server 4000 --bind 127.0.0.1
