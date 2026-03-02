-- ============================================
-- attachments 테이블 생성
-- ============================================
-- 게시글 및 카테고리별 첨부파일 정보를 저장하는 테이블

CREATE TABLE IF NOT EXISTS attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    board_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    origin_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(512) NOT NULL,
    extension VARCHAR(10),
    file_size BIGINT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    -- 외래키 설정 (선택 사항: users나 board 테이블이 있다면 연결)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES board(id) ON DELETE CASCADE
);