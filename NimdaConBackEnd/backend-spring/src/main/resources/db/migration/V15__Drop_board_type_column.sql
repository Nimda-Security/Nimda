-- V3에서 category_id로 이전한 뒤 DROP이 주석 처리되어 board_type이 남아 있었음.
-- 엔티티는 category만 사용하므로 레거시 컬럼 제거 (NOT NULL + JPA 미매핑 → INSERT 실패 방지).

ALTER TABLE board DROP COLUMN board_type;
