#!/bin/bash
# scripts/smoke-test.sh
# Builds the invoice-app DAR and runs the
# fullWorkflow script against the live network.
set -e
cd "$(dirname "$0")/../daml"

DAR_VERSION=$(grep '^version:' daml.yaml | awk '{print $2}')
DAR_PATH=.daml/dist/invoice-app-${DAR_VERSION}.dar

dpm build
dpm script \
  --dar "$DAR_PATH" \
  --script-name Test.OnLedger:fullWorkflow \
  --participant-config participants.json

echo ""
echo "Smoke test OK (invoice-app ${DAR_VERSION})"
