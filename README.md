<h1 align="center">NIMDA SECURITY</h1>

<p align="center">
  Contest, community, member, and operations platform for the NIMDA SECURITY club.
</p>

<p align="center">
  <a href="https://nimda.kr"><strong>Live App</strong></a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="#features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="DEPLOYMENT.md">Deployment</a>
</p>

<p align="center">
  <a href="https://github.com/Nimda-Security/Nimda/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Nimda-Security/Nimda/ci.yml?branch=main&label=CI" /></a>
  <a href="https://nimda.kr"><img alt="Live app" src="https://img.shields.io/badge/Live-nimda.kr-111111" /></a>
  <img alt="Java 17" src="https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white" />
  <img alt="Spring Boot 3.2" src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?logo=springboot&logoColor=white" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111111" />
  <img alt="Vite 7" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />
</p>

---

## What is NIMDA SECURITY?

NIMDA SECURITY is the club's production web platform. It combines programming contests, submissions and scoreboards, community boards, member activity, notifications, mileage rewards, profile decorations, and administrator workflows in one service.

## Features

- **Contest:** problem and scoreboard interface with explicit unavailable states; live judging APIs remain a staged rollout
- **Community:** category-based boards, rich text, comments, likes, galleries, and attachments
- **Member:** registration, approval, profiles, attendance, notifications, mileage, and decorations
- **Admin:** user and role management, categories, tags, boards, contests, and mileage grants
- **Operations:** pull-request verification gates, immutable images, Docker Compose, Nginx, and validated Blue/Green promotion

## Architecture

<p align="center">
  <img src="assets/readme/framework.svg" alt="NIMDA SECURITY production architecture" width="100%" />
</p>

The Vite community frontend and Next.js landing page are independently built web applications. Browser API traffic reaches the Spring Boot Blue/Green backend through the TLS-terminating Nginx proxy. MySQL stores core data, Redis supports runtime coordination, and private S3 stores validated attachments. GitHub Actions runs all quality gates before publishing an immutable commit-SHA backend image and invoking the promotion script.

