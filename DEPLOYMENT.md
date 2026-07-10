# NIMDA Deployment Guide

이 문서는 현재 저장소의 Docker Compose, Nginx, GitHub Actions, Blue/Green 전환 스크립트와 일치하는 운영 절차입니다. 검증되지 않은 “완전 무중단” 또는 고정 복구 시간은 보장하지 않습니다.

## Scope and Audience

대상은 NIMDA API 운영자와 배포 리뷰어입니다. 구성 요소는 다음과 같습니다.

- `docker-compose.yml`: MySQL, Redis, blue/green Spring Boot, Nginx
- `deploy.sh`: 대기 색상 기동, 준비 상태 확인, 검증 후 트래픽 전환
- `nginx/nginx.conf`: TLS 종단, 압축, 연결 재사용, API 제한, SSE
- `.github/workflows/ci.yml`: 모든 PR의 lint/build/test와 upstream `main` push만의 이미지 발행·운영 배포
- `nginx/conf.d/active-backend.inc`: 현재 upstream 한 줄; 런타임에 생성되며 Git에 저장하지 않음

스크립트는 `deploy`, `status`, `rollback` 같은 하위 명령을 받지 않습니다. 배포는 환경변수와 함께 `./deploy.sh` 한 번으로 실행합니다.

## Prerequisites and Supported Versions

운영 호스트에 다음이 필요합니다.

- Linux와 Bash
- Docker Engine, Docker Compose v2
- `curl`, `flock`, `mktemp`, `mv`, `chmod`
- Nginx 컨테이너 이름 `nimda-nginx`
- `/home/ubuntu/app` 또는 동일 구조의 배포 디렉터리
- 유효한 `api.nimda.kr` 인증서가 `certbot/conf/`에 마운트된 상태
- Docker Hub에 발행된 불변 short-SHA 이미지 태그

백엔드 런타임 이미지는 Java 17, 내부 포트 8080, Compose healthcheck용 `curl`을 포함합니다.

데이터베이스는 저장소의 digest로 고정한 MySQL 8.0 이미지 중 **8.0.19 이상**만 지원합니다. `STRICT_TRANS_TABLES` 또는 `STRICT_ALL_TABLES`가 켜져 있어야 하며 MariaDB로 대체하지 않습니다. V30의 atomic upsert와 CHECK 제약이 이 경계를 전제로 합니다.

## Commands and Working Directories

모든 명령은 저장소 또는 운영 배포 디렉터리 루트에서 실행합니다.

### 최초 설정

```bash
cp .env.example .env
mkdir -p nginx/conf.d
chmod +x deploy.sh
BACKEND_IMAGE_TAG=<검증된-커밋-SHA> docker compose config
```

`cp`와 `mkdir`은 로컬 파일을 만들며, `docker compose config`는 컨테이너를 변경하지 않습니다. 단, 치환된 비밀값이 표준 출력에 나타날 수 있으므로 결과를 공개 로그에 남기지 않습니다.

### 배포

```bash
BACKEND_IMAGE_TAG=<검증된-커밋-SHA> ./deploy.sh
```

스크립트는 다음 순서로 동작합니다.

1. 필수 명령과 이미지 태그를 확인하고 `/tmp/nimda-deploy.lock`의 비차단 잠금을 획득합니다.
2. `active-backend.inc`를 엄격히 읽어 활성/대기 색상을 결정합니다.
3. 대기 색상의 불변 이미지를 pull하고 기동합니다.
4. 로컬 공개 포트 8081 또는 8082의 `/api/cite/category`가 2xx를 반환할 때까지 최대 24회, 5초 간격으로 확인합니다.
5. upstream 파일을 임시 파일과 원자적 `mv`로 교체합니다.
6. `docker exec nimda-nginx nginx -t`가 성공해야 reload합니다.
7. 검증 또는 reload 실패 시 이전 upstream 파일을 복구하고 성공한 서버를 중단하지 않습니다.
8. 전환 성공 후에만 이전 색상 컨테이너를 중단합니다.

