#!/usr/bin/env sh
# Install a per-user launchd service that keeps the course available on port 4000.
set -eu

PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
LABEL="com.python-ai-agents-course"
PLIST_SOURCE="$PROJECT_DIR/$LABEL.plist"
PLIST_TARGET="$HOME/Library/LaunchAgents/$LABEL.plist"
USER_ID=$(id -u)
PYTHON_BIN=$(command -v python3)

if [ ! -f "$PLIST_SOURCE" ]; then
  echo "Missing $PLIST_SOURCE" >&2
  exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents"
launchctl bootout "gui/$USER_ID/$LABEL" 2>/dev/null || true
sed "s|__PYTHON3__|$PYTHON_BIN|g; s|__PROJECT_DIR__|$PROJECT_DIR|g" "$PLIST_SOURCE" > "$PLIST_TARGET"
launchctl bootstrap "gui/$USER_ID" "$PLIST_TARGET"
launchctl kickstart -k "gui/$USER_ID/$LABEL"
echo "Service is running. Open http://localhost:4000"
