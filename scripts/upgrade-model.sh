#!/bin/bash
# OpenClaw Model Upgrade Script
# Usage: ./upgrade-model.sh <from_model> <to_model>
# Example: ./upgrade-model.sh MiniMax-M2.5-highspeed MiniMax-M2.7-highspeed

set -e

FROM_MODEL="${1:-MiniMax-M2.5-highspeed}"
TO_MODEL="${2:-MiniMax-M2.7-highspeed}"
OPENCLAW_DIR="${OPENCLAW_DIR:-$HOME/.openclaw}"

echo "Upgrading model: $FROM_MODEL → $TO_MODEL"
echo "OpenClaw dir: $OPENCLAW_DIR"

# Find sessions.json files
SESSIONS_FILES=$(find "$OPENCLAW_DIR" -name "sessions.json" 2>/dev/null)

if [ -z "$SESSIONS_FILES" ]; then
    echo "No sessions.json files found"
    exit 1
fi

TOTAL=0
for file in $SESSIONS_FILES; do
    COUNT=$(grep -c "$FROM_MODEL" "$file" 2>/dev/null || echo "0")
    if [ "$COUNT" -gt 0 ]; then
        echo "  $file: $COUNT occurrences"
        sed -i "s/$FROM_MODEL/$TO_MODEL/g" "$file"
        TOTAL=$((TOTAL + COUNT))
    fi
done

echo ""
echo "Replaced $TOTAL occurrences across all sessions.json files"
echo "Done!"
