# Nimda Contest Platform - Spring Boot Backend

## 개요
Nimda Contest Platform의 Spring Boot 기반 백엔드 애플리케이션입니다.

## 기술 스택
- **Spring Boot 3.2.0**
- **Spring Security**
- **Spring Data JPA**
- **MySQL 8.0**
- **JWT (JSON Web Token)**
- **Maven**

## 주요 기능
- 사용자 인증 (로그인/회원가입)
- JWT 기반 토큰 인증
- MySQL 데이터베이스 연동
- RESTful API

## API 엔드포인트

### 인증 (Authentication)
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

### 사용자 (Users)
- `GET /api/users/{id}` - 사용자 정보 조회
- `GET /api/users/username/{username}` - 사용자명으로 사용자 조회

### 기본
- `GET /` - 홈페이지
- `GET /api` - API 정보

## 설치 및 실행

### 1. MySQL 데이터베이스 설정
```sql
-- MySQL에 접속하여 데이터베이스 생성
CREATE DATABASE nimda_con CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 애플리케이션 설정
`src/main/resources/application.yml` 파일에서 데이터베이스 연결 정보를 수정하세요:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/nimda_con?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: your_username
    password: your_password
```

### 3. 애플리케이션 실행
```bash
# Maven을 사용한 실행
mvn spring-boot:run

# 또는 JAR 파일 빌드 후 실행
mvn clean package
java -jar target/nimda-con-0.0.1-SNAPSHOT.jar
```

## 기본 계정
- **사용자명**: admin
- **비밀번호**: 1234
- **이메일**: admin@example.com

## 프로젝트 구조
```
src/main/java/com/nimda/con/
├── config/          # 설정 클래스
├── controller/      # REST 컨트롤러
├── dto/            # 데이터 전송 객체
├── entity/         # JPA 엔티티
├── repository/     # JPA 리포지토리
├── service/        # 비즈니스 로직
└── util/           # 유틸리티 클래스
```

## 개발 환경
- Java 17
- Maven 3.6+
- MySQL 8.0+
