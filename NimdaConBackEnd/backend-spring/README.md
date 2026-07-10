# NIMDA Spring Boot Backend

Java 17, Spring Boot 3.2, Spring Security, JPA, MySQL 8, Redis, Flyway로 구성된 NIMDA API 서버입니다.

## Requirements

- Java 17
- Maven Wrapper(저장소 포함)
- 로컬 실행 시 MySQL 8과 Redis 7 또는 승인된 테스트 컨테이너

## Commands

이 디렉터리에서 실행합니다.

```bash
# Linux/macOS
./mvnw -B clean verify
./mvnw spring-boot:run

# Windows
mvnw.cmd -B clean verify
mvnw.cmd spring-boot:run
```

테스트는 `application-test.yml`과 H2를 사용하며 실제 MySQL·Redis 자격 증명이 필요하지 않습니다. 성공 신호는 Maven `BUILD SUCCESS`입니다.

## Configuration

설정은 환경변수로 주입합니다. 주요 변수는 다음과 같습니다.

- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
- `SPRING_REDIS_HOST`, `SPRING_REDIS_PORT`, `SPRING_REDIS_PASSWORD`
- `JWT_SECRET`
- `AWS_S3_BUCKET`, `AWS_S3_REGION`, `AWS_S3_ACCESS_KEY`, `AWS_S3_SECRET_KEY`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`

기본 계정이나 운영 비밀번호는 소스·문서에 두지 않습니다. 루트 `.env.example`은 이름과 안전한 placeholder만 제공합니다.

## Security and Storage Invariants

- JWT는 사용자별 `authVersion`과 승인 상태를 매 요청 확인합니다. 로그아웃, 비밀번호 변경, 승인 상태·권한 변경은 버전을 증가시키며 V27 이전 토큰은 재로그인이 필요합니다.
- 인증 필터는 서명·만료를 검증하면서 필요한 claim을 요청당 한 번만 파싱하고, 변경 가능한 닉네임 대신 불변 사용자 ID를 세션 identity로 사용합니다.
- 브라우저 상태 변경 요청은 exact origin과 `Sec-Fetch-Site`를 검사합니다. 관리자 category/Actuator와 첨부 signed URL은 구체적인 인증 규칙이 공개 읽기 규칙보다 먼저 적용됩니다.
- 게시글·댓글·첨부는 `ACTIVE` 상태, 작성자/관리자 권한과 카르텔 역할을 함께 검사합니다. 접근할 수 없는 게시글 상세는 동일한 404 계약을 사용합니다.
- Presigned PUT은 인증 사용자, 용도와 1~10 MiB의 정확한 크기에 묶입니다. 서버가 `pending/users/<userId>/<purpose>/` 객체의 소유권·크기·이미지 픽셀 수를 검증한 뒤 `users/<userId>/active/`로 이동합니다.
- V28 outbox가 메타데이터 삭제와 물리 저장소 삭제를 분리합니다. worker는 bounded batch와 backoff를 사용하며 exhausted task를 보존합니다. 자동 물리 삭제는 사용자와 namespace가 일치하는 canonical active key만 허용하고 legacy S3 key는 운영 검토 대상으로 남깁니다.
- 운영 S3는 비공개로 유지하고 exact `pending/` prefix에만 lifecycle 만료를 설정합니다.

## Performance Invariants

- 게시글 목록의 좋아요·댓글·사용자 좋아요 상태는 페이지당 2~3개의 batch query로 조회합니다.
- 상세 조회수는 ACTIVE 게시글에만 원자 UPDATE 한 번으로 증가합니다. 수정·삭제·권한 거부 요청은 조회수를 증가시키지 않습니다.
- Redis repository 탐색은 끄고 RedisTemplate만 사용합니다.
- SQL/binder DEBUG·TRACE 로그는 운영 기본값에서 비활성화합니다.
- 일반 읽기 API p95 목표는 300ms, 쓰기 p95 목표는 500ms, 오류율 목표는 0.5% 미만입니다.

## Container

`Dockerfile`은 digest로 고정된 Java 17 JRE base, 비-root 사용자, Compose healthcheck용 curl, 내부 포트 8080을 사용합니다. 이미지는 CI가 만든 불변 commit SHA 태그로 배포합니다. 자세한 절차는 루트 `DEPLOYMENT.md`를 참조하십시오.

마지막 로컬 검증: 2026-07-10, Temurin Java 17.0.19, `mvnw.cmd -B clean verify` 통과(58 tests, 실패·오류·skip 0).
