# Nimda Contest Platform - ERD (Entity Relationship Diagram)

## 📊 데이터베이스 ERD

이 문서는 Nimda Contest Platform의 데이터베이스 엔티티 관계도를 제공합니다.

---

## 🔗 Mermaid ERD 다이어그램

> **💡 참고**: Mermaid 다이어그램이 IDE에서 보이지 않을 경우, 다음 방법으로 확인하세요:
> - [Mermaid Live Editor](https://mermaid.live/)에 코드를 복사하여 붙여넣기
> - GitHub/GitLab에 업로드하면 자동으로 렌더링됩니다
> - VS Code의 "Markdown Preview Mermaid Support" 확장 설치

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

---

## 📋 엔티티 상세 정보

### 1. User (사용자) - `users` 테이블

**주요 컬럼:**
- `id` (PK): 사용자 고유 ID
- `userId` (UK): 로그인 ID (고유, 3-20자)
- `nickname` (UK): 표시명 (고유, 3-20자)
- `password`: 비밀번호 (암호화 저장)
- `email` (UK): 이메일 주소 (고유)
- `universityName`: 대학명
- `department`: 학과
- `grade`: 학년

**관계:**
- 1:N → GroupMembership
- 1:N → Submission
- 1:N → Contest (created_by)
- 1:N → StudyGroup (created_by)
- N:M → Authority (user_authorities 중간 테이블)

---

### 2. Authority (권한) - `authority` 테이블

**주요 컬럼:**
- `authority_name` (PK): 권한명 (예: ROLE_USER, ROLE_ADMIN)

**관계:**
- N:M → User (user_authorities 중간 테이블)

---

### 3. Problem (문제) - `problems` 테이블

**주요 컬럼:**
- `id` (PK): 문제 고유 ID
- `title`: 문제 제목 (최대 200자)
- `description`: 문제 설명 (TEXT)
- `inputFormat`: 입력 형식 (TEXT)
- `outputFormat`: 출력 형식 (TEXT)
- `points`: 점수 (기본값 100)
- `timeLimit`: 시간 제한 (밀리초, 기본값 5000ms)
- `memoryLimit`: 메모리 제한 (KB, 기본값 256MB)
- `difficulty`: 난이도 (EASY, MEDIUM, HARD)
- `language`: 지원 언어
- `createdAt`, `updatedAt`: 생성/수정 시간

**관계:**
- 1:N → TestCase
- 1:N → Submission
- 1:N → ContestProblem

---

### 4. TestCase (테스트 케이스) - `test_cases` 테이블

**주요 컬럼:**
- `id` (PK): 테스트 케이스 고유 ID
- `problem_id` (FK): 문제 ID
- `input`: 입력 데이터 (TEXT)
- `output`: 예상 출력 (TEXT)
- `isPublic`: 공개 여부 (기본값 false)
- `createdAt`, `updatedAt`: 생성/수정 시간

**관계:**
- N:1 → Problem

---

### 5. Submission (제출) - `submissions` 테이블

**주요 컬럼:**
- `id` (PK): 제출 고유 ID
- `user_id` (FK): 제출자 ID
- `problem_id` (FK): 문제 ID
- `code`: 제출한 소스코드 (TEXT)
- `language`: 프로그래밍 언어 (JAVA, CPP17, PYTHON, C99)
- `status`: 채점 상태 (PENDING, JUDGING, ACCEPTED, WRONG_ANSWER, ...)
- `submittedAt`: 제출 시간

**관계:**
- N:1 → User
- N:1 → Problem
- 1:1 → JudgeResult

---

### 6. JudgeResult (채점 결과) - `judge_results` 테이블

**주요 컬럼:**
- `id` (PK): 채점 결과 고유 ID
- `submission_id` (FK, UK): 제출 ID (고유)
- `status`: 채점 결과 상태
- `message`: 채점 메시지
- `output`: 프로그램 출력 결과 (TEXT)
- `errorOutput`: 에러 출력 (TEXT)
- `executionTime`: 실행 시간 (밀리초)
- `memoryUsage`: 메모리 사용량 (바이트)
- `score`: 획득 점수
- `judgedAt`: 채점 완료 시간

**관계:**
- 1:1 → Submission

---

### 7. Contest (대회) - `contest` 테이블

**주요 컬럼:**
- `contest_id` (PK): 대회 고유 ID
- `title`: 대회 제목 (최대 200자)
- `description`: 대회 설명 (TEXT)
- `startTime`: 대회 시작 시간
- `endTime`: 대회 종료 시간
- `status`: 대회 상태 (UPCOMING, RUNNING, ENDED)
- `created_by` (FK): 생성자 ID
- `createdAt`, `updatedAt`: 생성/수정 시간

**관계:**
- N:1 → User (created_by)
- 1:N → ContestProblem
- 1:N → ContestParticipant

---

### 8. ContestProblem (대회-문제 연결) - `contest_problem` 테이블

**주요 컬럼:**
- `contest_problem_id` (PK): 연결 고유 ID
- `contest_id` (FK): 대회 ID
- `problem_id` (FK): 문제 ID
- `score`: 대회별 문제 점수 (선택)
- `problemAlias`: 대회 내 문제 별칭

**제약조건:**
- UNIQUE (contest_id, problem_id): 한 대회에 같은 문제 중복 불가

**관계:**
- N:1 → Contest
- N:1 → Problem

---

### 9. ContestParticipant (대회 참가자) - `contest_participant` 테이블

**주요 컬럼:**
- `participant_id` (PK): 참가 기록 고유 ID
- `contest_id` (FK): 대회 ID
- `team_id` (FK): 팀 ID (StudyGroup)
- `registeredAt`: 참가 등록 시간

**제약조건:**
- UNIQUE (contest_id, team_id): 한 대회에 같은 팀 중복 참가 불가

**관계:**
- N:1 → Contest
- N:1 → StudyGroup (team)

---

### 10. StudyGroup (스터디 그룹) - `study_groups` 테이블

**주요 컬럼:**
- `group_id` (PK): 그룹 고유 ID
- `groupName`: 그룹명 (최대 100자)
- `maxMembers`: 최대 멤버 수
- `participationCode` (UK): 초대 코드 (고유)
- `isPublic`: 공개 여부
- `created_by` (FK): 생성자 ID
- `createdAt`, `updatedAt`: 생성/수정 시간

**관계:**
- N:1 → User (created_by)
- 1:N → GroupMembership
- 1:N → ContestParticipant (team)

---

### 11. GroupMembership (그룹 멤버십) - `group_memberships` 테이블

**주요 컬럼:**
- `membership_id` (PK): 멤버십 고유 ID
- `user_id` (FK): 사용자 ID
- `group_id` (FK): 그룹 ID
- `role`: 역할 (MEMBER, ADMIN)
- `joinedAt`: 가입 시간
- `leftAt`: 탈퇴 시간 (null이면 활성 멤버)

**제약조건:**
- UNIQUE (user_id, group_id): 한 사용자가 같은 그룹에 중복 가입 불가

**관계:**
- N:1 → User
- N:1 → StudyGroup

---

### 12. Word (단어장) - `word` 테이블

**주요 컬럼:**
- `id` (PK): 단어 고유 ID
- `userId`: 사용자 ID (nullable, Chrome Extension용)
- `word`: 단어 (최대 100자)
- `translation`: 번역 (최대 500자)
- `pronunciation`: 발음 (최대 100자)
- `example`: 예문 (최대 1000자)
- `createdAt`, `updatedAt`: 생성/수정 시간

---

## 🔑 주요 관계 요약

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

---

## 📐 데이터베이스 설계 원칙

1. **정규화**: 3NF 이상 준수
2. **인덱스**: 주요 조회 필드에 인덱스 설정
   - User: userId, email, nickname
   - Problem: title (검색용)
   - Submission: user_id, problem_id, submittedAt
3. **외래키 제약조건**: 데이터 무결성 보장
4. **타임스탬프**: JPA Auditing으로 생성/수정 시간 자동 관리
5. **UNIQUE 제약**: 중복 방지
   - user_authorities: (user_id, authority_name)
   - contest_problem: (contest_id, problem_id)
   - contest_participant: (contest_id, team_id)
   - group_memberships: (user_id, group_id)

---

## 📝 참고사항

- **Mermaid ERD**: GitHub, GitLab, Notion 등에서 자동 렌더링 지원
- **ERD 도구**: draw.io, ERD Cloud, MySQL Workbench 등에서 시각화 가능
- **데이터베이스**: MySQL 8.0
- **ORM**: Spring Data JPA (Hibernate)

---

**작성일**: 2025년  
**프로젝트명**: Nimda Contest Platform  
**버전**: 1.0.0