성공 신호는 `Promoted backend-<color>.`와 이전 색상 중단 메시지입니다. health timeout, Nginx 문법 오류 또는 reload 오류가 나오면 배포 실패입니다.

### 상태와 로그 확인

```bash
docker compose ps
docker compose logs --tail=200 backend-blue backend-green
docker exec nimda-nginx nginx -t
curl --fail --max-time 3 http://127.0.0.1:8081/api/cite/category
curl --fail --max-time 3 http://127.0.0.1:8082/api/cite/category
```

로그 명령은 읽기 전용입니다. `curl`은 공개 포트에 GET 요청을 보내지만 데이터를 변경하지 않습니다.

## Configuration and Secret Handling

- `.env.example`의 `CHANGE_ME`를 승인된 비밀 저장소 값으로 바꿔 운영 호스트의 `.env`에만 저장합니다.
- `BACKEND_IMAGE_TAG`는 CI가 발행한 short commit SHA여야 합니다. Compose는 값이 없으면 실패하며 `latest`로 자동 대체하지 않습니다.
- MySQL 버퍼 풀은 `MYSQL_INNODB_BUFFER_POOL_SIZE`로 조절하며 기본값은 256M입니다. 실제 메모리 예산을 측정한 뒤 변경합니다.
- 백엔드는 Redis 호스트 `redis`, 포트 6379, `REDIS_PASSWORD`를 명시적으로 주입받습니다.
- AWS, JWT, DB, Redis, SMTP 값은 GitHub Actions secret 또는 운영 비밀 저장소에서만 전달합니다.
- `.env`, 인증서 개인키, Compose 치환 출력, 컨테이너 환경 덤프를 이슈나 채팅에 붙이지 않습니다.

GitHub Actions는 모든 Pull Request에서 프론트엔드·랜딩 lint/build, production 의존성 감사와 Maven `clean verify`를 실행합니다. Docker 이미지 발행과 운영 배포는 fork나 PR에서는 실행하지 않고, `Nimda-Security/Nimda` 저장소의 `main` push가 모든 게이트를 통과한 경우에만 실행합니다. 동시 운영 배포는 `nimda-production` concurrency 그룹으로 직렬화됩니다.

## Security and Migration Rollout

- V27은 `users.auth_version INT NOT NULL DEFAULT 0`을 추가합니다. 새 애플리케이션은 이 claim이 없는 기존 JWT를 거부하므로 배포 직후 모든 브라우저 세션이 한 번 로그아웃됩니다. 승격 전에 일회성 재로그인이 필요하다고 공지합니다.
- V28은 `attachment_deletion_tasks`와 `quarantined` 상태를 추가합니다. 첨부 메타데이터 삭제 트랜잭션이 outbox 행을 함께 커밋하고, 예약 worker가 실행당 최대 50개를 삭제하며 지수 backoff로 10회까지 재시도합니다. 물리 삭제는 사용자·namespace가 일치하는 canonical active key만 자동 등록합니다. legacy key는 격리 행으로 남고 worker query와 실행 단계에서 모두 제외됩니다. 10회 실패 또는 격리된 행은 자동 삭제하지 말고 운영자가 소유권을 조사합니다.
- V29는 `email_hide`의 기존 `NULL/FALSE` 값을 먼저 `TRUE`로 정리한 뒤 `NOT NULL DEFAULT TRUE`를 적용합니다. 기존 공개 선택도 비공개로 바뀌므로 배포 공지와 운영 DB 백업이 필요합니다.
- V30은 `users.password_reset_token_id`, 불변 법적 문서 slug, 대소문자를 구분하는 삭제 작업 `storage_key`와 unique 제약을 추가합니다. 첫 영구 DDL 전에 ID 5~8의 제목이 네 법적 문서와 정확히 일치하는지, 모든 기존 삭제 키가 512자 이하인지 `NOT NULL` 사전 조건으로 검사합니다. 조건이 맞지 않으면 어떤 열도 추가하기 전에 migration이 실패합니다.
- V30은 중복 삭제 작업을 `attachment_deletion_tasks_v30_archive`에 보존하고 모두 격리한 뒤 한 행으로 정리합니다. 열·제약 추가는 `information_schema`를 확인하고 archive 적재는 `INSERT IGNORE`를 사용해 부분 적용 뒤 재시도에도 같은 결과가 나도록 설계했습니다. 그래도 MySQL DDL은 전체 트랜잭션이 아니므로 배포 전에 worker와 해당 테이블 writer를 중지하고 DB snapshot을 만들며, 실패 시 실제 스키마와 Flyway 이력을 대조한 뒤에만 승인된 `repair`와 forward-fix를 수행합니다.
- 프론트엔드 `/api` rewrite는 `https://api.nimda.kr`만 사용하고 평문 IP로 대체하지 않습니다. 유효한 인증서와 443 응답이 준비되지 않았다면 프론트엔드 배포를 중단합니다.
- S3 bucket은 비공개와 Block Public Access를 유지합니다. 브라우저 PUT CORS는 `https://nimda.kr`, `https://www.nimda.kr` 및 승인된 로컬 3000 origin만 허용하고, API의 exact-origin 목록과 함께 변경합니다.
- S3 lifecycle은 정확히 `pending/` prefix만 짧은 보존 기간(권장 24시간) 뒤 만료시킵니다. 검증 완료 객체는 `users/<userId>/active/`로 이동하므로 `users/` 또는 bucket 전체에 이 규칙을 적용하면 안 됩니다.
- API의 안전하지 않은 요청은 exact origin과 `Sec-Fetch-Site`를 검사합니다. 프록시가 브라우저의 `Origin` 또는 `Sec-Fetch-Site`를 임의로 덮어쓰거나 제거하지 않도록 합니다.


