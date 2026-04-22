# Building Canton Apps

**Subtitle:** Invoice Factoring on a Self-Hosted Network

**Author:** Vladimir Trifonov

## About This Book

A hands-on walk-through of a complete multi-party Daml application on a self-hosted Canton network. You boot the infrastructure (PostgreSQL, BFT sequencer, mediator, three participants), write the Daml workflow (`Invoice`, `Factoring`, `Payment`), expose it over HTTP, put a React UI on top, and ship it end to end.

- 15 chapters across 4 parts
- One Canton network, three participants, one synchronizer
- Three Daml modules with fifteen passing tests plus a live-ledger smoke test
- Express backend + React frontend + one-command start/stop scripts
- Targets Daml SDK 3.4.11 and Canton 3.4.11 (open-source edition)

**Read the first book first** if you have not written Daml before. This book assumes you know templates, choices, authorization, and `dpm`.

## Download

**[book.pdf](book.pdf)** — the complete book

## Book Structure

| Part | Chapters | What You'll Learn |
|------|----------|-------------------|
| **I: The Network** | 1–5 | Download Canton, boot a BFT sequencer + mediator + three participants, drive them from the Canton console |
| **II: The Contracts** | 6–9 | `Invoice`, `Factoring`, and `Payment` templates; test against the live ledger |
| **III: The Application** | 10–12 | Express backend over the JSON Ledger API, React frontend, end-to-end demo |
| **IV: Production Ready** | 13–15 | Map onto the Canton Token Standard (CIP-56), Prometheus + Grafana, path to the Global Synchronizer |

## Prerequisites

- macOS or Linux, Docker Desktop
- [DPM](https://docs.digitalasset.com/build/3.4/dpm/dpm.html) and the Canton 3.4.11 open-source binary
- Node.js 20+ (for the backend and frontend)
- Basic Daml familiarity (book 1 is a good warm-up)

## Running the App

```bash
cd code/app

# Terminal 1: PostgreSQL + Canton
./scripts/start-network.sh

# Terminal 2: Express backend (JSON Ledger API wrapper)
cd backend && npm install && npm start

# Terminal 3: React frontend (Vite dev server)
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173` and switch between the **supplier**, **buyer**, and **factor** tabs — each view is a different Canton participant's perspective on the same ledger.

Stop with `./scripts/stop-network.sh` (add `--wipe` to drop the PostgreSQL volume and re-bootstrap from scratch).

## Code Layout

```
code/app/
├── canton/                  # Canton configs + bootstrap script
│   ├── shared.conf
│   ├── sequencer.conf
│   ├── mediator.conf
│   ├── network.conf
│   └── bootstrap.canton     # idempotent synchronizer + party allocation
├── daml/
│   ├── daml.yaml            # invoice-app package, SDK 3.4.11
│   └── daml/
│       ├── Invoice.daml
│       ├── Factoring.daml
│       ├── Payment.daml
│       └── Test/            # unit + live-ledger scripts
├── backend/                 # Express + fetch, JSON Ledger API client
│   ├── src/
│   │   ├── index.js
│   │   └── ledger.js
│   └── package.json
├── frontend/                # React + Vite, three-role UI
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── main.jsx
│   └── package.json
├── scripts/
│   ├── start-network.sh     # port preflight + bootstrap completion wait
│   ├── stop-network.sh      # `--wipe` for fresh bootstrap
│   ├── deploy-dar.sh        # upload DAR to all three participants
│   └── init-db.sql
└── docker-compose.yml       # PostgreSQL for Canton state
```

## SDK Version

- Canton 3.4.11 (open-source)
- Daml SDK 3.4.11
- Script API uses `submit (actAs [...])`, not the deprecated `submitMulti`
- JSON Ledger API (v2) — no gRPC client required

## Related Resources

- [Digital Asset Documentation](https://docs.digitalasset.com/build/3.4/)
- [Canton Token Standard (CIP-56)](https://www.canton.network/blog/what-is-cip-56-a-guide-to-cantons-token-standard)
- [Canton open-source releases](https://github.com/digital-asset/canton/releases)
- Book 1 — [Daml & Canton: A Practical Guide](../book-1-daml-canton-guide/) (language tour, 242 pages)

## License

Copyright 2026 Vladimir Trifonov. All rights reserved.
