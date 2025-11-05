# Nimda Contest Platform - 백엔드 API 명세서

**프로젝트명:** Nimda Contest Platform  
**버전:** 1.0.0  
**기본 URL:** http://localhost:80  
**인증 방식:** JWT Token (Bearer)

---

## 1. 기본 API

### `GET /`
서버 상태 확인

**인증:** 필요없음

**요청:**
```
없음
```

**응답:**
```json
{
  "message": "Nimda Contest Platform API",
  "status": "running"
}
```

---

### `GET /api`
API 버전 정보

**인증:** 필요없음

**요청:**
```
없음
```

**응답:**
```json
{
  "message": "Nimda Contest Platform API",
  "version": "1.0.0"
}
```

---

## 2. 인증 API (Authentication)

### `POST /api/auth/login`
사용자 로그인 (JWT 토큰 발급)

**인증:** 필요없음

**요청:**
```json
{
  "username": "admin",
  "password": "1234"
}
```

**요청 규칙:**
- `username`: 필수, 3-20자
- `password`: 필수, 4-20자

**성공 응답 (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

**실패 응답 (401):**
```json
{
  "message": "Invalid username or password"
}
```

---

### `POST /api/auth/register`
사용자 회원가입

**인증:** 필요없음

**요청:**
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "newuser@example.com"
}
```

**요청 규칙:**
- `username`: 필수, 3-20자
- `password`: 필수, 4-20자
- `email`: 필수, 유효한 이메일 형식

**성공 응답 (201):**
```json
{
  "id": 2,
  "username": "newuser",
  "email": "newuser@example.com",
  "enabled": true,
  "authorities": [...]
}
```

**실패 응답 (400):**
```json
{
  "message": "Username already exists"
}
```

---

## 3. 사용자 API (Users)

### `GET /api/users`
모든 사용자 목록 조회

**인증:** 필요없음

**요청:**
```
없음
```

**성공 응답 (200):**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "enabled": true
    }
  ]
}
```

**실패 응답 (500):**
```json
{
  "success": false,
  "message": "사용자 목록 조회 중 오류가 발생했습니다: ..."
}
```

---

### `GET /api/users/{id}`
특정 사용자 정보 조회

**인증:** 필요없음

**요청 파라미터:**
- `id` (Long): 사용자 ID

**성공 응답 (200):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "enabled": true
}
```

**실패 응답 (404):**
```json
{
  "message": "User not found"
}
```

---

### `GET /api/users/username/{username}`
사용자명으로 사용자 조회

**인증:** 필요없음

**요청 파라미터:**
- `username` (String): 사용자명

**성공 응답 (200):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com"
}
```

**실패 응답 (404):**
```json
{
  "message": "User not found"
}
```

---

## 4. 문제 API (Problems)

### `POST /api/problems`
새 문제 생성

**인증:** 필요없음

**요청:**
```json
{
  "title": "A+B",
  "description": "두 정수 A와 B를 입력받아 A+B를 출력하시오",
  "points": 100,
  "timeLimit": 1000,
  "memoryLimit": 128,
  "difficulty": "EASY",
  "language": "Java",
  "testCases": [
    {
      "input": "1 2",
      "output": "3"
    },
    {
      "input": "5 10",
      "output": "15"
    }
  ]
}
```

**요청 규칙:**
- `title`: 필수, 최대 200자
- `description`: 필수, 최대 10000자
- `points`: 필수, 양수
- `timeLimit`: 필수, 양수 (밀리초)
- `memoryLimit`: 필수, 양수 (MB)
- `difficulty`: 필수 (EASY, MEDIUM, HARD)
- `language`: 필수
- `testCases`: List, 각 케이스에 input, output 필수

**성공 응답 (201):**
```json
{
  "success": true,
  "message": "문제가 성공적으로 생성되었습니다",
  "problem": {
    "id": 1,
    "title": "A+B",
    "description": "...",
    "points": 100,
    "timeLimit": 1000,
    "memoryLimit": 128,
    "difficulty": "EASY"
  }
}
```

**실패 응답 (500):**
```json
{
  "success": false,
  "message": "문제 생성 중 오류가 발생했습니다: ..."
}
```

---

### `GET /api/problems`
모든 문제 목록 조회

**인증:** 필요없음

**요청:**
```
없음
```

**성공 응답 (200):**
```json
{
  "success": true,
  "problems": [
    {
      "id": 1,
      "title": "A+B",
      "description": "두 정수 A와 B를 입력받아...",
      "points": 100,
      "timeLimit": 1000,
      "memoryLimit": 128,
      "difficulty": "EASY"
    }
  ]
}
```

**실패 응답 (500):**
```json
{
  "success": false,
  "message": "문제 목록 조회 중 오류가 발생했습니다: ..."
}
```

---

### `GET /api/problems/{id}`
특정 문제 상세 조회

**인증:** 필요없음

**요청 파라미터:**
- `id` (Long): 문제 ID

**성공 응답 (200):**
```json
{
  "success": true,
  "problem": {
    "id": 1,
    "title": "A+B",
    "description": "두 정수 A와 B를...",
    "points": 100,
    "testCases": [...]
  }
}
```

**실패 응답 (404):**
```json
{
  "success": false,
  "message": "Problem not found with id: 1"
}
```

---

### `DELETE /api/problems/{id}`
문제 삭제

**인증:** 필요없음

**요청 파라미터:**
- `id` (Long): 문제 ID

**성공 응답 (200):**
```json
{
  "success": true,
  "message": "문제가 성공적으로 삭제되었습니다"
}
```

