<h1 align="center">NIMDA SECURITY</h1>

<p align="center">
  A contest and community platform for the NIMDA SECURITY club.
</p>

<p align="center">
  <a href="https://nimda.kr"><strong>Live App</strong></a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#license-and-copyright">License</a>
</p>

<p align="center">
  <a href="https://github.com/Nimda-Security/Nimda/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Nimda-Security/Nimda/ci.yml?branch=main&label=CI" /></a>
  <a href="https://nimda.kr"><img alt="Live app" src="https://img.shields.io/badge/Live-nimda.kr-111111" /></a>
  <img alt="Java 17" src="https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white" />
  <img alt="Spring Boot" src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?logo=springboot&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111111" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-not_specified-lightgrey" />
</p>

---

## What is NIMDA SECURITY?

NIMDA SECURITY is the production web platform for the NIMDA SECURITY club. It brings contest operations, problem solving, scoreboards, member activity, community boards, notifications, mileage rewards, and admin workflows into one service.

## Features

- **Contest**: problem list, problem detail pages, submissions, judging status, and scoreboards.
- **Community**: category-based boards, comments, likes, photo gallery, rich text, and attachments.
- **Member**: login, registration, profile, attendance, notifications, mileage, and profile decorations.
- **Admin**: user approval, role management, board/category/tag management, and mileage grants.
- **Operations**: Docker Compose runtime, Nginx routing, MySQL, Redis, S3, CI, and Blue-Green deployment.

## Architecture

<p align="center">
  <img src="assets/readme/framework.svg" alt="NIMDA SECURITY framework architecture" width="100%" />
</p>

NIMDA SECURITY is centered on a React frontend and a Spring Boot API server. In production, Nginx routes traffic to the active Blue/Green backend, while GitHub Actions builds Docker images and triggers the deployment script.

## Tech Stack

| Area     | Stack                                                              |
| -------- | ------------------------------------------------------------------ |
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS, Tiptap, Axios          |
| Backend  | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, Flyway |
| Data     | MySQL 8.0, Redis 7, AWS S3                                         |
| Infra    | Docker Compose, Nginx, GitHub Actions, Blue-Green deployment       |
| Tools    | Bruno API collection, load-test scripts, Prettier, ESLint          |

## Quick Start

### Requirements

- Node.js 20+
- Java 17
- Docker and Docker Compose

### Frontend

```bash
cd NimdaConFrontEnd
npm install
npm run dev
```

### Backend

```bash
cd NimdaConBackEnd/backend-spring
./mvnw spring-boot:run
```

Use `mvnw.cmd spring-boot:run` on Windows.

### Docker Compose

Create a root `.env` file first, then run:

```bash
docker compose up -d
```

## Configuration

The root `.env` file is used by Docker Compose and the production backend.

| Variable                                 | Description                     |
| ---------------------------------------- | ------------------------------- |
| `MYSQL_ROOT_PASSWORD`                    | MySQL root password             |
| `MYSQL_DATABASE`                         | Database name, e.g. `nimda_con` |
| `MYSQL_USER` / `MYSQL_PASSWORD`          | Application database account    |
| `REDIS_PASSWORD`                         | Redis password                  |
| `JWT_SECRET`                             | JWT signing secret              |
| `AWS_S3_BUCKET`, `AWS_S3_REGION`         | S3 bucket settings              |
| `AWS_S3_ACCESS_KEY`, `AWS_S3_SECRET_KEY` | S3 credentials                  |
| `MAIL_HOST`, `MAIL_PORT`                 | SMTP server                     |
| `MAIL_USERNAME`, `MAIL_PASSWORD`         | SMTP credentials                |

Frontend environment variables are optional for local development.

| Variable                   | Default       |
| -------------------------- | ------------- |
| `VITE_API_BASE_URL`        | `/api`        |
| `VITE_SCOREBOARD_ENDPOINT` | `/scoreboard` |

Do not commit `.env` files.

## Scripts

| Command                                                    | Description                        |
| ---------------------------------------------------------- | ---------------------------------- |
| `npm run dev` in `NimdaConFrontEnd`                        | Start the Vite dev server          |
| `npm run build` in `NimdaConFrontEnd`                      | Build the frontend                 |
| `npm run lint` in `NimdaConFrontEnd`                       | Run frontend lint checks           |
| `./mvnw test` in `NimdaConBackEnd/backend-spring`          | Run backend tests                  |
| `./mvnw clean package` in `NimdaConBackEnd/backend-spring` | Build the backend JAR              |
| `./deploy.sh status`                                       | Check Blue-Green deployment status |
| `./deploy.sh rollback`                                     | Roll back to the standby backend   |

## Deployment

On every push to `main`, CI builds the backend image and pushes both `latest` and commit-hash tags. On the server, `deploy.sh` updates the standby Blue/Green container, checks health, and switches Nginx routing.

See [DEPLOYMENT.md](DEPLOYMENT.md) for operational details.

## Design and Assets

- Live service: [nimda.kr](https://nimda.kr)
- Architecture image: `assets/readme/framework.svg`
- Product and brand assets live under the frontend and landing-page `public` directories.

Design assets, logos, banners, and screenshots belong to the NIMDA SECURITY project and should not be reused outside this project without permission from the maintainers.

## Contributors

Major areas below are summarized from public GitHub PR and commit history.

| Area     | Scope                                                   | Contributors                                                                   |
| -------- | ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Frontend | Core screens, MyPage, profile/badges, mileage shop, UI  | [@nuyoes](https://github.com/nuyoes)                                           |
| Frontend | Admin/mileage UI, comments, user-detail integrations    | [@maenggeon](https://github.com/maenggeon)                                     |
| Frontend | Scoreboard, early board screens, S3 attachment flow     | [@YknowsGit](https://github.com/YknowsGit)                                     |
| Frontend | Landing-page intro and visual direction                 | [@JungBlue](https://github.com/JungBlue), [@nuyoes](https://github.com/nuyoes) |
| Frontend | Point summary, sidebar imagery, auth/session UX         | [@xtkww971](https://github.com/xtkww971)                                       |
| Backend  | Spring Security, CI, testing, operations foundation     | [@novvvv](https://github.com/novvvv)                                           |
| Backend  | Points, attendance, notifications, likes, Redis/JWT, CD | [@xtkww971](https://github.com/xtkww971)                                       |
| Backend  | Comments, board permissions, admin user/mileage APIs    | [@maenggeon](https://github.com/maenggeon)                                     |
| Backend  | Contest/scoreboard, initial board domain, S3 files      | [@YknowsGit](https://github.com/YknowsGit)                                     |
| Backend  | Password recovery and MCP integration                   | [@JungBlue](https://github.com/JungBlue)                                       |

## License and Copyright

This repository does not currently include a repository-level open-source license file. Until a license is added, the source code, service design, logo, banners, images, and other project assets are copyright © NIMDA SECURITY. All rights reserved.

## Repository Layout

```text
Nimda/
├── NimdaConFrontEnd/              # React + Vite application
├── NimdaConBackEnd/backend-spring # Spring Boot API server
├── NimdaLandingPage/              # Next.js landing page
├── bruno/                         # API request collection
├── load-tests/                    # Load-test scripts and results
├── nginx/                         # Nginx routing configuration
├── docker-compose.yml             # Runtime services
└── deploy.sh                      # Blue-Green deployment script
```
