# NIMDA

NIMDA는 커뮤니티·게시판·대회 기능을 제공하는 React/Spring Boot 서비스와 정적 동아리 랜딩 페이지로 구성됩니다.

## Scope and Audience

이 문서는 개발자, 리뷰어, 운영자가 저장소를 안전하게 빌드·검증·배포하기 위한 기준입니다.

| 영역 | 경로 | 기술 |
| --- | --- | --- |
| 커뮤니티 프론트엔드 | `NimdaConFrontEnd/` | React 19, TypeScript, Vite 7 |
| 랜딩 페이지 | `NimdaLandingPage/` | Next.js 16 정적 export, React 19 |
| API 서버 | `NimdaConBackEnd/backend-spring/` | Java 17, Spring Boot 3.2, JPA |
| 리버스 프록시·배포 | `nginx/`, `docker-compose.yml`, `deploy.sh` | Nginx, Docker Compose v2 |
| 부하 테스트 | `load-tests/` | k6 |

루트 `package.json`은 애플리케이션 실행점이 아닙니다. 각 하위 프로젝트의 명령을 해당 작업 디렉터리에서 실행해야 합니다.

## Prerequisites and Supported Versions

- Node.js 22 LTS와 npm 10 이상
- Java 17
- Docker Engine과 Docker Compose v2(통합 배포 시)
- k6(격리된 성능 시험 시에만)
- Git

검증 워크스테이션은 Windows 11 x64, Node.js 25.2.1, npm 11.18.0, Temurin Java 17.0.19를 사용했습니다. CI는 Node.js 22와 Temurin Java 17을 사용합니다.

## Commands and Working Directories

명령은 별도 표시가 없으면 소스 파일을 수정하지 않지만, `npm ci`, Maven, 빌드는 각각 `node_modules/`, `target/`, `dist/`, `.next/`, `out/` 같은 무시된 산출물을 만듭니다.

### 커뮤니티 프론트엔드

작업 디렉터리: `NimdaConFrontEnd/`

```bash
npm ci
npm run lint
npm run build
npm run preview
```

성공 신호는 ESLint 오류 0건과 Vite의 `built` 메시지입니다. 현재 자동화된 프론트엔드 테스트 스크립트는 없으므로 존재하지 않는 `npm test`를 실행하거나 문서화하지 않습니다.

### 랜딩 페이지

작업 디렉터리: `NimdaLandingPage/`

```bash
npm ci
npm run lint
npm run build
```

성공하면 Next.js가 `/`와 `/_not-found`를 정적 페이지로 생성하며 결과는 `out/`에 기록됩니다.

### 백엔드

작업 디렉터리: `NimdaConBackEnd/backend-spring/`

```bash
# Linux/macOS
./mvnw -B clean verify

# Windows
mvnw.cmd -B clean verify
```

성공 신호는 Maven `BUILD SUCCESS`입니다. 테스트 프로필은 H2를 사용하며 외부 MySQL·Redis에 접속하지 않습니다.

### 통합 구성

작업 디렉터리: 저장소 루트

```bash
cp .env.example .env
BACKEND_IMAGE_TAG=<배포할-커밋-SHA> docker compose config
BACKEND_IMAGE_TAG=<배포할-커밋-SHA> docker compose up -d
```

`docker compose config`는 설정을 읽기만 하지만 치환된 비밀값을 출력할 수 있으므로 로그를 공유하지 마십시오. 자세한 운영 절차는 [`DEPLOYMENT.md`](DEPLOYMENT.md)를 따릅니다.

## Configuration and Secret Handling

- 루트 `.env.example`과 `NimdaConFrontEnd/.env.example`만 예시로 추적합니다.
- 실제 `.env`, JWT 키, DB/Redis/SMTP/AWS 자격 증명은 승인된 비밀 저장소에서 주입합니다.
- 비밀번호를 Git, 채팅, 이슈, 스크린샷, 빌드 로그, 부하 테스트 결과에 복사하지 않습니다.
- `BACKEND_IMAGE_TAG`는 CI가 만든 불변 커밋 SHA 태그여야 합니다. `latest`를 배포 태그로 사용하지 않습니다.
- 프론트엔드의 기본 API 경로는 `/api`, 스코어보드 경로는 `/scoreboard`입니다.

## Security and Data-Integrity Invariants

