# Nimda Contest Platform 프로젝트 보고서 작성 가이드

## 📋 보고서 작성 요구사항

- **최소 페이지 수**: 6페이지 이상 (그 이상은 선택사항)
- **형식**: 학술 보고서 형식
- **목차**: 아래 제시된 목차를 반드시 포함

---

## 📑 보고서 목차 및 작성 가이드

### 1. 서론 (Introduction)

#### 작성 내용 제안:
- **프로젝트 배경 및 목적**
  - 프로그래밍 대회 플랫폼의 필요성
  - 기존 대회 플랫폼의 한계점
  - 본 프로젝트의 목표 및 기대 효과

- **프로젝트 개요**
  - Nimda Contest Platform 소개
  - 주요 기능 요약 (사용자 인증, 문제 관리, 코드 채점, 스코어보드 등)
  - 프로젝트 범위 및 제약사항

- **보고서 구성**
  - 각 장의 개요 설명

#### 작성 팁:
- 프로젝트의 필요성과 목적을 명확히 서술
- 전체적인 시스템 개요를 간략히 제시
- 약 1-2페이지 분량

---

### 2. 관련연구 (Related Research)

#### 작성 내용 제안:
- **기존 대회 플랫폼 분석**
  - BOJ (Baekjoon Online Judge)
  - Codeforces
  - AtCoder
  - 기타 온라인 저지 시스템

- **주요 기술 스택 연구**
  - **백엔드**: Spring Boot 프레임워크의 특징 및 장점
  - **프론트엔드**: React와 Vite의 장점
  - **인증**: JWT(JSON Web Token) 인증 방식
  - **데이터베이스**: MySQL과 JPA/Hibernate의 특징
  - **채점 시스템**: 온라인 저지 시스템의 채점 방식

- **기술 선택 이유**
  - 각 기술 스택을 선택한 이유와 장단점 분석

#### 작성 팁:
- 기존 시스템과의 차별점 강조
- 기술 선택의 근거를 명확히 제시
- 참고문헌을 적절히 인용
- 약 1-2페이지 분량

---

### 3. 시스템 설계 (System Design)

#### (1) 시스템 구조 (System Architecture)

##### 작성 내용 제안:

**전체 시스템 아키텍처**
```
┌─────────────────┐
│   Frontend      │
│  (React + Vite) │
└────────┬────────┘
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend       │
│ (Spring Boot)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ MySQL │ │ Judge │
│  DB   │ │System │
└───────┘ └───────┘
```

**계층 구조 (Layered Architecture)**
- **Presentation Layer**: React 프론트엔드
- **Controller Layer**: REST API 컨트롤러
- **Service Layer**: 비즈니스 로직
- **Repository Layer**: 데이터 접근 계층
- **Database Layer**: MySQL 데이터베이스

**주요 컴포넌트**
- 사용자 인증 모듈
- 문제 관리 모듈
- 채점 시스템 모듈
- 스코어보드 모듈
- 대회 관리 모듈

##### 작성 팁:
- 시스템 아키텍처 다이어그램 포함
- 각 계층의 역할과 책임 명시
- 컴포넌트 간 상호작용 설명

---

#### (2) 기능정의 (Functional Definition)

##### 작성 내용 제안:

**1. 사용자 관리 기능**
- 회원가입: 사용자 정보 등록 (userId, nickname, password, email, 대학 정보)
- 로그인: JWT 토큰 기반 인증
- 사용자 정보 조회 및 관리

**2. 문제 관리 기능**
- 문제 생성: 제목, 설명, 입출력 형식, 제한사항, 난이도 설정
- 문제 목록 조회: 전체 문제 목록 및 필터링
- 문제 상세 조회: 문제 내용, 테스트 케이스 정보
- 문제 수정/삭제: 관리자 권한 필요

**3. 코드 제출 및 채점 기능**
- 코드 제출: 문제 선택, 언어 선택, 소스코드 입력
- 자동 채점: 테스트 케이스 실행 및 결과 판정
- 채점 상태: PENDING, JUDGING, ACCEPTED, WRONG_ANSWER 등
- 제출 이력 조회: 사용자별, 문제별 제출 내역

**4. 대회 관리 기능**
- 대회 생성: 제목, 설명, 시작/종료 시간 설정
- 대회 참가: 팀 단위 참가 등록
- 대회 문제 관리: 대회에 문제 연결
- 대회 상태 관리: UPCOMING, RUNNING, ENDED

