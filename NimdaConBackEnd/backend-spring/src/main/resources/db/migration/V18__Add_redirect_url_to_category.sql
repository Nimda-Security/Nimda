-- category 테이블에 redirect_url 컬럼 추가 (바로가기 카테고리 지원)
-- 관리자가 설정한 외부 URL로 바로 이동하는 카테고리를 위한 필드
-- NULL이면 일반 게시판 카테고리, 값이 있으면 해당 URL로 새 탭 이동
ALTER TABLE category
    ADD COLUMN redirect_url VARCHAR(500) NULL;
