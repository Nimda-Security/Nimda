# Nimda Security Web Platform

<!-- 서비스 대표 이미지 (팀에서 캡처 후 URL 교체) -->
<!-- ![readme_mockup](이미지_URL) -->

- **배포 URL (랜딩)**: [nimda-silk.vercel.app](https://nimda-silk.vercel.app)
- **저장소**: [Nimda-Security/Nimda](https://github.com/Nimda-Security/Nimda)
- **테스트 계정**: _(팀에서 공유한 계정 정보로 채워 주세요)_

<br>

## 프로젝트 소개

**Nimda**는 Nimda Security 동아리의 웹 플랫폼 모노레포입니다. 대회·커뮤니티·동아리 소개를 하나의 저장소에서 관리합니다.

- **NimdaCon**: CTF/알고리즘 대회 운영 — 문제 목록·제출·채점 상태·스코어보드
- **게시판·커뮤니티**: 카테고리별 게시판, 사진첩, 댓글·좋아요, 사용자 프로필
- **마일리지·관리자**: 포인트 적립/조회, 관리자 대시보드·마일리지 지급
- **NimdaLandingPage**: 동아리 소개 랜딩 페이지 (Next.js)

<br>

## 팀원 구성

|              **최도일**              |              **김서윤**              |                 **주윤호**                 |
| :----------------------------------: | :----------------------------------: | :----------------------------------------: |
|        ![최도일](이미지_URL)         |        ![김서윤](이미지_URL)         |           ![주윤호](이미지_URL)            |
| [@novvvv](https://github.com/novvvv) | [@nuyoes](https://github.com/nuyoes) | [@YknowsGit](https://github.com/YknowsGit) |

|                **이도현**                |                 **이명건**                 |                 **정푸른**                 |
| :--------------------------------------: | :----------------------------------------: | :----------------------------------------: |
|          ![이도현](이미지_URL)           |           ![이명건](이미지_URL)            |           ![정푸른](이미지_URL)            |
| [@xtkww971](https://github.com/xtkww971) | [@github-id](https://github.com/github-id) | [@github-id](https://github.com/github-id) |

> 프로필 사진: `이미지_URL` 자리에 GitHub `raw` 링크나 팀 공용 이미지 경로를 넣으면 됩니다.

<br>

## 1. 개발 환경

| 구분                | 기술                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| **Front (Con)**     | React 19, TypeScript, Vite, Tailwind CSS, styled-components, TipTap, Monaco Editor |
| **Front (Landing)** | Next.js 14, TypeScript, Tailwind CSS, Framer Motion                                |
| **Back-end**        | Spring Boot 3.2, Spring Security, JPA, Flyway, JWT, Redis                          |
| **DB**              | MySQL 8.0, Redis 7                                                                 |
| **인프라**          | Docker Compose, Nginx, GitHub Actions (CI)                                         |
| **API 테스트**      | Bruno                                                                              |
| **코드 품질**       | ESLint, Prettier                                                                   |
| **협업**            | GitHub, GitHub Issues, GitHub Projects _(Notion·Discord 등 팀 도구 추가)_          |

<br>

## 2. 채택한 개발 기술과 브랜치 전략

### React + Vite + TypeScript

- 도메인 단위 폴더 구조(`domains/Contest`, `domains/Board`, `domains/User` 등)로 기능별 코드를 분리했습니다.
- `ProtectedRoute`로 로그인·관리자 권한에 따른 접근 제어를 라우트 레벨에서 처리합니다.
- 개발 환경에서는 `vite.config.ts`의 proxy로 `/api` 요청을 백엔드(`localhost:8080`)에 전달합니다.

### Spring Boot + JWT

- REST API와 JWT 기반 인증으로 프론트·백을 분리했습니다.
- Flyway로 DB 스키마를 버전 관리하며, Redis는 인증 코드 등 단기 데이터 저장에 사용합니다.

### Docker + Blue-Green 배포

- `docker-compose.yml`로 MySQL, Redis, 백엔드, Nginx를 한 번에 구성합니다.
- `deploy.sh`와 `DEPLOYMENT.md`에 Blue-Green 무중단 배포 절차가 정리되어 있습니다.

### ESLint & Prettier

- 프론트엔드 코드 스타일과 린트 규칙을 도구로 통일해 리뷰 비용을 줄였습니다.

### 브랜치 전략

<!-- 팀에서 실제로 쓰는 전략에 맞게 수정하세요 -->

- **main**: 배포·운영 기준 브랜치
- **feature/\***: 기능 단위 개발 후 PR로 병합

<br>

## 3. 프로젝트 구조

```
Nimda/
├── NimdaConFrontEnd/       # 대회·게시판·마이페이지 (React + Vite)
│   └── src/
│       ├── domains/        # User, Contest, Board, admin, Home ...
│       ├── components/     # 공통 UI, ProtectedRoute, Layout ...
│       └── api/            # REST 클라이언트
├── NimdaConBackEnd/
│   └── backend-spring/     # Spring Boot API
│       └── src/main/java/com/nimda/cite/
├── NimdaLandingPage/       # 동아리 랜딩 (Next.js)
├── nginx/                  # 리버스 프록시 설정
├── bruno/                  # API 컬렉션 (Bruno)
├── load-tests/             # 부하 테스트
├── docker-compose.yml
├── deploy.sh
├── DEPLOYMENT.md
└── README.md
```

<br>

## 4. 역할 분담

<!-- 팀원별 담당 UI·기능을 채워 주세요. likelion README 템플릿 형식 참고 -->

### 👤 팀원 A

- **UI**: _(예: 로그인, 회원가입, 마이페이지)_
- **기능**: _(예: JWT 로그인, 프로필 수정)_

### 👤 팀원 B

- **UI**: _(예: 문제 목록, 제출, 스코어보드)_
- **기능**: _(예: 채점 연동, 대회 홈)_

<br>

## 5. 개발 기간 및 작업 관리

### 개발 기간

- 전체 개발 기간: _YYYY-MM-DD ~ YYYY-MM-DD_
- UI 구현: _기간_
- 기능 구현: _기간_

### 작업 관리

- GitHub Issues·Projects로 작업 단위와 진행 상황을 관리합니다.
- _(주간 회의, Wiki 기록 등 팀 협업 방식을 추가하세요)_

<br>

## 6. 신경 쓴 부분

- **권한 분리**: 일반 사용자 / 관리자 라우트 분리 (`ProtectedRoute`, 403 페이지)
- **대회 운영**: 문제 CRUD, 코드 제출, 채점 상태, 실시간 스코어보드
- **게시판**: TipTap 에디터, 첨부·태그, 사진첩·배너 보드
- **배포**: Blue-Green 전환, 헬스체크, `DEPLOYMENT.md` 문서화
- **보안**: `.env`·JWT·DB 비밀번호는 저장소에 포함하지 않음

<br>

## 7. 주요 기능

| 영역       | 설명                                             |
| ---------- | ------------------------------------------------ |
| **인증**   | 로그인·회원가입, JWT, 비밀번호 찾기·변경         |
| **대회**   | 문제 목록/상세, 코드 제출, 채점 상태, 스코어보드 |
| **게시판** | 목록·상세·작성·수정, 댓글·좋아요, 사진첩·배너    |
| **사용자** | 프로필, 마일리지, BOJ 연동 등                    |
| **관리자** | 대시보드, 마일리지 지급, 배너 등 관리 기능       |

<!-- 페이지별 스크린샷·GIF는 아래처럼 섹션을 추가할 수 있습니다 (likelion README 7장 참고) -->

<!--
### [로그인]
| 로그인 |
|--------|
| ![login](이미지_URL) |
-->

<br>

## 8. 로컬 실행 가이드

### 사전 요구 사항

- Node.js 18+
- Java 17+
- MySQL 8.0 (또는 Docker)
- _(Redis — 백엔드 일부 기능용)_

### 1) 환경 변수 설정

프로젝트 루트에 Docker Compose용 `.env` 파일을 만듭니다.

```bash
# 루트 (Docker Compose)
touch .env
```

**루트 `.env` 주요 변수** (`docker-compose.yml` 기준):

| 변수                  | 설명                       |
| --------------------- | -------------------------- |
| `MYSQL_ROOT_PASSWORD` | MySQL root 비밀번호        |
| `MYSQL_DATABASE`      | DB 이름 (예: `nimda_con`)  |
| `MYSQL_USER`          | MySQL 사용자 (예: `nimda`) |
| `MYSQL_PASSWORD`      | MySQL 사용자 비밀번호      |
| `REDIS_PASSWORD`      | Redis 비밀번호             |
| `JWT_SECRET`          | JWT 서명 키                |
| `AWS_S3_*`            | 파일 업로드 (S3)           |
| `MAIL_*`              | SMTP 메일 발송             |

**프론트엔드 `.env`** (선택, 프로덕션 빌드 시):

```bash
cd NimdaConFrontEnd
touch .env
```

| 변수                       | 기본값        | 설명                  |
| -------------------------- | ------------- | --------------------- |
| `VITE_API_BASE_URL`        | `/api`        | API 베이스 URL        |
| `VITE_SCOREBOARD_ENDPOINT` | `/scoreboard` | 스코어보드 엔드포인트 |

> 개발 시에는 `vite.config.ts` proxy를 사용하므로 프론트 `.env` 없이도 동작할 수 있습니다.

### 2) Docker로 인프라 + 백엔드 실행

```bash
docker compose up -d
```

### 3) 프론트엔드 (NimdaCon) 개발 서버

```bash
cd NimdaConFrontEnd
npm install
npm run dev
```

- 접속: `http://localhost:3000`
- API는 `http://localhost:8080`으로 프록시됩니다.

### 4) 백엔드만 로컬 실행 (선택)

```bash
cd NimdaConBackEnd/backend-spring
./mvnw spring-boot:run
```

DB 연결 정보는 `src/main/resources/application.yml`에서 설정합니다.  
로컬 기본 계정 예시는 `NimdaConBackEnd/backend-spring/README.md`를 참고하세요.

### 5) 랜딩 페이지 (선택)

```bash
cd NimdaLandingPage
npm install
npm run dev
```

<br>

## 주의사항

- `.env` 파일은 **Git에 커밋하지 마세요** (`.gitignore`에 포함됨)
- 실제 비밀번호·JWT·운영 URL은 **팀 채널로만** 공유하세요
- API 테스트 환경 변수는 `bruno/README.md`를 참고하세요
- 배포 상세는 [`DEPLOYMENT.md`](./DEPLOYMENT.md)를 참고하세요

<br>

## 참고

- [likelion-project-README 템플릿](https://github.com/likelion-project-README/README) — README 구성 참고
- [Nimda-Security/Nimda](https://github.com/Nimda-Security/Nimda)