**실패 응답 (404):**
```json
{
  "success": false,
  "message": "Problem not found with id: 1"
}
```

---

## 5. 채점 API (Judge)

### `POST /api/judge/submit`
코드 제출 및 채점

**인증:** 선택사항 (Bearer 토큰)

**요청 헤더:**
```
Authorization: Bearer {token} (선택사항)
```

**요청:**
```json
{
  "title": "A+B",
  "code": "import java.util.Scanner;\npublic class Solution {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n    System.out.println(a + b);\n  }\n}",
  "language": "Java",
  "problemId": 1
}
```

**요청 규칙:**
- `title`: 필수
- `code`: 필수
- `language`: 필수 (Java, C++17)
- `problemId`: Long (선택)

**성공 응답 (200):**
```json
{
  "success": true,
  "message": "채점이 완료되었습니다.",
  "submittedBy": "admin",
  "submissionId": 1,
  "result": {
    "status": "ACCEPTED",
    "message": "제출 ID: 1 - 채점 완료",
    "executionTime": 123,
    "memoryUsage": 64,
    "score": 100
  }
}
```

**실패 응답 (500):**
```json
{
  "success": false,
  "message": "채점 중 오류가 발생했습니다: ...",
  "result": {
    "status": "SYSTEM_ERROR",
    "message": "시스템 오류"
  }
}
```

**채점 상태 (JudgeStatus):**
- `PENDING`: 대기 중
- `JUDGING`: 채점 중
- `ACCEPTED`: 맞았습니다!!
- `WRONG_ANSWER`: 틀렸습니다
- `TIME_LIMIT_EXCEEDED`: 시간 초과
- `MEMORY_LIMIT_EXCEEDED`: 메모리 초과
- `RUNTIME_ERROR`: 런타임 에러
- `COMPILATION_ERROR`: 컴파일 에러
- `SYSTEM_ERROR`: 시스템 에러

---

### `GET /api/judge/submissions`
모든 제출 목록 조회

**인증:** 필요없음

**요청:**
```
없음
```

**성공 응답 (200):**
```json
{
  "success": true,
  "message": "제출 목록을 성공적으로 조회했습니다.",
  "submissions": [
    {
      "id": 1,
      "code": "import java.util.Scanner;...",
      "language": "JAVA",
      "status": "ACCEPTED",
      "submittedAt": "2024-01-01T10:00:00",
      "problemId": 1,
      "problemTitle": "A+B",
      "username": "admin",
      "executionTime": 123,
      "memoryUsage": 64,
      "score": 100
    }
  ],
  "totalCount": 1
}
```

---

### `GET /api/judge/submissions/user/{username}`
특정 사용자의 제출 목록 조회

**인증:** 필요없음

**요청 파라미터:**
- `username` (String): 사용자명

**성공 응답 (200):**
```json
{
  "success": true,
  "message": "사용자 'admin'의 제출 목록을 성공적으로 조회했습니다.",
  "submissions": [...],
  "totalCount": 5
}
```

---

### `GET /api/judge/languages`
지원하는 프로그래밍 언어 목록 조회

**인증:** 필요없음

**요청:**
```
없음
```

**성공 응답 (200):**
```json
{
  "success": true,
  "languages": ["Java", "C++17"],
  "message": "지원하는 언어 목록입니다."
}
```

---

### `GET /api/judge/status`
채점 시스템 상태 확인

**인증:** 필요없음

**요청:**
```
없음
```

**성공 응답 (200):**
```json
{
  "success": true,
  "compilers": {
    "java": true,
    "g++": true
  },
  "message": "채점 시스템이 정상 작동 중입니다."
}
```

---

### `POST /api/judge/test`
채점 시스템 테스트 (테스트용)

**인증:** 필요없음

**요청:**
```
없음
```

**성공 응답 (200):**
```json
{
  "success": true,
  "message": "테스트 채점이 완료되었습니다.",
  "result": {
    "status": "ACCEPTED",
    "message": "...",
    "executionTime": 123,
    "memoryUsage": 64,
    "score": 100
  }
}
```

---

## 6. 지원 언어 및 형식

### 프로그래밍 언어
- Java
- C++17
- Python
- C99

### 난이도 (Difficulty)
- `EASY`: 쉬움
- `MEDIUM`: 중간
- `HARD`: 어려움

---

## 7. 공통 오류 코드

| 상태 코드 | 설명 |
|---------|------|
| 200 | 요청 성공 |
| 201 | 리소스 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 404 | 리소스를 찾을 수 없음 |
| 500 | 서버 오류 |

---

## 8. CORS 설정

- **모든 엔드포인트:** CORS 허용
- **허용 메서드:** GET, POST, PUT, DELETE, OPTIONS
- **허용 헤더:** *
- **모든 Origin 허용**

---

## 9. 인증 토큰 사용 방법

로그인 후 받은 JWT 토큰을 사용하여 인증이 필요한 API 호출 시:

```
Authorization: Bearer {token}
```

**예시:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**토큰 유효기간:** 24시간 (86400초)

---

## 10. 기술 스택

- **Spring Boot:** 3.2.0
- **Spring Security:** JWT 인증
- **Spring Data JPA:** 데이터베이스 연동
- **MySQL:** 데이터베이스
- **Maven:** 빌드 도구

---

이 문서는 Nimda Contest Platform 백엔드 API의 전반적인 명세를 제공합니다.  
추가 기능 및 변경사항은 프로젝트의 버전 업데이트에 따라 수정됩니다.

