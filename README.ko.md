<h1 align="center">NIMDA SECURITY</h1>

<p align="center">
  NIMDA SECURITY 동아리를 위한 대회·커뮤니티·회원·운영 통합 플랫폼입니다.
</p>

<p align="center">
  <a href="https://nimda.kr"><strong>서비스</strong></a> ·
  <a href="README.md">English</a> ·
  <a href="#주요-기능">주요 기능</a> ·
  <a href="#아키텍처">아키텍처</a> ·
  <a href="#빠른-시작">빠른 시작</a> ·
  <a href="DEPLOYMENT.md">배포</a>
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

## NIMDA SECURITY란?

NIMDA SECURITY는 동아리 운영을 위한 실제 서비스입니다. 알고리즘 대회, 문제 제출과 스코어보드, 커뮤니티 게시판, 회원 활동, 알림, 마일리지 보상, 프로필 장식과 관리자 기능을 하나의 플랫폼에서 제공합니다.

## 주요 기능

- **대회:** 문제 목록, 제출, 채점 현황, 스코어보드
- **커뮤니티:** 카테고리형 게시판, 리치 텍스트, 댓글, 좋아요, 사진첩, 첨부파일
- **회원:** 회원가입과 승인, 프로필, 출석, 알림, 마일리지, 프로필 장식
- **관리자:** 회원·권한, 카테고리·태그·게시글, 대회, 마일리지 관리
- **운영:** CI 게이트, 불변 이미지, Docker Compose, Nginx, 검증 기반 Blue/Green 전환

## 아키텍처

<p align="center">
  <img src="assets/readme/framework.svg" alt="NIMDA SECURITY 운영 아키텍처" width="100%" />
</p>

Vite 커뮤니티 프론트엔드와 Next.js 랜딩 페이지는 독립적으로 빌드됩니다. 브라우저의 API 트래픽은 TLS를 종료하는 Nginx를 거쳐 Spring Boot Blue/Green 백엔드로 전달됩니다. MySQL은 핵심 데이터를, Redis는 런타임 조정 데이터를, 비공개 S3는 검증된 첨부파일을 저장합니다. GitHub Actions는 모든 품질 게이트가 통과한 커밋 SHA 이미지만 발행하고 전환 스크립트를 실행합니다.

> Blue/Green 전환은 트래픽 변경 전에 검증하지만, 연결 드레이닝 시험 전에는 완전 무중단을 보장하지 않습니다. 자세한 내용은 [`DEPLOYMENT.md`](DEPLOYMENT.md)를 확인하십시오.

## 기술 스택

| 영역                | 스택                                                        |
| ------------------- | ----------------------------------------------------------- |
| 커뮤니티 프론트엔드 | React 19, TypeScript, Vite 7, Tailwind CSS, Tiptap          |
| 랜딩 페이지         | Next.js 16 정적 export, React 19                            |
| 백엔드              | Java 17, Spring Boot 3.2, Spring Security, JPA, Flyway      |
| 데이터·저장소       | MySQL 8, Redis 7, 비공개 AWS S3                             |
| 인프라              | Docker Compose v2, Nginx, GitHub Actions, Blue/Green 전환   |
| 검증                | Maven, ESLint, Vite, Next.js, npm audit, Bruno, k6 스크립트 |

## 저장소 구조

| 영역                | 경로                                        |
| ------------------- | ------------------------------------------- |
| 커뮤니티 프론트엔드 | `NimdaConFrontEnd/`                         |
| 랜딩 페이지         | `NimdaLandingPage/`                         |
| API 서버            | `NimdaConBackEnd/backend-spring/`           |
| 프록시·배포         | `nginx/`, `docker-compose.yml`, `deploy.sh` |
| API 컬렉션          | `bruno/`                                    |
| 부하 시험 시나리오  | `load-tests/`                               |

루트 `package.json`은 애플리케이션 실행점이 아닙니다. 각 명령은 해당 하위 프로젝트 디렉터리에서 실행해야 합니다.

## 빠른 시작

### 요구 사항

- Node.js 22 LTS와 npm 10 이상
- Java 17
- Git
- 통합 실행 시 Docker Engine과 Docker Compose v2
- 승인된 격리 성능 시험에서만 k6

### 커뮤니티 프론트엔드

```bash
cd NimdaConFrontEnd
npm ci
npm run dev
```

품질 게이트:

```bash
npm run lint
npm run build
npm audit --omit=dev
```

현재 자동화된 프론트엔드 `npm test` 스크립트는 없습니다.

### 랜딩 페이지

```bash
cd NimdaLandingPage
npm ci
npm run dev
```

품질 게이트:

```bash
npm run lint
npm run build
npm audit --omit=dev
```

production build가 성공하면 `/`와 `/_not-found`를 무시된 출력 디렉터리에 정적으로 생성합니다.

### 백엔드

```bash
cd NimdaConBackEnd/backend-spring

# Linux/macOS
./mvnw -B clean verify
./mvnw spring-boot:run

# Windows
mvnw.cmd -B clean verify
mvnw.cmd spring-boot:run
```

테스트는 `test` 프로필과 H2를 사용하므로 운영 MySQL·Redis 자격 증명이 필요하지 않습니다. 성공 신호는 `BUILD SUCCESS`입니다.

### 통합 실행

저장소 루트에서 실행합니다.

```bash
cp .env.example .env
BACKEND_IMAGE_TAG=<검증된-커밋-SHA> docker compose config
BACKEND_IMAGE_TAG=<검증된-커밋-SHA> docker compose up -d
```

`docker compose config`는 치환된 비밀값을 출력할 수 있으므로 결과를 공개하지 않습니다. 운영 전환은 `BACKEND_IMAGE_TAG=<검증된-커밋-SHA> ./deploy.sh`로 실행합니다. 이 스크립트에는 `status` 또는 `rollback` 하위 명령이 없습니다.

## 설정과 비밀정보 관리

루트 `.env.example`과 `NimdaConFrontEnd/.env.example` 템플릿만 추적합니다.

- DB, Redis, JWT, SMTP, AWS 값은 승인된 비밀 저장소에서 주입합니다.
- 실제 비밀번호, 토큰, 개인키, 인증서, 환경 덤프를 Git, 이슈, 스크린샷, 빌드 로그에 남기지 않습니다.
- CI가 발행한 불변 커밋 SHA 이미지 태그만 배포합니다. 배포 경로는 `latest`로 대체하지 않습니다.
- 프론트엔드 기본 API 경로는 `/api`, 스코어보드 경로는 `/scoreboard`입니다.

## 보안과 데이터 무결성 불변식

- 인증 쿠키는 `HttpOnly`, 운영 기본 `Secure`, `SameSite=Lax`입니다. credential 포함 브라우저 요청은 정확한 소유 origin만 신뢰하고, 안전하지 않은 cross-site 요청은 인증 전에 차단합니다.
- JWT에는 사용자별 `authVersion`이 포함됩니다. 로그아웃, 비밀번호·승인 상태·권한 변경 시 버전을 증가시킵니다. 모든 인증 요청은 승인 상태와 현재 버전이 일치해야 하며, V27 이후 claim이 없는 기존 토큰은 의도적으로 무효화됩니다.
- 구체적인 관리자 카테고리와 Actuator matcher가 공개 읽기 규칙보다 먼저 적용됩니다. 정확한 liveness/readiness 경로만 공개하고 첨부 signed URL에는 인증이 필요합니다.
- 게시글·댓글·첨부 조회는 `ACTIVE` 상태와 카르텔 권한을 검사합니다. 관리자 수정도 원 작성자를 유지하고, 다른 게시글의 부모 댓글과 다른 사용자의 미연결 첨부를 연결할 수 없습니다.
- Presigned PUT은 인증 사용자·용도·정확한 크기(최대 10 MiB)에 묶입니다. 객체는 `pending/users/<userId>/<purpose>/`에서 시작해 검증과 이미지 픽셀 제한·재인코딩 후 `users/<userId>/active/`로 이동합니다.
- V28은 물리 삭제를 outbox로 기록합니다. bounded worker는 canonical active key만 재시도하고, 신뢰할 수 없는 legacy key는 `quarantined=true`로 보존하여 자동 실행하지 않습니다.

## 성능 예산과 근거

| 계층          | 게이트                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| 프론트엔드    | 초기 경로 JS 300 KiB gzip 이하, CSS 100 KiB gzip 이하, LCP p75 2.5초 이하, INP 200ms 이하, CLS 0.10 이하 |
| 백엔드        | 일반 읽기 p95 300ms 이하, 쓰기 p95 500ms 이하, 오류율 0.5% 미만                                          |
| 프록시        | 직접 upstream 대비 p95 오버헤드 20ms 이하, 처리량 95% 이상                                               |
| 전체 시나리오 | 로그인 p95 500ms, 일반 API p95 300ms, 채점 p95 5초, 성공률 99% 초과                                      |