**5. 스코어보드 기능**
- 실시간 순위 표시
- 문제별 점수 계산
- 제출 횟수 및 정답률 통계

**6. 관리자 기능**
- 사용자 관리
- 문제 관리
- 대회 관리
- 시스템 모니터링

##### 작성 팁:
- 각 기능을 명확히 정의
- 기능 간의 연관성 설명
- 사용자 시나리오 포함 가능

---

#### (3) DB설계 (DB Design)

##### 작성 내용 제안:

**주요 엔티티 및 관계**

1. **User (사용자) - users 테이블**
   - id (PK, BIGINT, AUTO_INCREMENT)
   - userId (VARCHAR(20), UNIQUE, NOT NULL) - 로그인 ID
   - nickname (VARCHAR(20), UNIQUE, NOT NULL) - 표시명
   - password (VARCHAR(255), NOT NULL)
   - email (VARCHAR(255), UNIQUE, NOT NULL)
   - universityName (VARCHAR(100))
   - department (VARCHAR(100))
   - grade (VARCHAR(20))
   - 관계: 
     - User ↔ Authority (N:M, user_authorities 중간 테이블)
     - User ↔ GroupMembership (1:N)
     - User ↔ Submission (1:N)
     - User ↔ Contest (1:N, created_by)
     - User ↔ StudyGroup (1:N, created_by)

2. **Authority (권한) - authority 테이블**
   - authority_name (PK, VARCHAR(50))
   - 관계: User ↔ Authority (N:M)

3. **user_authorities (중간 테이블)**
   - user_id (FK → User.id)
   - authority_name (FK → Authority.authority_name)
   - 복합 키: (user_id, authority_name)

4. **Problem (문제) - problems 테이블**
   - id (PK, BIGINT, AUTO_INCREMENT)
   - title (VARCHAR(200), NOT NULL)
   - description (TEXT, NOT NULL)
   - inputFormat (TEXT)
   - outputFormat (TEXT)
   - points (INT, 기본값 100)
   - timeLimit (INT, 기본값 5000ms)
   - memoryLimit (INT, 기본값 256MB)
   - difficulty (ENUM: EASY, MEDIUM, HARD)
   - language (VARCHAR)
   - createdAt (DATETIME)
   - updatedAt (DATETIME)
   - 관계: 
     - Problem ↔ TestCase (1:N)
     - Problem ↔ Submission (1:N)
     - Problem ↔ ContestProblem (1:N)

5. **TestCase (테스트 케이스) - test_cases 테이블**
   - id (PK, BIGINT, AUTO_INCREMENT)
   - problem_id (FK → Problem.id, NOT NULL)
   - input (TEXT, NOT NULL)
   - output (TEXT, NOT NULL) - expectedOutput
   - isPublic (BOOLEAN, 기본값 false)
   - createdAt (DATETIME)
   - updatedAt (DATETIME)
   - 관계: Problem ↔ TestCase (1:N)

6. **Submission (제출) - submissions 테이블**
   - id (PK, BIGINT, AUTO_INCREMENT)
   - user_id (FK → User.id, NOT NULL)
   - problem_id (FK → Problem.id, NOT NULL)
   - code (TEXT, NOT NULL)
   - language (ENUM: JAVA, CPP17, PYTHON, C99, NOT NULL)
   - status (ENUM: PENDING, JUDGING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, RUNTIME_ERROR, COMPILATION_ERROR, SYSTEM_ERROR, NOT NULL)
   - submittedAt (DATETIME, NOT NULL)
   - 관계: 
     - User ↔ Submission (1:N)
     - Problem ↔ Submission (1:N)
     - Submission ↔ JudgeResult (1:1)

7. **JudgeResult (채점 결과) - judge_results 테이블**
   - id (PK, BIGINT, AUTO_INCREMENT)
   - submission_id (FK → Submission.id, UNIQUE, NOT NULL)
   - status (ENUM, NOT NULL)
   - message (VARCHAR(500))
   - output (TEXT)
   - errorOutput (TEXT)
   - executionTime (BIGINT) - 밀리초
   - memoryUsage (BIGINT) - 바이트
   - score (INT, 기본값 0)
   - judgedAt (DATETIME, NOT NULL)
   - 관계: Submission ↔ JudgeResult (1:1)

