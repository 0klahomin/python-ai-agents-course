#!/usr/bin/env sh
set -eu

LABEL="com.python-ai-agents-course"
PLIST_TARGET="$HOME/Library/LaunchAgents/$LABEL.plist"
USER_ID=$(id -u)

launchctl bootout "gui/$USER_ID/$LABEL" 2>/dev/null || true
rm -f "$PLIST_TARGET"
echo "Service removed."