### V29/V30 사전 점검

운영 DB 복제본과 유지보수 창에서 먼저 실행합니다. 결과에는 사용자 이메일 설정과 저장소 key가 포함될 수 있으므로 공개 로그에 남기지 않습니다.

```sql
SELECT VERSION() AS mysql_version, @@SESSION.sql_mode AS sql_mode;

SELECT COUNT(*) AS null_email_hide
FROM users
WHERE email_hide IS NULL;

SELECT id, title
FROM board
WHERE id IN (5, 6, 7, 8)
ORDER BY id;

SELECT storage_key, COUNT(*) AS duplicate_count
FROM attachment_deletion_tasks
GROUP BY storage_key
HAVING COUNT(*) > 1;

SELECT COUNT(*) AS overlength_deletion_keys
FROM attachment_deletion_tasks
WHERE CHAR_LENGTH(storage_key) > 512;

SHOW FULL COLUMNS
FROM attachment_deletion_tasks
LIKE 'storage_key';
```

기대값은 MySQL 8.0.19 이상, SQL mode에 `STRICT_TRANS_TABLES` 또는 `STRICT_ALL_TABLES` 포함, `null_email_hide`를 파악해 백업하는 것, 네 ID와 제목이 각각 서비스 이용약관·개인정보보호정책·청소년보호정책·사이트 이용규칙인 것, `overlength_deletion_keys = 0`, 중복 행을 별도 보존한 것, 최종 `storage_key` collation이 `utf8mb4_bin`인 것입니다. 사전 조건이 맞지 않으면 V30을 억지로 통과시키지 말고 데이터를 별도 격리한 뒤 다시 점검합니다.

## Performance Budgets and Measurement Protocol

Nginx는 자동 worker 수, upstream keepalive 32개, 일반 요청의 조건부 Upgrade 헤더, gzip, `sendfile`, TCP 최적화를 사용합니다. 요청 본문은 백엔드와 같은 10MiB로 제한하고 `/api/alarm/subscribe`만 SSE 버퍼링을 끄며 24시간 read timeout을 사용합니다. 일반 요청에 `Connection: upgrade`를 강제하지 않습니다.

배포 승인 게이트:

