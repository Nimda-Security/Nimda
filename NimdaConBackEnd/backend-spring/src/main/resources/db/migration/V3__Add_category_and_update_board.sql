-- Category 테이블 생성
CREATE TABLE IF NOT EXISTS category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    sort_order INT NOT NULL DEFAULT 0,
    post_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES category(id) ON DELETE SET NULL
);

-- 기본 카테고리 데이터 삽입 (기존 BoardType enum 값들)
INSERT INTO category (parent_id, name, is_active, slug, sort_order, post_count, created_at, updated_at)
VALUES
    (NULL, '새 소식', TRUE, 'news', 1, 0, NOW(), NOW()),
    (NULL, '학술 게시판', TRUE, 'academic', 2, 0, NOW(), NOW()),
    (NULL, '커뮤니티', TRUE, 'community', 3, 0, NOW(), NOW()),
    (NULL, '질문과 답변', TRUE, 'qna', 4, 0, NOW(), NOW()),
    (NULL, '자유 게시판', TRUE, 'free', 5, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Board 테이블에 새로운 컬럼 추가
ALTER TABLE board
    ADD COLUMN category_id BIGINT,
    ADD COLUMN post_view INT NOT NULL DEFAULT 0,
    ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- 기존 board_type 값을 category_id로 변환
UPDATE board b
SET b.category_id = (
    SELECT c.id
    FROM category c
    WHERE c.slug = LOWER(b.board_type)
)
WHERE b.board_type IS NOT NULL;

-- category_id를 NOT NULL로 변경 (기본 카테고리 할당)
UPDATE board
SET category_id = (SELECT id FROM category WHERE slug = 'news' LIMIT 1)
WHERE category_id IS NULL;

ALTER TABLE board
    MODIFY COLUMN category_id BIGINT NOT NULL;

-- 외래키 추가
ALTER TABLE board
    ADD CONSTRAINT fk_board_category
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE RESTRICT;

-- board_type 컬럼 삭제 (선택사항: 나중에 삭제할 수도 있음)
-- ALTER TABLE board DROP COLUMN board_type;
