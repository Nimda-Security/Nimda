-- Board 테이블에 tag 컬럼 추가
-- 카테고리별 게시글 종류를 구분하기 위한 태그 필드
-- 예: "필독", "공지", "가입인사" 등
ALTER TABLE board
    ADD COLUMN tag VARCHAR(20) NULL;

-- 기존 게시글은 tag가 NULL이므로 별도 업데이트 불필요
-- nullable = true로 설정하여 기존 데이터와의 호환성 유지

-- Category 테이블에 available_tags 컬럼 추가
-- 카테고리별로 사용 가능한 태그 목록을 JSON 형식으로 저장
-- 예: ["필독", "공지", "가입인사"]
ALTER TABLE category
    ADD COLUMN available_tags VARCHAR(500) NULL;

-- 기존 카테고리는 available_tags가 NULL이므로 별도 업데이트 불필요
-- nullable = true로 설정하여 기존 데이터와의 호환성 유지
