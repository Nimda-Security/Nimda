# Flyway 도입 가이드

## 1. 의존성 추가

**파일**: `NimdaConBackEnd/backend-spring/pom.xml`

```xml
<!-- Flyway Database Migration -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

MySQL Connector 다음에 추가 (약 49번째 줄 이후)

---

## 2. application.yml 수정

**파일**: `NimdaConBackEnd/backend-spring/src/main/resources/application.yml`

### 2-1. JPA 설정 변경
```yaml
jpa:
  hibernate:
    ddl-auto: validate  # update → validate로 변경
```

### 2-2. Flyway 설정 추가
```yaml
flyway:
  enabled: true
  locations: classpath:db/migration
  baseline-on-migrate: true  # 기존 DB가 있을 경우
  validate-on-migrate: true
  clean-disabled: true
```

---

## 3. 마이그레이션 디렉토리 생성

**경로**: `NimdaConBackEnd/backend-spring/src/main/resources/db/migration/`

**파일 명명 규칙**: `V{버전}__{설명}.sql`
- 예: `V1__Initial_schema.sql`
- 예: `V2__Add_board_type.sql`

---

## 4. 데이터베이스 백업

### Docker 환경에서 백업
```bash
# MySQL 컨테이너에서 백업
docker exec nimda-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} nimda_con > backup_$(date +%Y%m%d_%H%M%S).sql

# 또는 볼륨 직접 접근
docker exec nimda-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} nimda_con > backup.sql
```

### 복원
```bash
# 백업 파일로 복원
docker exec -i nimda-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} nimda_con < backup.sql
```

**⚠️ 중요**: Flyway 도입 전 반드시 백업 수행

---

## 5. 마이그레이션 스크립트 작성

### 5-1. 초기 스키마 예시

**파일**: `V1__Initial_schema.sql`

```sql
-- Users 테이블
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(10) NOT NULL,
    nickname VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    student_num VARCHAR(20) NOT NULL,
    phone_num VARCHAR(20) NOT NULL,
    email VARCHAR(40) NOT NULL UNIQUE,
    university_name VARCHAR(100),
    major VARCHAR(20) NOT NULL,
    grade VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    birth VARCHAR(20),
    profile_image VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Board 테이블
CREATE TABLE IF NOT EXISTS board (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    user_id BIGINT NOT NULL,
    board_type VARCHAR(20) NOT NULL,
    filename VARCHAR(255),
    filepath VARCHAR(500),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Contest 테이블
CREATE TABLE IF NOT EXISTS contest (
    contest_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Problems 테이블
CREATE TABLE IF NOT EXISTS problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    points INT,
    time_limit INT,
    memory_limit INT,
    difficulty VARCHAR(20),
    language VARCHAR(50),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- 기타 테이블들도 동일한 방식으로 작성
```

### 5-2. 추가 마이그레이션 예시

**파일**: `V2__Add_indexes.sql`
```sql
-- 인덱스 추가
CREATE INDEX idx_board_user_id ON board(user_id);
CREATE INDEX idx_board_type ON board(board_type);
CREATE INDEX idx_contest_created_by ON contest(created_by);
```

**파일**: `V3__Add_column.sql`
```sql
-- 컬럼 추가 (기존 데이터가 있을 경우)
ALTER TABLE users ADD COLUMN new_column VARCHAR(50) DEFAULT 'default_value';
```

**주의**: 
- 기존 DB가 있다면 `baseline-on-migrate: true` 설정 필요
- NOT NULL 컬럼 추가 시 DEFAULT 값 필수

---

## 6. Docker 환경

- 추가 수정 불필요
- 마이그레이션 파일이 JAR에 포함되어 자동 실행
- 컨테이너 시작 시 Flyway가 자동으로 마이그레이션 실행

---

## 7. 실행 순서

1. `pom.xml`에 의존성 추가
2. `application.yml` 수정
3. 마이그레이션 디렉토리 생성
4. 초기 마이그레이션 파일 작성
5. 애플리케이션 실행 → Flyway 자동 실행

---

## 주의사항

- ✅ **기존 데이터 백업 필수** (4번 항목 참고)
- ✅ `ddl-auto: update` 제거 (Flyway와 충돌)
- ✅ 마이그레이션 파일은 Git으로 버전 관리
- ✅ NOT NULL 컬럼 추가 시 DEFAULT 값 필수
- ✅ 마이그레이션 파일은 한 번 실행되면 수정 불가 (새 버전 파일 생성)
