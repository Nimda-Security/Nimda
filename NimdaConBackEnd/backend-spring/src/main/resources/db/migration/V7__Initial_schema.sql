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

-- Point Details 테이블 (포인트 적립 및 개별 만료 관리)
CREATE TABLE IF NOT EXISTS point_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount BIGINT NOT NULL,                -- 적립/차감된 원천 금액
    remaining_amount BIGINT NOT NULL,      -- 해당 적립분 중 남은 금액 (만료 처리에 필요)
    created_at DATETIME NOT NULL,          -- 생성 일시
    expired_at DATETIME,                   -- 포인트 만료 예정 일시
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Point History 테이블 (포인트 변동 상세 로그)
CREATE TABLE IF NOT EXISTS point_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    point_detail_id BIGINT NOT NULL,       -- 어떤 포인트 내역에 대한 변동인지 참조
    FOREIGN KEY (point_detail_id) REFERENCES point_details(id) ON DELETE CASCADE
);

-- User Balance 테이블 (사용자별 현재 총 잔액 - 1:1 관계)
CREATE TABLE IF NOT EXISTS user_balance (
    user_id BIGINT PRIMARY KEY,            -- Users 테이블의 ID를 PK이자 FK로 사용 (MapsId 반영)
    total_amount BIGINT NOT NULL DEFAULT 0, -- 사용 가능한 총 포인트 잔액
    updated_at DATETIME NOT NULL,          -- 마지막 잔액 갱신 시간
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 추가 (조회 성능 최적화)
CREATE INDEX idx_point_details_user_id ON point_details(user_id);
CREATE INDEX idx_point_details_expired_at ON point_details(expired_at);
CREATE INDEX idx_point_history_detail_id ON point_history(point_detail_id);
CREATE INDEX idx_attendance_log_user_date ON attendance_log(user_id, attendance_date);
CREATE INDEX idx_notification_recipient ON notification(recipient_id);
CREATE INDEX idx_notification_expired_at ON notification(expired_at);
CREATE INDEX idx_point_details_user_id ON point_details(user_id);