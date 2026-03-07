-- 1. 알림(Notification) 테이블
CREATE TABLE notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_entity_id BIGINT,
    related_url VARCHAR(500),
    created_at DATETIME NOT NULL,
    expired_at DATETIME,
    updated_at DATETIME, -- BaseTimeEntity 상속 대비
    CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES users (id),
    CONSTRAINT fk_notification_sender FOREIGN KEY (sender_id) REFERENCES users (id)
);

CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_comment_id BIGINT,
    board_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    context TEXT NOT NULL,
    reply_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PUBLIC',
    created_at DATETIME, -- BaseTimeEntity
    updated_at DATETIME, -- BaseTimeEntity
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES comments (id),
    CONSTRAINT fk_comment_board FOREIGN KEY (board_id) REFERENCES board (id),
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 2. 댓글 좋아요(CommentLike) 테이블
CREATE TABLE comment_like (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    comment_id BIGINT NOT NULL,
    created_at DATETIME,
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_like_comment FOREIGN KEY (comment_id) REFERENCES comments (id),
    CONSTRAINT uk_user_comment UNIQUE (user_id, comment_id) -- 중복 좋아요 방지
);

-- 3. 포인트 상세(PointDetail) 테이블
CREATE TABLE point_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    amount BIGINT,
    remaining_amount BIGINT,
    created_at DATETIME,
    expired_at DATETIME,
    CONSTRAINT fk_point_detail_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 4. 포인트 내역(PointHistory) 테이블
CREATE TABLE point_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    point_detail_id BIGINT,
    CONSTRAINT fk_point_history_detail FOREIGN KEY (point_detail_id) REFERENCES point_details (id)
);

-- 5. 유저 잔액(UserBalance) 테이블
CREATE TABLE user_balance (
    user_id BIGINT PRIMARY KEY,
    total_amount BIGINT,
    updated_at DATETIME,
    CONSTRAINT fk_user_balance_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE attendance (
    user_id BIGINT PRIMARY KEY,
    total_count INT DEFAULT 0,
    consecutive_count INT DEFAULT 0,
    last_date DATE,
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE attendance_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    attendance_date DATETIME NOT NULL,
    CONSTRAINT fk_attendance_log_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_point_details_user_id ON point_details(user_id);
CREATE INDEX idx_point_details_expired_at ON point_details(expired_at);
CREATE INDEX idx_point_history_detail_id ON point_history(point_detail_id);
CREATE INDEX idx_attendance_log_user_date ON attendance_log(user_id, attendance_date);
CREATE INDEX idx_notification_recipient ON notification(recipient_id);
CREATE INDEX idx_notification_expired_at ON notification(expired_at);
CREATE INDEX idx_comments_board_id ON comments(board_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);