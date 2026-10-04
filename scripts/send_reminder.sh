#!/usr/bin/env bash
# Trigger script to send automated WhatsApp reminder via local gateway API

set -euo pipefail

GATEWAY_URL="http://127.0.0.1:3001/send"
TARGET_NUMBER="${RECIPIENT_PHONE:-6289612836030}"
MESSAGE_BODY="${REMINDER_TEXT:-Sayangku, jangan lupa jadwal minum tablet penambah darahnya ya hari ini. Biar badan tetap fit, nggak gampang lemas, dan energinya full terus seharian. I love you! ❤️️}"

PAYLOAD=$(cat <<EOF
{
  "number": "$TARGET_NUMBER",
  "message": "$MESSAGE_BODY"
}
EOF
)

RESPONSE=$(curl -s -X POST "$GATEWAY_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Target: $TARGET_NUMBER | Status: $RESPONSE"
