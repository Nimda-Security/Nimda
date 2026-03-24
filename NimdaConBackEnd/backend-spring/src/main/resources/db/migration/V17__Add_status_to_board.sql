-- Board 테이블에 status 컬럼 추가 (Soft Delete 지원)
-- BoardStatus enum: ACTIVE(공개), DELETED(삭제)
-- 기존 게시글은 모두 ACTIVE로 설정
ALTER TABLE board
    ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'ACTIVE';

-- 기존 데이터 명시적 보정 (DEFAULT 적용으로 이미 ACTIVE이지만 명확성을 위해)
UPDATE board SET status = 'ACTIVE' WHERE status IS NULL OR status = '';
