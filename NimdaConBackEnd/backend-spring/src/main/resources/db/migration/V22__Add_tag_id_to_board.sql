-- board 테이블에 Tag 엔티티 참조용 tag_id 컬럼 추가
ALTER TABLE board ADD COLUMN tag_id BIGINT NULL;
ALTER TABLE board ADD CONSTRAINT fk_board_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE SET NULL;
