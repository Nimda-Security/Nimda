-- 게시글 본문(content) 길이 확장
-- 기존 TEXT(약 64KB) -> MEDIUMTEXT(최대 16MB)
ALTER TABLE board
  MODIFY COLUMN content MEDIUMTEXT NOT NULL;