| 지표 | 기준 |
| --- | ---: |
| 직접 upstream 대비 프록시 p95 추가 지연 | 20ms 이하 |
| 직접 upstream 대비 프록시 p99 추가 지연 | 50ms 이하 |
| 프록시 처리량 | 직접 upstream의 95% 이상 |
| 프록시 추가 오류율 | 0.1%p 이하 |
| 일반 읽기 API p95 | 300ms 이하 |
| HTTP 오류율 | 0.5% 미만 |

동일 데이터·자원·동시성으로 직접 포트와 HTTPS 프록시를 번갈아 측정합니다. 워밍업 2회 후 최소 5회 측정하며 median, p95, p99, 처리량, 499/502/503/504, CPU, 메모리, DB pool을 보존합니다. 운영 환경에서 승인 없이 부하 테스트하지 않습니다.

## Verification and Expected Results

배포 전 CI 또는 격리 호스트에서 다음을 실행합니다.

```bash
# 저장소 루트: Compose 문법과 필수 환경 변수
BACKEND_IMAGE_TAG=<커밋-SHA> docker compose config --quiet

# 실행 중인 Nginx 설정
docker exec nimda-nginx nginx -t

# HTTPS 강제와 Nginx 자체 상태
curl -I http://api.nimda.kr/
curl --fail https://api.nimda.kr/nginx-health
curl --fail https://api.nimda.kr/api/cite/category
curl --fail https://api.nimda.kr/api/cite/board/legal/terms

# 앱 준비 상태
curl --fail http://127.0.0.1:8081/api/cite/category
curl --fail http://127.0.0.1:8082/api/cite/category

# 미인증 보호 경로: 401 또는 403이어야 함
curl -i https://api.nimda.kr/api/cite/category/all
curl -i https://api.nimda.kr/api/cite/attachments/999999999/download-url
curl -i https://api.nimda.kr/api/actuator

# 신뢰하지 않는 브라우저 origin의 상태 변경: 인증 처리 전에 403이어야 함
curl -i -X POST https://api.nimda.kr/api/auth/login \
  -H 'Origin: https://untrusted.invalid' \
  -H 'Content-Type: application/json' \
  --data '{}'
```

예상 결과:

- HTTP 일반 요청은 같은 host의 HTTPS로 301 이동합니다.
- `/nginx-health`는 `ok`와 200을 반환합니다.
- 활성 백엔드와 준비된 대기 백엔드는 카테고리 JSON과 2xx를 반환합니다.
- `nginx -t`는 `syntax is ok`와 `test is successful`을 출력합니다.
- 실패한 대기 서버는 upstream으로 승격되지 않습니다.
- 미인증 관리자 카테고리, 첨부 signed URL, 일반 Actuator 요청은 401/403이고 내부 오류나 객체 존재 여부를 노출하지 않습니다.
- 신뢰하지 않는 origin의 POST는 403이고 `Access-Control-Allow-Origin` 또는 credential 허용 헤더를 반환하지 않습니다.
- 네 법적 안내 slug는 비로그인 상태에서 200과 올바른 제목을 반환하고, 같은 문서의 숫자 게시글 주소와 임의 legal slug는 공개되지 않습니다.
- 로그인 후 로그아웃한 과거 쿠키, 이미 소비한 비밀번호 복구 요청, 다른 복구 요청에서 발급된 메일 코드는 모두 거부되어야 합니다. 가입 여부와 관계없이 메일 요청은 같은 200 응답을 즉시 반환하고 실제 SMTP 처리는 비동기 worker에서 수행됩니다. 실제 토큰·코드는 로그나 이슈에 남기지 않습니다.
- 인증된 첨부 다운로드는 ACTIVE 게시글과 카르텔 권한을 통과한 경우에만 짧은 signed URL을 반환합니다.
- 배포 후 `attachment_deletion_tasks`의 대기·실패·`quarantined=true` 수, worker 재시도와 `Quarantining untrusted legacy S3 deletion` 경고를 관찰합니다. 512자를 넘는 키는 메타데이터 삭제까지 함께 중단하므로 해당 오류를 발견하면 먼저 key의 출처와 소유권을 조사합니다. 격리 객체는 소유권을 별도로 확인하기 전 행이나 객체를 수동 삭제하지 않습니다.
- `pending/` lifecycle은 pending key만 만료시키며 `users/<userId>/active/` 객체는 유지합니다.
- 직접 S3 업로드는 서버가 canonical 활성 key를 먼저 할당하고 롤백 보상 콜백을 등록한 뒤 PUT합니다. DB 롤백 후 물리 삭제까지 실패하면 `REQUIRES_NEW` 삭제 작업이 독립 커밋되어 재시도됩니다.