- 인증 쿠키는 `HttpOnly`, 운영 기본 `Secure`, `SameSite=Lax`이며 CORS와 상태 변경 요청은 `nimda.kr`, `www.nimda.kr`, 로컬 3000 포트의 정확한 origin만 신뢰합니다. 브라우저의 신뢰되지 않은 `Origin` 또는 `Sec-Fetch-Site: cross-site` 상태 변경 요청은 인증 전 403으로 차단합니다.
- 애플리케이션 JWT에는 사용자별 `authVersion`이 포함됩니다. 로그아웃, 비밀번호 변경, 승인 상태 또는 권한 변경은 버전을 증가시키며, `APPROVED` 상태와 현재 버전이 모두 일치해야 요청이 인증됩니다. V27 배포 후 기존 버전 없는 JWT는 의도적으로 무효화되므로 사용자는 한 번 다시 로그인해야 합니다.
- 관리자 카테고리, Actuator, 첨부 다운로드 URL은 구체적인 matcher가 공개 규칙보다 먼저 적용됩니다. 일반 Actuator 경로는 관리자 전용이고 공개 경로는 정확한 liveness/readiness 주소뿐입니다.
- 게시글·댓글·첨부 조회는 `ACTIVE` 상태와 카르텔 역할을 함께 검사합니다. 수정 시 원 작성자를 유지하고, 다른 게시글의 부모 댓글이나 다른 사용자의 미연결 첨부를 연결할 수 없습니다.
- Presigned PUT은 사용자·용도·정확한 파일 크기(최대 10 MiB)에 묶입니다. 객체는 `pending/users/<userId>/<purpose>/`에서 시작해 서버가 실제 크기와 소유권을 확인하고 이미지를 픽셀 제한 내에서 재인코딩한 뒤 `users/<userId>/active/`로 이동합니다. `pending/` 객체에는 운영 S3 수명 주기 삭제 정책을 적용해야 합니다.
- 첨부 메타데이터 삭제와 저장소 삭제는 V28 outbox로 분리됩니다. DB 커밋과 함께 삭제 작업을 남기고 bounded worker가 성공할 때까지 재시도합니다. 물리 삭제에는 사용자·namespace가 일치하는 canonical active key만 넣으며, 신뢰할 수 없는 legacy S3 key는 자동 삭제하지 않아 DB 롤백이나 과거 임의 key 데이터가 다른 객체를 지우지 못합니다.

## Performance Budgets and Measurement Protocol

| 계층 | 기본 게이트 |
| --- | --- |
| 프론트엔드 | 초기 경로 JS 300 KiB gzip 이하, CSS 100 KiB gzip 이하, LCP p75 2.5초 이하, INP 200ms 이하, CLS 0.10 이하 |
| 백엔드 | 일반 읽기 p95 300ms 이하, 쓰기 p95 500ms 이하, 오류율 0.5% 미만 |
| 프록시 | 직접 연결 대비 p95 오버헤드 20ms 이하, 처리량 95% 이상 유지 |
| 전체 시나리오 | 로그인 p95 500ms, 일반 API p95 300ms, 채점 p95 5초, 성공률 99% 초과 |

비교 시험은 같은 데이터, 계정 역할, 자원 제한, 브라우저·도구 버전, 캐시 상태, 네트워크, 동시성에서 워밍업 2회 후 최소 5회를 측정합니다. 중앙값과 p95/p99, 오류율, 처리량, CPU·메모리를 함께 기록합니다. 운영 서버를 임의로 부하 테스트하지 않습니다.

2026-07-10 로컬 production preview의 로그인 경로 비교입니다. 변경 전 값은 동일 워크스테이션의 단일 기준 측정이고, 변경 후 값은 캐시를 끈 뒤 워밍업 2회와 측정 5회의 중앙값이므로 용량/SLA 증명으로 해석하지 않습니다.

| 지표 | 변경 전 | 변경 후 | 변화 |
| --- | ---: | ---: | ---: |
| 초기 JS 전송량 | 354,490 B | 99,864 B | -71.8% |
| 초기 JS 디코드 크기 | 1,201,360 B | 297,056 B | -75.3% |
| 전체 리소스 전송량 | 419,164 B | 191,418 B | -54.3% |
| DOMContentLoaded 중앙값 | 363 ms | 122.6 ms | -66.2% |
| FCP 중앙값 | 652 ms | 156 ms | -76.1% |

