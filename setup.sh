#!/usr/bin/env sh
# One-time download of the browser Python runtime. Runtime use is fully offline.
set -eu

PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PYODIDE_VERSION="0.27.7"
TARGET_DIR="$PROJECT_DIR/vendor/pyodide"
ARCHIVE_URL="https://github.com/pyodide/pyodide/releases/download/$PYODIDE_VERSION/pyodide-$PYODIDE_VERSION.tar.bz2"
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT INT TERM

if [ -f "$TARGET_DIR/pyodide.js" ] && [ -f "$TARGET_DIR/pyodide.asm.wasm" ]; then
  echo "Pyodide is already installed in vendor/pyodide."
  exit 0
fi

mkdir -p "$TARGET_DIR"
echo "Downloading Pyodide $PYODIDE_VERSION (one-time download; roughly 370 MB)…"
curl --fail --location --progress-bar "$ARCHIVE_URL" --output "$TEMP_DIR/pyodide.tar.bz2"
tar -xjf "$TEMP_DIR/pyodide.tar.bz2" -C "$TARGET_DIR"

# Release archives currently contain one top-level "pyodide" directory.
if [ -d "$TARGET_DIR/pyodide" ]; then
  find "$TARGET_DIR/pyodide" -mindepth 1 -maxdepth 1 -exec mv {} "$TARGET_DIR/" \;
  rmdir "$TARGET_DIR/pyodide"
fi

if [ ! -f "$TARGET_DIR/pyodide.js" ]; then
  echo "Pyodide archive did not extract as expected; vendor/pyodide/pyodide.js is missing." >&2
  exit 1
fi
echo "Done. Pyodide is local at vendor/pyodide/ and will not use a CDN at runtime."
