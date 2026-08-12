# NIMDA Load Tests

This directory contains k6 scenarios for controlled, non-production performance testing. Never run these scenarios against `nimda.kr` or any production endpoint without a separately approved test window, rate limit, and rollback plan.

## Prerequisites

- k6 installed locally or in CI
- A disposable NIMDA environment with representative test data
- A dedicated test account; never use a personal or administrator account

All commands below run from `load-tests/`.

## Configuration

The shared defaults target the locally published blue backend at `http://localhost:8081`. Supply credentials through process environment variables; the checked-in fallback values are intentionally non-functional.

```bash
BASE_URL=http://localhost:8081 \
TEST_USERNAME=load-test-user \
TEST_PASSWORD='<secret-from-approved-store>' \
k6 run scripts/full-scenario.js
```

On PowerShell:

```powershell
$env:BASE_URL = 'http://localhost:8081'
$env:TEST_USERNAME = 'load-test-user'
$env:TEST_PASSWORD = '<secret-from-approved-store>'
k6 run scripts/full-scenario.js
```

Do not place credentials in scripts, shell history, result files, tickets, or Git. The full scenario writes `results/full-scenario-summary.json`; `load-tests/results/` is ignored by Git.

## Scenarios

```bash
# Authentication only
k6 run scripts/auth/login-test.js

# Judge submission only
k6 run scripts/judge/submit-test.js

# Login, browse, submit, and history journey
k6 run scripts/full-scenario.js
```

The full scenario tags requests by endpoint class so a slower judge operation does not hide regressions in ordinary reads.

## Performance Gates

| Endpoint class | Gate |
| --- | --- |
| Login | p95 below 500 ms |
| General read APIs | p95 below 300 ms |
| Judge submission | p95 below 5 s |
| HTTP failures | below 0.5% |
| Full-scenario success | above 99% |

Treat these as release gates, not proof of capacity. A result is comparable only when data size, server resources, concurrency, warm-up, k6 version, and network path are held constant. Record at least two warm-up runs and five measured runs, then report median, p95, p99, throughput, error rate, CPU, and memory.

## Results and Safety

- Keep raw JSON and dashboards outside Git; preserve checksums or immutable artifact links in release notes.
- Stop immediately if the target hostname, credentials, or dataset are not the approved test fixtures.
- Never weaken authentication, authorization, validation, or rate limits to make a benchmark pass.
- k6 was not available on the Windows verification workstation on 2026-07-10, so the scripts were syntax-reviewed there but require execution in the approved load-test environment.
