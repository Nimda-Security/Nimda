CREATE TABLE tags (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id  BIGINT,
    tag_name     VARCHAR(255) NOT NULL,
    order_value  INT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- 외래키 제약 조건 (Category 테이블과 연결)
    CONSTRAINT fk_tag_category FOREIGN KEY (category_id)
        REFERENCES category (id)
        ON DELETE CASCADE
);

-- 조회 성능 최적화를 위한 인덱스 추가
-- 카테고리별로 태그를 정렬해서 가져오는 경우가 많으므로 복합 인덱스를 생성합니다.
CREATE INDEX idx_tag_category_order ON tags (category_id, order_value);