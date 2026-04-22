# Daml & Canton: A Practical Guide

A hands-on guide to building distributed applications with Daml smart contracts on the Canton Network.

**Author:** Vladimir Trifonov

## About This Book

This book teaches developers with blockchain experience how to build applications using Daml and Canton. It covers everything from writing your first smart contract to deploying on the Canton Network in production.

- **242 pages** across 26 chapters in 5 parts
- **Both Java and JavaScript** backend examples
- **50+ passing Daml tests** across 12 runnable projects
- **Complete code examples** included — no copy-paste from PDFs needed

## Download

**[book.pdf](book.pdf)** — the complete book

## Book Structure

| Part | Chapters | What You'll Learn |
|------|----------|-------------------|
| **I: Quick Start** | 1–4 | Install DPM, run cn-quickstart, write your first contract, deploy to Canton |
| **II: The Daml Language** | 5–13 | Templates, data types, choices, authorization, propose-accept, composition, error handling, testing, standard library |
| **III: Building Real Applications** | 14–18 | Project structure, Ledger API, PQS, React frontend, end-to-end example |
| **IV: Canton Network & Production** | 19–22 | Canton architecture, Global Synchronizer, identity/topology, operations |
| **V: Security & Best Practices** | 23–26 | Security model, common pitfalls, auditing contracts, production security |

## Prerequisites

- Docker Desktop (for cn-quickstart)
- [DPM](https://docs.digitalasset.com/build/3.4/dpm/dpm.html) (Digital Asset Package Manager)
- Basic command-line proficiency
- Blockchain/DLT experience (the book doesn't explain consensus basics)

## Code Examples

Every chapter has runnable code in the `code/` directory. Use these instead of copying from the PDF — indentation is preserved.

### Daml Projects (Part II)

```bash
cd code/ch06-data-types
dpm build && dpm test
```

| Directory | Chapter | Tests |
|-----------|---------|-------|
| `code/ch03-first-contract/` | Your First Contract | 4 |
| `code/ch05-templates/` | Templates & Signatories | 1 |
| `code/ch06-data-types/` | Data Types | 1 |
| `code/ch07-choices/` | Choices & Controllers | 3 |
| `code/ch08-authorization/` | Authorization Model | 9 |
| `code/ch09-propose-accept/` | Propose-Accept Pattern | 4 |
| `code/ch10-composing/` | Composing Choices | 2 |
| `code/ch11-exceptions/` | Error Handling & Constraints | 4 |
| `code/ch12-testing/` | Daml Script & Testing | 13 |
| `code/ch13-stdlib/` | Standard Library (multi-package) | 4 |

### Backend Examples (Part III)

**JavaScript/Express.js:**
```bash
cd code/ch15-backend
cp .env.example .env  # edit with your Canton settings
npm install && npm start
```

**Java/Spring Boot:**
```bash
cd code/ch15-backend-java
./gradlew bootRun
```

### Frontend (Part III)

```bash
cd code/ch17-frontend
npm install && npm run dev
```

### Full-Stack E2E (Chapter 18)

```bash
# 1. Build and test Daml
cd code/ch18-e2e/daml && dpm build && dpm test

# 2. Start backend (JS or Java)
cd code/ch18-e2e/backend && npm install && npm start
# OR
cd code/ch18-e2e/backend-java && ./gradlew bootRun

# 3. Start frontend
cd code/ch18-e2e/frontend && npm install && npm run dev
```

## SDK Version

All examples target **Daml SDK 3.4.11**. Key notes:

- **Contract keys** were removed in SDK 3.x — the book uses the business identifier pattern with `queryFilter` instead
- **Exceptions** are deprecated in SDK 3.4.x — Chapter 11 teaches `failWithStatus` from `DA.Fail` as the replacement
- **DPM** is used throughout (not the legacy `daml` CLI)

## Related Resources

- [Digital Asset Documentation](https://docs.digitalasset.com/build/3.4/)
- [DPM Installation](https://docs.digitalasset.com/build/3.4/dpm/dpm.html)
- [cn-quickstart](https://github.com/digital-asset/cn-quickstart)
- [Canton Network (sync.global)](https://docs.sync.global/)

## License

Copyright 2026 Vladimir Trifonov. All rights reserved.