> Blue/Green promotion is validated before traffic is switched, but complete zero-downtime behavior is not claimed until connection-draining tests pass. See [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Technology Stack

| Area               | Stack                                                          |
| ------------------ | -------------------------------------------------------------- |
| Community frontend | React 19, TypeScript, Vite 7, Tailwind CSS, Tiptap             |
| Landing page       | Next.js 16 static export, React 19                             |
| Backend            | Java 17, Spring Boot 3.2, Spring Security, JPA, Flyway         |
| Data and storage   | MySQL 8, Redis 7, private AWS S3                               |
| Infrastructure     | Docker Compose v2, Nginx, GitHub Actions, Blue/Green promotion |
| Verification       | Maven, ESLint, Vite, Next.js, npm audit, Bruno, k6 scripts     |

## Repository Layout

| Area                 | Path                                        |
| -------------------- | ------------------------------------------- |
| Community frontend   | `NimdaConFrontEnd/`                         |
| Landing page         | `NimdaLandingPage/`                         |
| API server           | `NimdaConBackEnd/backend-spring/`           |
| Proxy and deployment | `nginx/`, `docker-compose.yml`, `deploy.sh` |
| API collection       | `bruno/`                                    |
| Load-test scenarios  | `load-tests/`                               |

The root `package.json` is not an application entry point. Run each command from the corresponding subproject directory.

## Quick Start

### Requirements

- Node.js 22 LTS and npm 10+
- Java 17
- Git
- Docker Engine and Docker Compose v2 for the integrated runtime
- k6 only for approved, isolated performance tests

### Community frontend

```bash
cd NimdaConFrontEnd
npm ci
npm run dev
```

Quality gates:

```bash
npm run lint
npm run build
npm audit --omit=dev
```

The frontend currently has no automated `npm test` script.

### Landing page

```bash
cd NimdaLandingPage
npm ci
npm run dev
```

Quality gates:

```bash
npm run lint
npm run build
npm audit --omit=dev
```

A successful production build statically generates `/` and `/_not-found` under ignored output directories.

### Backend

```bash
cd NimdaConBackEnd/backend-spring

# Linux/macOS
./mvnw -B clean verify
./mvnw spring-boot:run

# Windows
mvnw.cmd -B clean verify
mvnw.cmd spring-boot:run
```

Tests use the `test` profile and H2; they do not require production MySQL or Redis credentials. `BUILD SUCCESS` is the pass signal.

### Integrated runtime

From the repository root:

```bash
cp .env.example .env
BACKEND_IMAGE_TAG=<verified-commit-SHA> docker compose config
BACKEND_IMAGE_TAG=<verified-commit-SHA> docker compose up -d
```

`docker compose config` can print substituted secrets. Do not publish its output. Production promotion uses `BACKEND_IMAGE_TAG=<verified-commit-SHA> ./deploy.sh`; the script has no `status` or `rollback` subcommands.

## Configuration and Secret Handling

Only the root `.env.example` and `NimdaConFrontEnd/.env.example` templates are tracked.

- Inject DB, Redis, JWT, SMTP, and AWS values from an approved secret store.
- Never place real passwords, tokens, private keys, certificate material, or environment dumps in Git, issues, screenshots, or build logs.
- Deploy only immutable commit-SHA image tags. The deployment path does not fall back to `latest`.
- Frontend defaults are `/api` for the API and `/scoreboard` for the scoreboard endpoint.

## Security and Data-Integrity Invariants

- The authentication cookie is `HttpOnly`, secure by default in production, and `SameSite=Lax`. Credentialed browser requests trust only exact owned origins; unsafe cross-site requests are rejected before authentication.
- Login validates the password, approval state, roles, and `authVersion` from one database snapshot. Logout uses an atomic version increment; password, approval, and role mutations lock the user row before rotating the version. Every authenticated request reloads the approved account and requires the current version.
- Password-recovery initiation and mail-request responses are indistinguishable for known and unknown identities. HTTP handling enqueues the same asynchronous dispatch shape instead of waiting for SMTP, and code verification performs both the identity and challenge lookups to reduce timing differences. A mail code is atomically consumed by its random recovery challenge, only the latest verified challenge can be used once under a user-row lock, and a successful reset clears both the challenge and old sessions.
- Private activity endpoints expose liked posts and NC history only to the owner or an administrator. Board responses omit author email and login ID; V29 changes existing and new email visibility to private by default. Student numbers are read-only recovery identifiers in ordinary profile flows.
- Administrator category and Actuator matchers precede public rules. Legal documents are public only through the four immutable slug routes established by V30; numeric board resources remain protected. Mutation services reload the persisted legal identity, require a current administrator, and keep the legal-slug column out of ordinary updates.
- Board, comment, and attachment reads enforce `ACTIVE` visibility and cartel membership. Administrator edits preserve the original board author, cross-board comment parents are rejected, and unlinked attachments remain owner-only.
- Presigned PUTs bind the authenticated user, upload purpose, and exact size up to 10 MiB. Objects start under `pending/users/<userId>/<purpose>/`, are validated and images are pixel-bounded/re-encoded, then move under `users/<userId>/active/`.
- Draft navigation, pagehide, upload, explicit removal, and submit share synchronized ownership rules so uploads cannot leak into another draft and files being committed cannot be deleted by cleanup. Failed image re-encoding never falls back to the original bytes, and local upload fallback requires the explicit `UPLOAD_STORAGE_UNAVAILABLE` capability code. V28/V30 permit one case-sensitive deletion-outbox key of at most 512 characters; an unrepresentable key also aborts metadata deletion. Quarantine is dominant, live references prevent deletion, failures are persisted under the task lock, and the keyset orphan scan proceeds to its natural end.
- Pull requests run frontend, landing, dependency, and backend verification. Image publication and production deployment run only for a successful push to `main` in `Nimda-Security/Nimda`.

## Performance Budgets and Evidence

| Layer      | Gate                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Frontend   | Initial-route JS ≤ 300 KiB gzip; CSS ≤ 100 KiB gzip; LCP p75 ≤ 2.5 s; INP ≤ 200 ms; CLS ≤ 0.10 |
| Backend    | Normal reads p95 ≤ 300 ms; writes p95 ≤ 500 ms; errors < 0.5%                                  |
| Proxy      | p95 overhead ≤ 20 ms versus direct upstream; throughput ≥ 95%                                  |
| End-to-end | Login p95 ≤ 500 ms; normal API p95 ≤ 300 ms; judging p95 ≤ 5 s; success > 99%                  |

Comparisons must use the same data, roles, resources, browser/tool versions, cache state, network, and concurrency. Warm up twice, measure at least five times, and retain median, p95/p99, error rate, throughput, CPU, and memory. Never load-test production without approval.

Local production-preview evidence from 2026-07-10:

| Metric                      |      Before |     After | Change |
| --------------------------- | ----------: | --------: | -----: |
| Initial JS transferred      |   354,490 B |  99,864 B | -71.8% |
| Initial JS decoded          | 1,201,360 B | 297,056 B | -75.3% |
| Total resources transferred |   419,164 B | 191,418 B | -54.3% |
| Median DOMContentLoaded     |      363 ms |  122.6 ms | -66.2% |
| Median FCP                  |      652 ms |    156 ms | -76.1% |

For a 10-board page, like/comment metadata queries dropped from 20 to 2 for anonymous users and from at least 30 to 3 for authenticated users. View counts use one conditional atomic update instead of read-modify-write.

## Verification

Verified on 2026-07-11:

- Community frontend: lint and production build passed; production dependency audit found 0 vulnerabilities
- Landing page: lint and static production build passed; production dependency audit found 0 vulnerabilities
- Backend: `mvnw.cmd -B clean verify` passed with **116 tests**, 0 failures, 0 errors, and 0 skipped
- Security regressions cover auth-version/status enforcement, single-snapshot login, challenge-bound one-time recovery, exact-origin filtering, exact public legal routes and immutable legal-document status, private activity, public-author DTO privacy, administrator matchers, attachment authentication, S3 ownership/purpose/size limits, image pixel limits, preallocated canonical upload keys, rollback cleanup in an independent transaction, dominant deletion quarantine, referenced-key protection, and category hierarchy transitions
- Local 390 px production preview: home, signup, board writing, and 404 had no horizontal overflow; protected writing redirected to login and returned to the original writing route after a mocked login; cancelling logo navigation preserved the draft
- Production read-only smoke: desktop login and home navigation succeeded; unauthenticated administrator category returned 401 and an untrusted-origin preflight returned 403
- GPT-5.6 Sol with Pro reasoning independently re-reviewed both the attachment transaction/ambiguous-S3-success paths and the legal-document mutation/deletion guards; both reviews returned `RELEASE: APPROVE`, while packs and responses remain ignored local audit artifacts

The deployed production frontend was still older at verification time and retained a 390 px overflow. Recheck after deployment. A nonexistent unauthenticated attachment URL also returned 500 in the old deployment; the current local security contract blocks it before the controller.

## Deployment and Operations

Read [`DEPLOYMENT.md`](DEPLOYMENT.md) before promotion. It documents:

- immutable image tags and Blue/Green promotion
- V27–V30 migration effects and preflight requirements
- exact browser origins and private-S3 requirements
- the exact `pending/` lifecycle rule
- authorization and origin smoke checks
- deletion-outbox monitoring and rollback constraints

This Windows verification host did not have Docker or k6, so container startup, `nginx -t`, proxy load, traffic switching, and connection draining remain Linux CI/host gates.

## Audit and Commit Hygiene

Do not commit `.gjc/`, `.insane-review/`, `audit-assets/`, `load-tests/results/`, `dist/`, `.next/`, `out/`, `target/`, logs, or real environment files. GPT-5.6 Pro web-review packs and responses are local audit material only. Bruno requests reference `{{jwtToken}}` instead of literal bearer tokens. Before committing, inspect status, run `git diff --check`, review the changed-file list, and scan for secrets.

## License and Copyright

This repository currently has no root-level open-source license file. Until maintainers add one, the source, service design, logos, banners, images, and other project assets remain copyright © NIMDA SECURITY. All rights reserved.