연결 유지 또는 무중단을 주장하려면 전환 중 지속 트래픽 시험에서 실패 요청 0건, 장기 SSE·업로드·다운로드 완료, 이전 연결 드레이닝, 되돌리기 성공을 별도로 증명해야 합니다.

## Audit Artifacts and Commit Hygiene

- `.gjc/`, `.insane-review/`, `audit-assets/`, `load-tests/results/`, 로그, 인증서, `.env`, 이미지 tar, Nginx 덤프를 Git에 넣지 않습니다. GPT-5.6 Pro 코드 리뷰 pack과 응답은 로컬 감사 자료로만 보관합니다.
- CI 산출물과 부하 결과는 접근 제어된 외부 저장소에 보존하고 커밋에는 체크섬·요약만 기록합니다.
- 배포 전 실제 이미지 digest와 SHA 태그 대응, 변경된 `docker-compose.yml`, `nginx/nginx.conf`, `deploy.sh`가 운영 호스트에 함께 전달됐는지 확인합니다.
- `docker image prune -af`를 자동 배포에 사용하지 않습니다. 검증된 롤백 이미지를 보존 정책에 따라 유지합니다.

## Limitations, Rollback, and Last Verified Date

현재 스크립트는 전환 직후 이전 컨테이너를 중단하므로 장기 진행 중 요청의 명시적 드레이닝을 보장하지 않습니다. 따라서 이 문서는 Blue/Green 검증 전환으로 표현하며 “완전 무중단”이라고 부르지 않습니다.

전환 전 실패는 자동으로 승격을 중단합니다. 전환 후 되돌리기는 다음처럼 이전에 검증된 불변 태그를 사용합니다.

```bash
# 현재 활성 색상 반대편에 이전 이미지를 기동·검증하고 다시 전환
BACKEND_IMAGE_TAG=<이전-검증-SHA> ./deploy.sh
```

이 방식은 `rollback` 하위 명령이 아니라 새 검증 배포입니다. V27~V30은 스키마와 일부 기존 데이터를 바꾸며 MySQL DDL 전체가 하나의 트랜잭션으로 자동 복구된다고 가정할 수 없습니다. V29의 이전 공개 설정과 V30의 중복 작업은 사전 snapshot 및 archive를 기준으로 forward-fix 합니다. 애플리케이션 이미지를 되돌리기 전에 이전 앱이 추가 스키마를 허용하는지 검증하고, 데이터베이스 복구는 별도 승인된 계획으로 수행합니다.

이 Windows 검증 환경에는 Docker와 k6가 없어 Compose 실행, Nginx 문법 검사, 실제 전환·드레이닝·프록시 성능 시험은 수행하지 않았습니다. 정적 설정 검토와 공개 readiness 경로의 운영 200 응답만 확인했습니다.

마지막 검증: 2026-07-11, Windows 11 x64, PR #133 후속 변경 집합. 커뮤니티·랜딩 품질 게이트와 백엔드 114개 테스트를 통과했고, GPT-5.6 Sol Pro 재검토에서 첨부 트랜잭션·S3 응답 유실 보상 경로가 `RELEASE: APPROVE` 판정을 받았습니다. 운영 배포 전 Linux CI/호스트에서 MySQL 8.0.19+ strict mode, V30 복제본 migration, Docker·Nginx·TLS·k6 게이트를 추가로 통과해야 합니다.
