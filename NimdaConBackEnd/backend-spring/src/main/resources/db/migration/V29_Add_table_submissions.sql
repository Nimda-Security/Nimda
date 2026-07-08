CREATE TABLE submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    problem_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    language VARCHAR(20) NOT NULL,
    source_code TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    execution_time_ms INT NULL,
    used_memory_kb INT NULL,
    created_at DATETIME(6) NOT NULL,

    INDEX idx_submissions_user_id (user_id),
    INDEX idx_submissions_problem_id (problem_id)
);