비교 시험은 동일한 데이터, 역할, 자원, 브라우저·도구 버전, 캐시, 네트워크와 동시성을 사용합니다. 워밍업 2회 뒤 최소 5회 측정하며 median, p95/p99, 오류율, 처리량, CPU와 메모리를 보존합니다. 운영 서버는 승인 없이 부하 시험하지 않습니다.

2026-07-10 로컬 production preview 측정:

| 지표                    |     변경 전 |   변경 후 |   변화 |
| ----------------------- | ----------: | --------: | -----: |
| 초기 JS 전송량          |   354,490 B |  99,864 B | -71.8% |
| 초기 JS 디코드 크기     | 1,201,360 B | 297,056 B | -75.3% |
| 전체 리소스 전송량      |   419,164 B | 191,418 B | -54.3% |
| DOMContentLoaded 중앙값 |      363 ms |  122.6 ms | -66.2% |
| FCP 중앙값              |      652 ms |    156 ms | -76.1% |

게시글 10개 목록의 좋아요·댓글 메타데이터 조회는 익명 사용자 기준 20회에서 2회, 로그인 사용자 기준 최소 30회에서 3회로 줄였습니다. 조회수는 읽기-수정-저장 대신 조건부 원자 UPDATE 1회로 증가시킵니다.

## 검증 결과

2026-07-10에 다음을 직접 확인했습니다.

- 커뮤니티 프론트엔드 lint와 production build 통과, production 의존성 취약점 0건
- 랜딩 페이지 lint와 정적 production build 통과, production 의존성 취약점 0건
- 백엔드 `mvnw.cmd -B clean verify` **61 tests** 통과, 실패·오류·skip 0
- 인증 버전·승인 상태, exact-origin 필터, 관리자 matcher, 첨부 인증, 게시글·댓글 접근, S3 사용자·용도·크기, 이미지 픽셀 제한과 삭제 격리를 자동 회귀 테스트로 확인
- 로컬 390px preview에서 홈·404·수정 로드 실패 화면 가로 초과 0px, 실패 화면 fieldset과 등록 버튼 비활성화
- 운영 읽기 전용 스모크에서 데스크톱 로그인·홈 이동 성공, 미인증 관리자 카테고리 401, 신뢰하지 않는 origin preflight 403 확인

검증 당시 운영 프론트엔드는 이전 버전이어서 390px 가로 초과가 남아 있었습니다. 배포 후 다시 확인해야 합니다. 운영의 존재하지 않는 미인증 첨부 URL도 500을 반환했지만 현재 로컬 보안 계약은 컨트롤러 전에 차단합니다.

## 배포와 운영

전환 전에 [`DEPLOYMENT.md`](DEPLOYMENT.md)를 읽으십시오. 다음 내용을 다룹니다.

- 불변 이미지 태그와 Blue/Green 전환
- V27/V28 마이그레이션 영향
- exact browser origin과 비공개 S3 조건
- 정확한 `pending/` lifecycle 규칙
- 권한·origin 스모크 테스트
- 삭제 outbox 관찰과 롤백 제약

이 Windows 검증 환경에는 Docker와 k6가 없어 컨테이너 시작, `nginx -t`, 프록시 부하, 실제 트래픽 전환과 연결 드레이닝은 Linux CI/운영 호스트 게이트로 남아 있습니다.

## 감사 산출물과 커밋 위생

`.gjc/`, `audit-assets/`, `load-tests/results/`, `dist/`, `.next/`, `out/`, `target/`, 로그와 실제 환경 파일을 커밋하지 않습니다. Bruno 요청은 literal bearer token 대신 `{{jwtToken}}`을 참조합니다. 커밋 전 status, `git diff --check`, 변경 파일과 비밀 패턴을 확인합니다.

## 라이선스와 저작권

현재 저장소에는 루트 오픈소스 라이선스 파일이 없습니다. 유지보수자가 라이선스를 추가하기 전까지 소스, 서비스 디자인, 로고, 배너, 이미지와 기타 프로젝트 자산의 저작권은 © NIMDA SECURITY에 있으며 모든 권리가 보유됩니다.