8. **Contest (대회) - contest 테이블**
   - contest_id (PK, BIGINT, AUTO_INCREMENT)
   - title (VARCHAR(200), NOT NULL)
   - description (TEXT, NOT NULL)
   - startTime (DATETIME, NOT NULL)
   - endTime (DATETIME, NOT NULL)
   - status (ENUM: UPCOMING, RUNNING, ENDED, NOT NULL)
   - created_by (FK → User.id, NOT NULL)
   - createdAt (DATETIME, NOT NULL)
   - updatedAt (DATETIME, NOT NULL)
   - 관계: 
     - User ↔ Contest (1:N, created_by)
     - Contest ↔ ContestProblem (1:N)
     - Contest ↔ ContestParticipant (1:N)

9. **ContestProblem (대회-문제 연결) - contest_problem 테이블**
   - contest_problem_id (PK, BIGINT, AUTO_INCREMENT)
   - contest_id (FK → Contest.contest_id, NOT NULL)
   - problem_id (FK → Problem.id, NOT NULL)
   - score (INT) - 대회별 문제 점수 (선택)
   - problemAlias (VARCHAR(50)) - 대회 내 문제 별칭
   - UNIQUE 제약: (contest_id, problem_id)
   - 관계: 
     - Contest ↔ ContestProblem (1:N)
     - Problem ↔ ContestProblem (1:N)

10. **ContestParticipant (대회 참가자) - contest_participant 테이블**
    - participant_id (PK, BIGINT, AUTO_INCREMENT)
    - contest_id (FK → Contest.contest_id, NOT NULL)
    - team_id (FK → StudyGroup.group_id, NOT NULL)
    - registeredAt (DATETIME, NOT NULL)
    - UNIQUE 제약: (contest_id, team_id)
    - 관계: 
      - Contest ↔ ContestParticipant (1:N)
      - StudyGroup ↔ ContestParticipant (1:N)

11. **StudyGroup (스터디 그룹) - study_groups 테이블**
    - group_id (PK, BIGINT, AUTO_INCREMENT)
    - groupName (VARCHAR(100), NOT NULL)
    - maxMembers (INT, NOT NULL)
    - participationCode (VARCHAR(20), UNIQUE) - 초대 코드
    - isPublic (BOOLEAN, 기본값 false)
    - created_by (FK → User.id, NOT NULL)
    - createdAt (DATETIME, NOT NULL)
    - updatedAt (DATETIME)
    - 관계: 
      - User ↔ StudyGroup (1:N, created_by)
      - StudyGroup ↔ GroupMembership (1:N)
      - StudyGroup ↔ ContestParticipant (1:N, team_id)

12. **GroupMembership (그룹 멤버십) - group_memberships 테이블**
    - membership_id (PK, BIGINT, AUTO_INCREMENT)
    - user_id (FK → User.id, NOT NULL)
    - group_id (FK → StudyGroup.group_id, NOT NULL)
    - role (ENUM: MEMBER, ADMIN, NOT NULL)
    - joinedAt (DATETIME, NOT NULL)
    - leftAt (DATETIME) - 탈퇴일 (null이면 활성 멤버)
    - UNIQUE 제약: (user_id, group_id)
    - 관계: 
      - User ↔ GroupMembership (1:N)
      - StudyGroup ↔ GroupMembership (1:N)

13. **Word (단어장) - word 테이블**
    - id (PK, BIGINT, AUTO_INCREMENT)
    - userId (VARCHAR, nullable) - Chrome Extension OAuth 미구현 고려
    - word (VARCHAR(100), NOT NULL)
    - translation (VARCHAR(500), NOT NULL)
    - pronunciation (VARCHAR(100))
    - example (VARCHAR(1000))
    - createdAt (DATETIME, NOT NULL)
    - updatedAt (DATETIME, NOT NULL)

**ERD 다이어그램**

**1. Mermaid 형식 (GitHub/GitLab에서 자동 렌더링)**

