-- 1. board 테이블에서 기존 문자열 태그 컬럼 삭제
ALTER TABLE board DROP COLUMN tag;

-- 2. category 테이블에서 기존 JSON 문자열 태그 컬럼 삭제
ALTER TABLE category DROP COLUMN available_tags;