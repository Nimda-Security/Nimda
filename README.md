# NimdaPage
Nimda Security Web Page Team Project 

## BackEnd API 
### 채점 관련 API

`GET /api/judge/submissions`  - 코드 제출 목록 조회 

### 유저 관련 API 

`GET /api/auth/register` - 회원가입 API 

erDiagram
    %% --- 1. 사용자 / 권한 ---
    USERS {
        BIGINT user_id PK "사용자 ID"
        VARCHAR username "사용자명 (Unique)"
        VARCHAR password "비밀번호"
        VARCHAR email "이메일 (Unique)"
    }
    AUTHORITY {
        VARCHAR authority_name PK "권한명"
    }
    USER_AUTHORITIES {
        BIGINT user_id PK,FK "사용자 ID"
        VARCHAR authority_name PK,FK "권한명"
    }

    %% --- 2. 스터디 그룹 ---
    STUDY_GROUPS {
        BIGINT group_id PK "그룹 ID"
        VARCHAR name "그룹명"
        TEXT goal "그룹 목표"
        INT max_members "최대 인원"
        VARCHAR participation_code "참여 코드"
        BIGINT owner_user_id FK "그룹장 아이디"
    }
    GROUP_MEMBERSHIPS {
        BIGINT user_id PK,FK "사용자 ID"
        BIGINT group_id PK,FK "그룹 ID"
    }

    %% --- 3. 문제 / 채점 ---
    PROBLEMS {
        BIGINT problem_id PK "문제 ID"
        VARCHAR title "제목"
        TEXT description "설명"
        INT points "점수"
        INT time_limit "시간제한"
        INT memory_limit "메모리 제한"
        VARCHAR language "프로그래밍 언어"
        TIMESTAMP created_at "생성일시"
        TIMESTAMP updated_at "수정일시"
    }
    TEST_CASES {
        BIGINT testcase_id PK "테스트케이스 ID"
        BIGINT problem_id FK "문제 ID"
        TEXT input "입력 데이터"
        TEXT output "예상 출력"
        TIMESTAMP created_at "생성일시"
        TIMESTAMP updated_at "수정일시"
    }
    SUBMISSIONS {
        BIGINT submission_id PK "제출 ID"
        BIGINT user_id FK "사용자 ID"
        BIGINT problem_id FK "문제 ID"
        TEXT code "소스코드"
        VARCHAR language "프로그래밍 언어"
        VARCHAR status "채점 상태"
        TIMESTAMP submitted_at "제출 일시"
    }
    JUDGE_RESULTS {
        BIGINT judge_result_id PK "채점결과 ID"
        BIGINT submission_id FK,Unique "제출 ID"
        VARCHAR status "채점 상태"
        VARCHAR message "메시지"
        TEXT output "출력 결과"
        TEXT error_output "에러 출력"
        BIGINT execution_time "실행 시간"
        BIGINT memory_usage "메모리 사용량"
        INT score "획득 점수"
        TIMESTAMP judged_at "채점 완료 시간"
    }

    %% --- 4. 커뮤니케이션 ---
    COMMENTS {
        BIGINT comment_id PK "댓글 ID"
        BIGINT user_id FK "작성자 ID"
        BIGINT problem_id FK,Nullable "문제 ID"
        BIGINT submission_id FK,Nullable "제출 ID"
        TEXT content "댓글 내용"
        VARCHAR type "타입"
        TIMESTAMP created_at "생성 일자"
        TIMESTAMP updated_at "수정 일자"
    }


    %% --- 관계 정의 ---
    USERS ||--|{ USER_AUTHORITIES : "권한 보유 (N:M)"
    AUTHORITY ||--|{ USER_AUTHORITIES : "권한 부여 (N:M)"

    USERS ||--o{ STUDY_GROUPS : "그룹장 (1:N)"
    USERS ||--|{ GROUP_MEMBERSHIPS : "그룹 가입 (N:M)"
    STUDY_GROUPS ||--|{ GROUP_MEMBERSHIPS : "멤버 보유 (N:M)"

    USERS ||--o{ SUBMISSIONS : "제출 (1:N)"
    PROBLEMS ||--o{ SUBMISSIONS : "제출됨 (1:N)"
    PROBLEMS ||--o{ TEST_CASES : "포함 (1:N)"
    SUBMISSIONS ||--|| JUDGE_RESULTS : "결과 (1:1)"

    USERS ||--o{ COMMENTS : "작성 (1:N)"
    PROBLEMS |o--o{ COMMENTS : "댓글 (1:N)"
    SUBMISSIONS |o--o{ COMMENTS : "코드리뷰 (1:N)"
