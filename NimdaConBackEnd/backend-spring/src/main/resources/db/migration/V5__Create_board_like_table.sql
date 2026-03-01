-- ============================================
-- board_like 테이블 생성
-- ============================================
-- 게시글 좋아요 정보를 저장하는 테이블
-- 한 사용자가 한 게시글에 중복 좋아요 방지를 위한 unique constraint 포함

CREATE TABLE IF NOT EXISTS board_like (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    liker_id BIGINT NOT NULL,
    board_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (liker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES board(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_liker_board (liker_id, board_id)
);
