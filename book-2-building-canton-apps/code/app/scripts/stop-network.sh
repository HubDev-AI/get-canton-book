#!/bin/bash
# scripts/stop-network.sh
# Stops Canton and PostgreSQL.
set -e
cd "$(dirname "$0")/.."

PIDS=$(lsof -ti :5001 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo "-> Stopping Canton (PIDs: $PIDS)..."
  kill $PIDS 2>/dev/null || true
  sleep 1
fi

echo "-> Stopping PostgreSQL..."
if [ "$1" = "--wipe" ]; then
  docker compose down -v >/dev/null
  echo "-> Stopped (volume wiped)."
else
  docker compose down >/dev/null
  echo "-> Stopped (volume preserved; use --wipe for fresh bootstrap)."
fi
