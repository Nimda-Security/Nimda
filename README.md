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

- **Contest:** problem catalog, submissions, judging status, and scoreboards
- **Community:** category-based boards, rich text, comments, likes, galleries, and attachments
- **Member:** registration, approval, profiles, attendance, notifications, mileage, and decorations
- **Admin:** user and role management, categories, tags, boards, contests, and mileage grants
- **Operations:** CI gates, immutable images, Docker Compose, Nginx, and validated Blue/Green promotion

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
- Application JWTs contain a per-user `authVersion`. Logout, password changes, approval changes, and role changes rotate it. Every authenticated request requires an approved account and the current version. V27 intentionally invalidates legacy tokens without this claim.
- Specific administrator category and Actuator matchers precede public read rules. Only exact liveness/readiness health paths are public; attachment signed-URL endpoints require authentication.
- Board, comment, and attachment reads enforce `ACTIVE` visibility and cartel membership. Administrator edits preserve the original board author, cross-board comment parents are rejected, and unlinked attachments remain owner-only.
- Presigned PUTs bind the authenticated user, upload purpose, and exact size up to 10 MiB. Objects start under `pending/users/<userId>/<purpose>/`, are validated and images are pixel-bounded/re-encoded, then move under `users/<userId>/active/`.
- V28 records physical deletion in an outbox. The bounded worker retries canonical active keys, while untrusted legacy keys remain `quarantined=true` and are never executed automatically.

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

Verified on 2026-07-10:

- Community frontend: lint and production build passed; production dependency audit found 0 vulnerabilities
- Landing page: lint and static production build passed; production dependency audit found 0 vulnerabilities
- Backend: `mvnw.cmd -B clean verify` passed with **61 tests**, 0 failures, 0 errors, and 0 skipped
- Security regressions cover auth-version/status enforcement, exact-origin filtering, administrator matchers, attachment authentication, board/comment visibility, S3 ownership/purpose/size limits, image pixel limits, and deletion quarantine
- Local 390 px preview: home, 404, and failed-edit screens had no horizontal overflow; failed edit hydration kept the form and submit action disabled
- Production read-only smoke: desktop login and home navigation succeeded; unauthenticated administrator category returned 401 and an untrusted-origin preflight returned 403

The deployed production frontend was still older at verification time and retained a 390 px overflow. Recheck after deployment. A nonexistent unauthenticated attachment URL also returned 500 in the old deployment; the current local security contract blocks it before the controller.

## Deployment and Operations

Read [`DEPLOYMENT.md`](DEPLOYMENT.md) before promotion. It documents:

- immutable image tags and Blue/Green promotion
- V27/V28 migration effects
- exact browser origins and private-S3 requirements
- the exact `pending/` lifecycle rule
- authorization and origin smoke checks
- deletion-outbox monitoring and rollback constraints

This Windows verification host did not have Docker or k6, so container startup, `nginx -t`, proxy load, traffic switching, and connection draining remain Linux CI/host gates.

## Audit and Commit Hygiene

Do not commit `.gjc/`, `audit-assets/`, `load-tests/results/`, `dist/`, `.next/`, `out/`, `target/`, logs, or real environment files. Bruno requests reference `{{jwtToken}}` instead of literal bearer tokens. Before committing, inspect status, run `git diff --check`, review the changed-file list, and scan for secrets.

## License and Copyright

This repository currently has no root-level open-source license file. Until maintainers add one, the source, service design, logos, banners, images, and other project assets remain copyright © NIMDA SECURITY. All rights reserved.
