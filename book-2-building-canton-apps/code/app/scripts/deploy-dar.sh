#!/bin/bash
# scripts/deploy-dar.sh
# Upload a DAR to all participants
set -e

DAR_PATH=$1

list_dars() {
  local dars
  dars=$(ls daml/.daml/dist/*.dar 2>/dev/null || true)
  if [ -n "$dars" ]; then
    echo "$dars" | sed 's|^|  |'
  else
    echo "  (none — run 'dpm build' inside daml/)"
  fi
}

if [ -z "$DAR_PATH" ]; then
  echo "Usage: ./scripts/deploy-dar.sh <path.dar>"
  echo ""
  echo "Available DARs:"
  list_dars
  exit 1
fi

if [ ! -f "$DAR_PATH" ]; then
  echo "ERROR: DAR not found: $DAR_PATH"
  echo ""
  echo "Available DARs in daml/.daml/dist/:"
  list_dars
  echo ""
  echo "Tip: the version in daml/daml.yaml must match the filename."
  exit 1
fi

echo "Uploading $DAR_PATH to all participants..."

for PORT in 5013 5023 5033; do
  echo "  -> localhost:$PORT"
  HTTP_CODE=$(curl -s -o /tmp/deploy-dar.out -w '%{http_code}' \
    -X POST "http://localhost:$PORT/v2/packages" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @"$DAR_PATH")
  cat /tmp/deploy-dar.out
  if [ "$HTTP_CODE" != "200" ]; then
    echo ""
    echo "ERROR: participant at $PORT returned HTTP $HTTP_CODE"
    rm -f /tmp/deploy-dar.out
    exit 1
  fi
done
rm -f /tmp/deploy-dar.out

echo ""
echo "Done."
