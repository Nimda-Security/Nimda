--알림 테이블 생성--
CREATE TABLE IF NOT EXISTS notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT,
    message VARCHAR(500) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    related_entity_id BIGINT,
    related_url VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    expired_at DATETIME NOT NULL,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Attendance 테이블 (사용자별 출석 통계 - 1:1 관계)
CREATE TABLE IF NOT EXISTS attendance (
    user_id BIGINT PRIMARY KEY,            -- Users 테이블의 ID를 PK이자 FK로 사용
    total_count INT NOT NULL DEFAULT 0,
    consecutive_count INT NOT NULL DEFAULT 0,
    last_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Attendance Log 테이블 (출석 상세 이력 - 1:N 관계)
CREATE TABLE IF NOT EXISTS attendance_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    attendance_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_attendance_log_user_date ON attendance_log(user_id, attendance_date);
CREATE INDEX idx_notification_recipient ON notification(recipient_id);
CREATE INDEX idx_notification_expired_at ON notification(expired_at);
CREATE INDEX idx_point_details_user_id ON point_details(user_id);