```mermaid
erDiagram
    User ||--o{ GroupMembership : "has"
    User ||--o{ Submission : "submits"
    User ||--o{ Contest : "creates"
    User ||--o{ StudyGroup : "creates"
    User }o--o{ Authority : "has"
    
    Authority ||--o{ user_authorities : "in"
    User ||--o{ user_authorities : "in"
    
    Problem ||--o{ TestCase : "has"
    Problem ||--o{ Submission : "receives"
    Problem ||--o{ ContestProblem : "in"
    
    Submission ||--|| JudgeResult : "has"
    Submission }o--|| User : "submitted_by"
    Submission }o--|| Problem : "for"
    
    Contest ||--o{ ContestProblem : "contains"
    Contest ||--o{ ContestParticipant : "has"
    Contest }o--|| User : "created_by"
    
    ContestProblem }o--|| Contest : "belongs_to"
    ContestProblem }o--|| Problem : "references"
    
    ContestParticipant }o--|| Contest : "participates_in"
    ContestParticipant }o--|| StudyGroup : "as_team"
    
    StudyGroup ||--o{ GroupMembership : "has"
    StudyGroup ||--o{ ContestParticipant : "participates_as"
    StudyGroup }o--|| User : "created_by"
    
    GroupMembership }o--|| User : "member"
    GroupMembership }o--|| StudyGroup : "belongs_to"
    
    User {
        bigint id PK
        varchar userId UK
        varchar nickname UK
        varchar password
        varchar email UK
        varchar universityName
        varchar department
        varchar grade
    }
    
    Authority {
        varchar authority_name PK
    }
    
    user_authorities {
        bigint user_id FK
        varchar authority_name FK
    }
    
    Problem {
        bigint id PK
        varchar title
        text description
        text inputFormat
        text outputFormat
        int points
        int timeLimit
        int memoryLimit
        enum difficulty
        varchar language
        datetime createdAt
        datetime updatedAt
    }
    
    TestCase {
        bigint id PK
        bigint problem_id FK
        text input
        text output
        boolean isPublic
        datetime createdAt
        datetime updatedAt
    }
    
    Submission {
        bigint id PK
        bigint user_id FK
        bigint problem_id FK
        text code
        enum language
        enum status
        datetime submittedAt
    }
    
    JudgeResult {
        bigint id PK
        bigint submission_id FK UK
        enum status
        varchar message
        text output
        text errorOutput
        bigint executionTime
        bigint memoryUsage
        int score
        datetime judgedAt
    }
    
    Contest {
        bigint contest_id PK
        varchar title
        text description
        datetime startTime
        datetime endTime
        enum status
        bigint created_by FK
        datetime createdAt
        datetime updatedAt
    }
    
    ContestProblem {
        bigint contest_problem_id PK
        bigint contest_id FK
        bigint problem_id FK
        int score
        varchar problemAlias
    }
    
    ContestParticipant {
        bigint participant_id PK
        bigint contest_id FK
        bigint team_id FK
        datetime registeredAt
    }
    
    StudyGroup {
        bigint group_id PK
        varchar groupName
        int maxMembers
        varchar participationCode UK
        boolean isPublic
        bigint created_by FK
        datetime createdAt
        datetime updatedAt
    }
    
    GroupMembership {
        bigint membership_id PK
        bigint user_id FK
        bigint group_id FK
        enum role
        datetime joinedAt
        datetime leftAt
    }
    
    Word {
        bigint id PK
        varchar userId
        varchar word
        varchar translation
        varchar pronunciation
        varchar example
        datetime createdAt
        datetime updatedAt
    }
```

**2. 텍스트 기반 관계도**

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 관리 영역                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User (사용자)                                                    │
│    ├── 1:N → GroupMembership (그룹 멤버십)                      │
│    ├── 1:N → Submission (제출 내역)                              │
│    ├── 1:N → Contest (생성한 대회)                               │
│    ├── 1:N → StudyGroup (생성한 그룹)                            │
│    └── N:M → Authority (권한) [user_authorities 중간 테이블]    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        문제 및 채점 영역                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Problem (문제)                                                   │
│    ├── 1:N → TestCase (테스트 케이스)                           │
│    ├── 1:N → Submission (제출 내역)                             │
│    └── 1:N → ContestProblem (대회-문제 연결)                     │
│                                                                   │
│  Submission (제출)                                                │
│    ├── N:1 → User (제출자)                                       │
│    ├── N:1 → Problem (문제)                                      │
│    └── 1:1 → JudgeResult (채점 결과)                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        대회 관리 영역                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Contest (대회)                                                   │
│    ├── N:1 → User (생성자, created_by)                         │
│    ├── 1:N → ContestProblem (대회 문제)                          │
│    └── 1:N → ContestParticipant (참가자)                         │
│                                                                   │
│  ContestProblem (대회-문제 연결)                                  │
│    ├── N:1 → Contest (대회)                                      │
│    └── N:1 → Problem (문제)                                     │
│                                                                   │
│  ContestParticipant (대회 참가자)                                │
│    ├── N:1 → Contest (대회)                                      │
│    └── N:1 → StudyGroup (팀)                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        그룹 관리 영역                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  StudyGroup (스터디 그룹)                                         │
│    ├── N:1 → User (생성자, created_by)                          │
│    ├── 1:N → GroupMembership (그룹 멤버)                         │
│    └── 1:N → ContestParticipant (대회 참가 팀)                   │
│                                                                   │
│  GroupMembership (그룹 멤버십)                                   │
│    ├── N:1 → User (멤버)                                         │
│    └── N:1 → StudyGroup (그룹)                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**3. 주요 관계 요약**

