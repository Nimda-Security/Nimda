-- ============================================
-- NimdaCon 초기 스키마 생성
-- ============================================

-- Authority 테이블 (권한)
CREATE TABLE IF NOT EXISTS authority (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    authority_name VARCHAR(20) NOT NULL UNIQUE
);

-- Users 테이블 (사용자)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(10) NOT NULL,
    nickname VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    student_num VARCHAR(20) NOT NULL,
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

-- User-Authority 매핑 테이블 (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_authority (
    user_id BIGINT NOT NULL,
    authority_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, authority_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (authority_id) REFERENCES authority(id) ON DELETE CASCADE
);

-- Board 테이블 (게시판)
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Problems 테이블 (문제)
CREATE TABLE IF NOT EXISTS problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    points INT DEFAULT 100,
    time_limit INT DEFAULT 5000,
    memory_limit INT DEFAULT 262144,
    difficulty VARCHAR(20),
    language VARCHAR(50),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Test Cases 테이블 (테스트 케이스)
CREATE TABLE IF NOT EXISTS test_cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    problem_id BIGINT NOT NULL,
    input TEXT NOT NULL,
    output TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- Contest 테이블 (대회)
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
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Contest Problem 매핑 테이블
CREATE TABLE IF NOT EXISTS contest_problem (
    contest_problem_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contest_id BIGINT NOT NULL,
    problem_id BIGINT NOT NULL,
    score INT,
    problem_alias VARCHAR(50),
    UNIQUE KEY uk_contest_problem (contest_id, problem_id),
    FOREIGN KEY (contest_id) REFERENCES contest(contest_id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- Study Groups 테이블 (스터디 그룹)
CREATE TABLE IF NOT EXISTS study_groups (
    group_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    max_members INT NOT NULL,
    participation_code VARCHAR(20) UNIQUE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Group Memberships 테이블 (그룹 멤버십)
CREATE TABLE IF NOT EXISTS group_memberships (
    membership_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    joined_at DATETIME NOT NULL,
    left_at DATETIME,
    UNIQUE KEY uk_user_group (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES study_groups(group_id) ON DELETE CASCADE
);

-- Contest Participant 테이블 (대회 참가자)
CREATE TABLE IF NOT EXISTS contest_participant (
    participant_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contest_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    registered_at DATETIME NOT NULL,
    UNIQUE KEY uk_contest_team (contest_id, team_id),
    FOREIGN KEY (contest_id) REFERENCES contest(contest_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES study_groups(group_id) ON DELETE CASCADE
);

-- Submissions 테이블 (제출)
CREATE TABLE IF NOT EXISTS submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    problem_id BIGINT NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    submitted_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- Judge Results 테이블 (채점 결과)
CREATE TABLE IF NOT EXISTS judge_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL,
    message VARCHAR(500),
    output TEXT,
    error_output TEXT,
    execution_time BIGINT,
    memory_usage BIGINT,
    score INT DEFAULT 0,
    judged_at DATETIME NOT NULL,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_board_user_id ON board(user_id);
CREATE INDEX idx_board_type ON board(board_type);
CREATE INDEX idx_contest_created_by ON contest(created_by);
CREATE INDEX idx_test_cases_problem_id ON test_cases(problem_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX idx_contest_participant_contest_id ON contest_participant(contest_id);
CREATE INDEX idx_contest_participant_team_id ON contest_participant(team_id);
