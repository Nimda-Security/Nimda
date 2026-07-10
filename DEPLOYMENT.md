# NIMDA Deployment Guide

이 문서는 현재 저장소의 Docker Compose, Nginx, GitHub Actions, Blue/Green 전환 스크립트와 일치하는 운영 절차입니다. 검증되지 않은 “완전 무중단” 또는 고정 복구 시간은 보장하지 않습니다.

## Scope and Audience

대상은 NIMDA API 운영자와 배포 리뷰어입니다. 구성 요소는 다음과 같습니다.

- `docker-compose.yml`: MySQL, Redis, blue/green Spring Boot, Nginx
- `deploy.sh`: 대기 색상 기동, 준비 상태 확인, 검증 후 트래픽 전환
- `nginx/nginx.conf`: TLS 종단, 압축, 연결 재사용, API 제한, SSE
- `.github/workflows/ci.yml`: lint/build/test, SHA 이미지 발행, 운영 호스트 배포
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

GitHub Actions는 프론트엔드·랜딩 lint/build와 Maven `clean verify`를 먼저 실행하고, 성공한 commit SHA 태그만 발행·배포합니다. 동시 배포는 `nimda-production` concurrency 그룹으로 직렬화됩니다.

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

# 앱 준비 상태
curl --fail http://127.0.0.1:8081/api/cite/category
curl --fail http://127.0.0.1:8082/api/cite/category
```

예상 결과:

- HTTP 일반 요청은 같은 host의 HTTPS로 301 이동합니다.
- `/nginx-health`는 `ok`와 200을 반환합니다.
- 활성 백엔드와 준비된 대기 백엔드는 카테고리 JSON과 2xx를 반환합니다.
- `nginx -t`는 `syntax is ok`와 `test is successful`을 출력합니다.
- 실패한 대기 서버는 upstream으로 승격되지 않습니다.

연결 유지 또는 무중단을 주장하려면 전환 중 지속 트래픽 시험에서 실패 요청 0건, 장기 SSE·업로드·다운로드 완료, 이전 연결 드레이닝, 되돌리기 성공을 별도로 증명해야 합니다.

## Audit Artifacts and Commit Hygiene

- `.gjc/`, `audit-assets/`, `load-tests/results/`, 로그, 인증서, `.env`, 이미지 tar, Nginx 덤프를 Git에 넣지 않습니다.
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

이 방식은 `rollback` 하위 명령이 아니라 새 검증 배포입니다. 데이터베이스 마이그레이션이 하위 호환되지 않으면 애플리케이션 이미지만 되돌리지 말고 별도 승인된 DB 복구 계획을 따릅니다.

이 Windows 검증 환경에는 Docker와 k6가 없어 Compose 실행, Nginx 문법 검사, 실제 전환·드레이닝·프록시 성능 시험은 수행하지 않았습니다. 정적 설정 검토와 공개 readiness 경로의 운영 200 응답만 확인했습니다.

마지막 검증: 2026-07-10, Windows 11 x64, 기준 커밋 `102801b`에서 시작한 현재 변경 집합. 운영 배포 전에 Linux CI/호스트의 Docker·Nginx·k6 게이트가 추가로 필요합니다.
