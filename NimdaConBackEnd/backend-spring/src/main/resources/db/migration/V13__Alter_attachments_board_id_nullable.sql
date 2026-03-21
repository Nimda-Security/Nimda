-- B안: presigned 업로드 후 register 시 아직 게시글이 없을 수 있음 → board_id NULL 허용
-- 기존 V6에서 board_id NOT NULL + FK → FK 제거 후 컬럼 수정, FK 재생성(이름 고정: fk_attachments_board)

SET @fk_name := (
    SELECT kcu.CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE kcu
    WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.TABLE_NAME = 'attachments'
      AND kcu.COLUMN_NAME = 'board_id'
      AND kcu.REFERENCED_TABLE_NAME = 'board'
    LIMIT 1
);

SET @drop_sql := IF(
    @fk_name IS NOT NULL,
    CONCAT('ALTER TABLE attachments DROP FOREIGN KEY `', @fk_name, '`'),
    'SELECT 1'
);
PREPARE drop_fk FROM @drop_sql;
EXECUTE drop_fk;
DEALLOCATE PREPARE drop_fk;

ALTER TABLE attachments
    MODIFY COLUMN board_id BIGINT NULL;

ALTER TABLE attachments
    ADD CONSTRAINT fk_attachments_board
        FOREIGN KEY (board_id) REFERENCES board (id) ON DELETE CASCADE;
