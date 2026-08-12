-- Fail independently of CHECK enforcement before using MySQL 8.0.19+ SQL features.
SET @v30_sql = IF(
    VERSION() NOT LIKE '%MariaDB%'
    AND (
        CAST(SUBSTRING_INDEX(VERSION(), '.', 1) AS UNSIGNED) > 8
        OR (
            CAST(SUBSTRING_INDEX(VERSION(), '.', 1) AS UNSIGNED) = 8
            AND (
                CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(VERSION(), '.', 2), '.', -1) AS UNSIGNED) > 0
                OR CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(VERSION(), '.', 3), '.', -1) AS UNSIGNED) >= 19
            )
        )
    )
    AND @@SESSION.sql_mode REGEXP '(^|,)(STRICT_TRANS_TABLES|STRICT_ALL_TABLES)(,|$)',
    'SELECT 1',
    'SELECT 1 FROM information_schema.__nimda_v30_requires_mysql_8_0_19_strict_mode__'
);
PREPARE v30_statement FROM @v30_sql;
EXECUTE v30_statement;
DEALLOCATE PREPARE v30_statement;

-- Validate immutable legal-document identities before MySQL's non-transactional DDL begins.
-- CHECK-backed sentinels fail closed after the runtime version/strict-mode gate succeeds.
CREATE TEMPORARY TABLE v30_legal_document_preflight (
    legal_documents_present TINYINT NOT NULL,
    CONSTRAINT chk_v30_legal_documents CHECK (legal_documents_present = 1)
);

INSERT INTO v30_legal_document_preflight (legal_documents_present)
SELECT CASE
    WHEN COUNT(*) = 4 THEN 1
    ELSE 0
END
FROM board
WHERE (id = 5 AND title = '서비스 이용약관')
   OR (id = 6 AND title = '개인정보보호정책')
   OR (id = 7 AND title = '청소년보호정책')
   OR (id = 8 AND title = '사이트 이용규칙');

DROP TEMPORARY TABLE v30_legal_document_preflight;

-- Refuse to narrow the outbox key before every legacy value fits without truncation.
CREATE TEMPORARY TABLE v30_deletion_key_length_preflight (
    deletion_keys_fit TINYINT NOT NULL,
    CONSTRAINT chk_v30_deletion_key_length CHECK (deletion_keys_fit = 1)
);

INSERT INTO v30_deletion_key_length_preflight (deletion_keys_fit)
SELECT CASE
    WHEN COUNT(*) = 0 THEN 1
    ELSE 0
END
FROM attachment_deletion_tasks
WHERE CHAR_LENGTH(storage_key) > 512;

DROP TEMPORARY TABLE v30_deletion_key_length_preflight;

SET @v30_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'users'
       AND column_name = 'password_reset_token_id') = 0,
    'ALTER TABLE users ADD COLUMN password_reset_token_id VARCHAR(36) NULL',
    'SELECT 1'
);
PREPARE v30_statement FROM @v30_sql;
EXECUTE v30_statement;
DEALLOCATE PREPARE v30_statement;

SET @v30_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'board'
       AND column_name = 'legal_slug') = 0,
    'ALTER TABLE board ADD COLUMN legal_slug VARCHAR(40) NULL',
    'SELECT 1'
);
PREPARE v30_statement FROM @v30_sql;
EXECUTE v30_statement;
DEALLOCATE PREPARE v30_statement;

UPDATE board
SET legal_slug = CASE id
    WHEN 5 THEN 'terms'
    WHEN 6 THEN 'privacy'
    WHEN 7 THEN 'youth-protection'
    WHEN 8 THEN 'site-rules'
END
WHERE (id = 5 AND title = '서비스 이용약관')
   OR (id = 6 AND title = '개인정보보호정책')
   OR (id = 7 AND title = '청소년보호정책')
   OR (id = 8 AND title = '사이트 이용규칙');


SET @v30_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.table_constraints
     WHERE table_schema = DATABASE()
       AND table_name = 'board'
       AND constraint_name = 'uk_board_legal_slug') = 0,
    'ALTER TABLE board ADD CONSTRAINT uk_board_legal_slug UNIQUE (legal_slug)',
    'SELECT 1'
);
PREPARE v30_statement FROM @v30_sql;
EXECUTE v30_statement;
DEALLOCATE PREPARE v30_statement;

SET @v30_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.table_constraints
     WHERE table_schema = DATABASE()
       AND table_name = 'board'
       AND constraint_name = 'chk_board_legal_slug') = 0,
    'ALTER TABLE board ADD CONSTRAINT chk_board_legal_slug CHECK (legal_slug IS NULL OR legal_slug IN (''terms'', ''privacy'', ''youth-protection'', ''site-rules''))',
    'SELECT 1'
);
PREPARE v30_statement FROM @v30_sql;
EXECUTE v30_statement;
DEALLOCATE PREPARE v30_statement;

ALTER TABLE attachment_deletion_tasks
    MODIFY COLUMN storage_key VARCHAR(512)
        CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL;

CREATE TABLE IF NOT EXISTS attachment_deletion_tasks_v30_archive
LIKE attachment_deletion_tasks;

INSERT IGNORE INTO attachment_deletion_tasks_v30_archive
SELECT task.*
FROM attachment_deletion_tasks AS task
JOIN (
    SELECT storage_key
    FROM attachment_deletion_tasks
    GROUP BY storage_key
    HAVING COUNT(*) > 1
) AS duplicate_key ON duplicate_key.storage_key = task.storage_key;

-- Existing duplicate outbox rows are conservatively quarantined before deduplication.
-- This makes quarantine dominant even for data created before the unique-key invariant.
UPDATE attachment_deletion_tasks AS task
JOIN (
    SELECT storage_key
    FROM (
        SELECT storage_key
        FROM attachment_deletion_tasks
        GROUP BY storage_key
        HAVING COUNT(*) > 1
    ) AS duplicate_keys
) AS duplicate_key ON duplicate_key.storage_key = task.storage_key
SET task.quarantined = TRUE,
    task.last_error = 'Duplicate deletion tasks quarantined during V30 migration';

DELETE newer
FROM attachment_deletion_tasks AS newer
JOIN attachment_deletion_tasks AS older
  ON older.storage_key = newer.storage_key
 AND older.id < newer.id;

SET @v30_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.table_constraints
     WHERE table_schema = DATABASE()
       AND table_name = 'attachment_deletion_tasks'
       AND constraint_name = 'uk_attachment_deletion_tasks_storage_key') = 0,
    'ALTER TABLE attachment_deletion_tasks ADD CONSTRAINT uk_attachment_deletion_tasks_storage_key UNIQUE (storage_key)',
    'SELECT 1'
);
PREPARE v30_statement FROM @v30_sql;
EXECUTE v30_statement;
DEALLOCATE PREPARE v30_statement;
