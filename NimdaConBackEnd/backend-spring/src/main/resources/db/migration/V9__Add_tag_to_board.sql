-- Board 테이블에 tag 컬럼 추가
-- 카테고리별 게시글 종류를 구분하기 위한 태그 필드
-- 예: "필독", "공지", "가입인사" 등
ALTER TABLE board
    ADD COLUMN tag VARCHAR(20) NULL;

-- 기존 게시글은 tag가 NULL이므로 별도 업데이트 불필요
-- nullable = true로 설정하여 기존 데이터와의 호환성 유지
