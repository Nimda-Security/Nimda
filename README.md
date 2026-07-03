<p align="center">
  <img src="NimdaConFrontEnd/public/NimdaconBanner.png" alt="NIMDACON banner" width="100%" />
</p>

<h1 align="center">NIMDA Contest Platform</h1>

<p align="center">
  알고리즘 대회 운영, 커뮤니티 게시판, 회원 관리를 한 번에 제공하는 NIMDA 웹 플랫폼입니다.
</p>

<p align="center">
  <a href="https://github.com/Nimda-Security/Nimda/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Nimda-Security/Nimda/ci.yml?branch=main&label=CI" /></a>
  <img alt="Java 17" src="https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white" />
  <img alt="Spring Boot" src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?logo=springboot&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111111" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" />
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="#contributors">Contributors</a>
</p>

---

## Features

- **Contest**: 문제 목록, 문제 상세, 제출, 채점 현황, 스코어보드
- **Community**: 카테고리형 게시판, 댓글, 좋아요, 사진첩, 첨부파일
- **Member**: 로그인/회원가입, 프로필, 알림, 출석, 포인트, 프로필 장식
- **Admin**: 회원 승인, 권한 관리, 게시판/태그 관리, 포인트 지급
- **Ops**: Docker Compose, Nginx, MySQL, Redis, Blue-Green 무중단 배포

## Architecture

<p align="center">
  <img src="assets/readme/framework.svg" alt="NIMDA framework architecture" width="100%" />
</p>

NIMDA는 React 프론트엔드와 Spring Boot API 서버를 중심으로 구성됩니다. 운영 환경에서는 Nginx가 Blue/Green 백엔드 중 활성 서버로 트래픽을 라우팅하고, GitHub Actions가 Docker 이미지를 빌드한 뒤 배포 스크립트를 실행합니다.

## Tech Stack

| Area     | Stack                                                              |
| -------- | ------------------------------------------------------------------ |
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS, Tiptap, Axios          |
| Backend  | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, Flyway |
| Data     | MySQL 8.0, Redis 7, AWS S3                                         |
| Infra    | Docker Compose, Nginx, GitHub Actions, Blue-Green deploy           |
| Tools    | Bruno API collection, load-test scripts, Prettier, ESLint          |

## Contributors

GitHub PR/commit 기록 기준의 주요 기능별 기여자입니다.

| Area     | Scope                                                  | Contributors                                                                   |
| -------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Frontend | 핵심 화면, MyPage, 프로필/배지, 포인트 상점, 알림 UI   | [@nuyoes](https://github.com/nuyoes)                                           |
| Frontend | 관리자/마일리지 화면 연동, 댓글/유저 상세 관련 FE 수정 | [@maenggeon](https://github.com/maenggeon)                                     |
| Frontend | 스코어보드·게시판 초기 화면, S3 첨부 흐름 연동         | [@YknowsGit](https://github.com/YknowsGit)                                     |
| Frontend | 랜딩 페이지 인트로와 비주얼 개선                       | [@JungBlue](https://github.com/JungBlue), [@nuyoes](https://github.com/nuyoes) |
| Frontend | 포인트 요약, 사이드바 이미지, 인증/세션 UX             | [@xtkww971](https://github.com/xtkww971)                                       |
| Backend  | Spring Security, CI, 테스트/운영 기반, 통합 관리       | [@novvvv](https://github.com/novvvv)                                           |
| Backend  | 포인트, 출석, 알림, 좋아요, Redis/JWT, Blue-Green 배포 | [@xtkww971](https://github.com/xtkww971)                                       |
| Backend  | 댓글, 게시판 권한, 관리자 회원/마일리지 API            | [@maenggeon](https://github.com/maenggeon)                                     |
| Backend  | 대회/스코어보드, 게시판 초기 도메인, S3 첨부파일       | [@YknowsGit](https://github.com/YknowsGit)                                     |
| Backend  | 비밀번호 복구/MCP 연동                                 | [@JungBlue](https://github.com/JungBlue)                                       |

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

Windows에서는 `mvnw.cmd spring-boot:run`을 사용합니다.

### Docker Compose

루트에 `.env` 파일을 만든 뒤 실행합니다.

```bash
docker compose up -d
```

## Configuration

루트 `.env`는 Docker Compose와 운영 백엔드가 사용합니다.

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

프론트엔드는 필요할 때만 `NimdaConFrontEnd/.env`를 추가합니다.

| Variable                   | Default       |
| -------------------------- | ------------- |
| `VITE_API_BASE_URL`        | `/api`        |
| `VITE_SCOREBOARD_ENDPOINT` | `/scoreboard` |

`.env` 파일은 커밋하지 않습니다.

## Scripts

| Command                                                    | Description                        |
| ---------------------------------------------------------- | ---------------------------------- |
| `npm run dev` in `NimdaConFrontEnd`                        | Start Vite dev server              |
| `npm run build` in `NimdaConFrontEnd`                      | Build frontend                     |
| `npm run lint` in `NimdaConFrontEnd`                       | Run frontend lint                  |
| `./mvnw test` in `NimdaConBackEnd/backend-spring`          | Run backend tests                  |
| `./mvnw clean package` in `NimdaConBackEnd/backend-spring` | Build backend JAR                  |
| `./deploy.sh status`                                       | Check Blue-Green deployment status |
| `./deploy.sh rollback`                                     | Roll back to the standby backend   |

## Deployment

CI는 `main` 브랜치 push 시 백엔드 이미지를 빌드하고 Docker Hub에 `latest`와 commit hash 태그로 푸시합니다. 서버에서는 `deploy.sh`가 대기 중인 Blue/Green 컨테이너를 갱신하고 Nginx 라우팅을 전환합니다.

자세한 운영 절차는 [DEPLOYMENT.md](DEPLOYMENT.md)를 참고하세요.

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