| 관계 유형 | 엔티티 A | 관계 | 엔티티 B | 설명 |
|---------|---------|------|---------|------|
| 1:N | User | → | Submission | 한 사용자가 여러 제출 가능 |
| 1:N | User | → | Contest | 한 사용자가 여러 대회 생성 가능 |
| 1:N | User | → | StudyGroup | 한 사용자가 여러 그룹 생성 가능 |
| 1:N | Problem | → | TestCase | 한 문제에 여러 테스트 케이스 |
| 1:N | Problem | → | Submission | 한 문제에 여러 제출 |
| 1:1 | Submission | ↔ | JudgeResult | 한 제출에 하나의 채점 결과 |
| N:M | User | ↔ | Authority | 사용자-권한 다대다 (중간 테이블) |
| N:M | Contest | ↔ | Problem | 대회-문제 다대다 (ContestProblem) |
| N:M | Contest | ↔ | StudyGroup | 대회-팀 다대다 (ContestParticipant) |
| N:M | User | ↔ | StudyGroup | 사용자-그룹 다대다 (GroupMembership) |

**데이터베이스 설계 원칙**
- 정규화: 3NF 이상 준수
- 인덱스: 주요 조회 필드에 인덱스 설정 (userId, email, nickname 등)
- 외래키 제약조건: 데이터 무결성 보장
- 타임스탬프: 생성/수정 시간 자동 관리

##### 작성 팁:
- ERD 다이어그램 포함 (draw.io, ERD Cloud 등 활용)
- 각 테이블의 주요 컬럼과 데이터 타입 명시
- 관계의 카디널리티 명확히 표시
- 인덱스 및 제약조건 설명

---

### 4. 시스템 구현 (System Implementation)

#### (1) 개발 환경 (Development Environment)

##### 작성 내용 제안:

**하드웨어 환경**
- 개발 머신 사양 (선택사항)

**소프트웨어 환경**
- **운영체제**: macOS, Linux, Windows
- **Java**: JDK 17
- **Node.js**: 18.x 이상 (권장: 20.x LTS)
- **데이터베이스**: MySQL 8.0
- **빌드 도구**: Maven 3.x, npm 9.x
- **IDE**: IntelliJ IDEA, VS Code (선택사항)

**개발 도구**
- **버전 관리**: Git
- **컨테이너**: Docker, Docker Compose
- **API 테스트**: Postman, curl (선택사항)

**프레임워크 및 라이브러리**
- **백엔드**:
  - Spring Boot 3.2.0
  - Spring Security
  - Spring Data JPA
  - JWT (jjwt 0.11.5)
  - Lombok 1.18.30
  - MySQL Connector 8.0.33

- **프론트엔드**:
  - React 19.1.1
  - TypeScript 5.8.3
  - Vite 7.1.4
  - React Router DOM 7.8.2
  - Tailwind CSS 4.1.13
  - Monaco Editor 4.7.0
  - Bootstrap 5.3.8

**배포 환경**
- **백엔드**: Docker Container (포트 80)
- **데이터베이스**: AWS RDS MySQL (ap-northeast-2)
- **프론트엔드**: Vercel 또는 정적 호스팅

##### 작성 팁:
- 버전 정보를 정확히 명시
- 개발 환경 설정 방법 간략히 설명

---

#### (2) 구현 모듈 구성도 (Implementation Module Configuration Diagram)

##### 작성 내용 제안:

**백엔드 모듈 구조**
```
com.nimda.cup/
├── config/              # 설정 클래스
│   ├── SecurityConfig   # Spring Security 설정
│   └── WebConfig        # CORS, Web 설정
├── controller/          # REST API 컨트롤러
│   ├── AppController    # 기본 엔드포인트
│   ├── AuthController   # 인증 API
│   ├── UsersController  # 사용자 API
│   ├── ProblemController # 문제 API
│   ├── JudgeController  # 채점 API
│   ├── ContestController # 대회 API
│   └── ScoreboardController # 스코어보드 API
├── service/             # 비즈니스 로직
│   ├── AuthService
│   ├── UserService
│   ├── ProblemService
│   ├── JudgeService
│   ├── ContestService
│   └── ScoreboardService
├── repository/          # 데이터 접근 계층
│   ├── UserRepository
│   ├── ProblemRepository
│   ├── SubmissionRepository
│   └── ContestRepository
├── entity/              # JPA 엔티티
│   ├── User
│   ├── Problem
│   ├── Submission
│   ├── Contest
│   └── ...
├── dto/                 # 데이터 전송 객체
│   ├── LoginDTO
│   ├── ProblemCreateDTO
│   └── ...
├── enums/               # 열거형
│   ├── Difficulty
│   ├── JudgeStatus
│   ├── Language
│   └── ContestRole
└── util/                # 유틸리티
    ├── JwtUtil
    └── TokenProvider
```

**프론트엔드 모듈 구조**
```
src/
├── api/                 # API 클라이언트
│   ├── auth.ts
│   ├── judge.ts
│   ├── problem.js
│   └── scoreboard.ts
├── components/          # 재사용 컴포넌트
│   ├── Button/
│   ├── Input/
│   ├── Form/
│   └── Layout/
├── domains/             # 도메인별 페이지
│   ├── User/
│   │   ├── Login/
│   │   └── Register/
│   ├── Contest/
│   │   ├── Home/
│   │   ├── Problem/
│   │   └── Scoreboard/
│   └── admin/
│       └── AdminDashboard
├── hooks/               # 커스텀 훅
├── utils/               # 유틸리티
│   └── jwt.ts
└── Router.tsx           # 라우팅 설정
```

**주요 모듈 설명**
- **인증 모듈**: JWT 토큰 기반 사용자 인증 처리
- **문제 관리 모듈**: 문제 CRUD 및 테스트 케이스 관리
- **채점 모듈**: 코드 제출, 컴파일, 실행, 결과 판정
- **대회 관리 모듈**: 대회 생성, 참가자 관리, 문제 연결
- **스코어보드 모듈**: 실시간 순위 및 통계 계산

##### 작성 팁:
- 패키지/디렉토리 구조를 트리 형태로 표현
- 각 모듈의 역할과 책임 명시
- 모듈 간 의존성 설명

---

#### (3) 실행화면 (Execution Screen)

##### 작성 내용 제안:

**1. 메인 화면**
- 대회 홈 화면
- 카운트다운 타이머
- 빠른 링크 (문제 목록, 스코어보드 등)

**2. 사용자 인증 화면**
- 로그인 화면
- 회원가입 화면
- 입력 폼 유효성 검증

**3. 문제 목록 화면**
- 문제 목록 테이블
- 난이도별 필터링
- 문제 검색 기능

**4. 문제 상세 화면**
- 문제 설명
- 입출력 형식
- 제한사항 표시
- 코드 에디터 (Monaco Editor)
- 제출 버튼

**5. 제출 내역 화면**
- 제출 목록 테이블
- 채점 상태 표시 (색상 코딩)
- 실행 시간, 메모리 사용량
- 코드 확인

**6. 스코어보드 화면**
- 실시간 순위표
- 문제별 정답률
- 팀별 점수 및 순위

**7. 관리자 대시보드**
- 사용자 관리
- 문제 관리
- 대회 관리

##### 작성 팁:
- 각 화면의 스크린샷 포함
- 주요 기능 설명
- UI/UX 특징 설명
- 화면 간 네비게이션 흐름 설명

---

### 5. 평가 (가능한 경우) (Evaluation)

##### 작성 내용 제안:

**성능 평가**
- API 응답 시간 측정
- 동시 접속자 처리 능력
- 데이터베이스 쿼리 성능
- 채점 시스템 처리 속도

**기능 평가**
- 요구사항 충족도
- 사용자 편의성
- 시스템 안정성
- 보안성 평가

