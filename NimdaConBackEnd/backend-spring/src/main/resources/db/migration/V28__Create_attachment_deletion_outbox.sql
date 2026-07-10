CREATE TABLE IF NOT EXISTS attachment_deletion_tasks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    storage_key VARCHAR(512) NOT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    last_error VARCHAR(1000) NULL,
    next_attempt_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT chk_attachment_deletion_attempt_count
        CHECK (attempt_count BETWEEN 0 AND 10),
    INDEX idx_attachment_deletion_pending (attempt_count, next_attempt_at, id)
);
