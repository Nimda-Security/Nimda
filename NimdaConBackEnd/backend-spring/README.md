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

## Performance Invariants

- 게시글 목록의 좋아요·댓글·사용자 좋아요 상태는 페이지당 2~3개의 batch query로 조회합니다.
- 상세 조회수는 ACTIVE 게시글에만 원자 UPDATE 한 번으로 증가합니다. 수정·삭제·권한 거부 요청은 조회수를 증가시키지 않습니다.
- Redis repository 탐색은 끄고 RedisTemplate만 사용합니다.
- SQL/binder DEBUG·TRACE 로그는 운영 기본값에서 비활성화합니다.
- 일반 읽기 API p95 목표는 300ms, 쓰기 p95 목표는 500ms, 오류율 목표는 0.5% 미만입니다.

## Container

`Dockerfile`은 digest로 고정된 Java 17 JRE base, 비-root 사용자, Compose healthcheck용 curl, 내부 포트 8080을 사용합니다. 이미지는 CI가 만든 불변 commit SHA 태그로 배포합니다. 자세한 절차는 루트 `DEPLOYMENT.md`를 참조하십시오.

마지막 로컬 검증: 2026-07-10, Temurin Java 17.0.19, `mvnw.cmd -B clean verify` 통과(8 tests).
