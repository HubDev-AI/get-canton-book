#!/bin/bash
# scripts/start-network.sh
# Boots PostgreSQL, Canton daemon, and verifies the three
# business parties are on the synchronizer.
set -e
cd "$(dirname "$0")/.."

echo "-> Checking port 5432 for non-Docker listeners..."
if lsof -iTCP:5432 -sTCP:LISTEN -nP 2>/dev/null \
    | awk 'NR>1 {print $1}' | grep -vqi "com.docke\|docker"; then
  echo "ERROR: a non-Docker process is bound to localhost:5432."
  echo "  Canton will connect to it instead of the Docker Postgres"
  echo "  and fail with: role \"canton\" does not exist"
  echo ""
  echo "  Likely native PostgreSQL. Stop it, e.g.:"
  echo "    brew services stop postgresql@18"
  echo "  (or whichever version is installed), then re-run this script."
  exit 1
fi

echo "-> Starting PostgreSQL..."
docker compose up -d >/dev/null

echo "-> Waiting for PostgreSQL..."
for i in {1..30}; do
  if PGPASSWORD=canton psql -h localhost -U canton -d canton \
      -tAc 'SELECT 1' >/dev/null 2>&1; then break; fi
  sleep 1
done
PGPASSWORD=canton psql -h localhost -U canton -d canton \
    -tAc 'SELECT 1' >/dev/null 2>&1 \
  || { echo "PostgreSQL never became reachable as user 'canton'."; \
       echo "  If you previously ran this with a different POSTGRES_USER,"; \
       echo "  reset the volume: docker compose down -v && docker compose up -d"; \
       exit 1; }

if lsof -i :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "-> Canton already running on port 5001, skipping."
else
  mkdir -p log
  echo "-> Starting Canton daemon..."
  rm -f log/canton.log log/canton-stdout.log
  nohup canton daemon \
    -c canton/network.conf \
    --bootstrap canton/bootstrap.canton \
    --log-file-name log/canton.log \
    > log/canton-stdout.log 2>&1 &
  echo "   PID: $!"

  echo "-> Waiting for Canton Ledger APIs..."
  for i in {1..60}; do
    if lsof -i :5013 -sTCP:LISTEN -t >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  lsof -i :5013 -sTCP:LISTEN -t >/dev/null \
    || { echo "Canton never came up; see log/canton-stdout.log"; exit 1; }

  # Bootstrap runs after port binds; wait for it to finish or fail.
  echo "-> Waiting for bootstrap to complete..."
  for i in {1..120}; do
    if grep -q "Network ready!" log/canton-stdout.log 2>/dev/null; then
      break
    fi
    if grep -q "Bootstrap script terminated with an error" \
        log/canton-stdout.log 2>/dev/null; then
      echo "ERROR: bootstrap crashed. Tail of log:"
      grep -A2 "TOPOLOGY_MAPPING_ALREADY_EXISTS\|Bootstrap script terminated" \
        log/canton-stdout.log | tail -10
      echo ""
      echo "Likely cause: stale Postgres volume from a previous boot."
      echo "Reset with: ./scripts/stop-network.sh --wipe"
      exit 1
    fi
    sleep 1
  done
  grep -q "Network ready!" log/canton-stdout.log 2>/dev/null \
    || { echo "Bootstrap did not finish within 2min; see log/canton-stdout.log"; exit 1; }
fi

echo "-> Network ready."
curl -s http://localhost:5013/v2/parties \
  | python3 -c "import sys,json; d=json.load(sys.stdin); [print('   '+p['party']) for p in d['partyDetails']]" \
  2>/dev/null || true