**부하 테스트 결과** (load-tests 디렉토리 참고)
- 로그인 API 부하 테스트 결과
- 제출 API 부하 테스트 결과
- 동시 사용자 처리 능력

**사용자 피드백** (가능한 경우)
- 사용자 만족도
- 개선 사항

##### 작성 팁:
- 정량적 데이터 제시 (응답 시간, 처리량 등)
- 그래프나 표를 활용하여 시각화
- 객관적인 평가 기준 제시

---

### 6. 결론 및 향후 연구 (Conclusion and Future Work)

##### 작성 내용 제안:

**결론**
- 프로젝트 목표 달성 여부
- 주요 성과 및 기여도
- 개발 과정에서의 학습 내용
- 프로젝트의 의의

**향후 연구 및 개선 사항**
- **기능 개선**
  - 실시간 채점 결과 알림 (WebSocket)
  - 코드 에디터 기능 강화 (자동완성, 문법 하이라이팅)
  - 다국어 지원
  - 모바일 반응형 디자인 개선

- **성능 개선**
  - 채점 시스템 최적화
  - 데이터베이스 쿼리 최적화
  - 캐싱 전략 도입 (Redis)
  - CDN 활용

- **보안 강화**
  - HTTPS 적용
  - 입력 검증 강화
  - SQL Injection 방지
  - XSS 방지

- **기술 개선**
  - 마이크로서비스 아키텍처 전환 검토
  - CI/CD 파이프라인 구축
  - 자동화 테스트 추가
  - 모니터링 및 로깅 시스템 구축

##### 작성 팁:
- 구체적이고 실현 가능한 개선 방안 제시
- 우선순위를 명시하면 더 좋음

---

### 7. 참고문헌 (References)

##### 작성 내용 제안:

**공식 문서**
- Spring Boot Documentation: https://spring.io/projects/spring-boot
- React Documentation: https://react.dev/
- MySQL Documentation: https://dev.mysql.com/doc/
- JWT Specification: https://jwt.io/

**학술 논문 및 자료**
- 온라인 저지 시스템 관련 논문 (검색하여 참고)
- 프로그래밍 대회 플랫폼 관련 연구

**기술 블로그 및 튜토리얼**
- Spring Security JWT 구현 가이드
- React Best Practices
- RESTful API 설계 가이드

**참고 웹사이트**
- Baekjoon Online Judge: https://www.acmicpc.net/
- Codeforces: https://codeforces.com/
- AtCoder: https://atcoder.jp/

##### 작성 팁:
- 참고문헌 형식 통일 (예: APA, IEEE 등)
- 실제로 참고한 자료만 포함
- URL과 접근 날짜 명시

---

## 📝 보고서 작성 시 주의사항

1. **일관성**: 용어와 표기를 일관되게 사용
2. **정확성**: 기술 스택 버전, 코드 예시 등 정확한 정보 제공
3. **가독성**: 적절한 제목, 소제목, 문단 구분
4. **시각화**: 다이어그램, 표, 그래프 적극 활용
5. **객관성**: 주관적 의견보다는 객관적 사실 중심으로 서술
6. **완성도**: 오타 및 문법 오류 최소화

---

## 📂 참고 파일 위치

- **API 명세서**: `/API_SPECIFICATION.md`
- **백엔드 README**: `/NimdaConBackEnd/backend-spring/README.md`
- **프론트엔드 README**: `/NimdaConFrontEnd/README.md`
- **엔티티 파일**: `/NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cup/*/entity/`
- **부하 테스트 결과**: `/load-tests/results/`

---

## 🎯 보고서 작성 체크리스트

- [ ] 서론: 프로젝트 배경, 목적, 개요 포함
- [ ] 관련연구: 기존 시스템 분석, 기술 스택 연구
- [ ] 시스템 설계: 아키텍처, 기능 정의, DB 설계 (ERD 포함)
- [ ] 시스템 구현: 개발 환경, 모듈 구성도, 실행 화면 (스크린샷 포함)
- [ ] 평가: 성능, 기능, 부하 테스트 결과 (가능한 경우)
- [ ] 결론 및 향후 연구: 성과, 개선 사항
- [ ] 참고문헌: 적절한 형식으로 정리
- [ ] 최소 6페이지 이상 작성
- [ ] 다이어그램 및 스크린샷 포함
- [ ] 오타 및 문법 오류 검토

---

**작성일**: 2025년
**프로젝트명**: Nimda Contest Platform
**버전**: 1.0.0