게시글 10개 목록의 좋아요·댓글 메타데이터 조회는 익명 사용자 기준 20회에서 2회, 로그인 사용자 기준 최소 30회에서 3회로 줄였습니다. 조회수 증가는 읽기-수정-저장 대신 조건부 원자 UPDATE 1회로 처리합니다.

## Verification and Expected Results

2026-07-10에 다음을 직접 확인했습니다.

- 커뮤니티 프론트엔드: `npm run lint`, `npm run build` 통과
- 랜딩 페이지: Next.js 16에서 `npm run lint`, `npm run build` 통과
- 프론트엔드와 랜딩 페이지: `npm audit --omit=dev` 취약점 0건
- 백엔드: `mvnw.cmd -B clean verify` 통과(58 tests), H2에서 모든 JPA 저장소 쿼리 생성 확인
- 보안 회귀: JWT 버전·승인 상태, exact-origin 상태 변경 필터, 관리자 category/Actuator matcher, 첨부 인증, 게시글/댓글 접근, S3 사용자·용도·크기 경계, 이미지 픽셀 제한, 삭제 outbox를 자동 테스트로 확인
- 모바일 390px 로컬 preview: 홈과 글쓰기의 문서 폭 390px, 가로 초과 요소 0개; 글쓰기 폼 358px
- 운영 읽기 전용 스모크: 데스크톱 로그인·홈 이동 성공, 미인증 `/api/cite/category/all` 401, 신뢰하지 않는 origin의 preflight 403 확인. 배포본의 미인증 존재하지 않는 첨부 URL은 500을 반환했으며, 현재 로컬 보안 계약 테스트는 요청을 컨트롤러 전에 403으로 차단합니다.

CI는 프론트엔드 lint/build, 랜딩 lint/build, Maven `clean verify`가 모두 통과해야 이미지를 만들고 배포 단계로 진행합니다.

## Audit Artifacts and Commit Hygiene

- `.gjc/`, `audit-assets/`, `load-tests/results/`, `dist/`, `.next/`, `out/`, `target/`, 로그와 실제 `.env`는 커밋하지 않습니다.
- 원본 스크린샷·브라우저 추적·부하 테스트 JSON은 승인된 외부 저장소에 보관하고, Git에는 요약과 체크섬 또는 불변 링크만 남깁니다.
- 커밋 전 `git status --short`, `git diff --check`, 변경 파일 목록과 비밀 패턴을 확인합니다.
- Bruno 요청 파일은 literal bearer token 대신 `{{jwtToken}}`만 사용하며, 저장소 전체 secret-pattern scan 결과가 0건이어야 합니다.
- 생성물이나 다른 사용자의 작업을 `git clean`, `reset`, `stash`로 제거하지 않습니다.

## Limitations, Rollback, and Last Verified Date

- 이 Windows 워크스테이션에는 Docker와 k6가 없어 컨테이너 구동, Nginx `-t`, 실제 프록시 부하·전환 시험은 수행하지 못했습니다. 해당 게이트는 Docker/k6가 있는 격리 환경과 CI에서 실행해야 합니다.
- 운영 `nimda.kr`은 아직 이전 프론트엔드를 제공하므로 390px 재검사에서 문서 폭 730px(340px 초과)가 확인됐습니다. 현재 로컬 production build는 홈·404·실패한 글 수정 화면 모두 390px/초과 0px이며 실제 개선은 배포 후 다시 확인해야 합니다.
- Nginx 전환은 설정 검증·실패 복구를 수행하지만 연결 드레이닝 시험 전에는 “무중단”을 보장하지 않습니다.
- Spring JPA Open Session in View는 기존 컨트롤러의 지연 연관관계 매핑 때문에 명시적으로 유지됩니다. 이를 끄려면 모든 응답을 서비스 트랜잭션 안에서 DTO로 변환하는 후속 구조 개선과 통합 테스트가 필요합니다.
- 배포 전 문제 발생 시 트래픽을 전환하지 않고 대상 컨테이너를 조사합니다. 전환 후에는 이전 불변 이미지 태그로 대상 색상을 다시 기동·검증한 뒤 재전환합니다.
- 마지막 검증: 2026-07-10, Windows 11 x64, 커밋 `319fa29` 이후 현재 변경 집합.
