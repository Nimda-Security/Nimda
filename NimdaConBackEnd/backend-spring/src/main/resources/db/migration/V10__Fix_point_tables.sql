-- Idempotent: 이미 일부 적용된 상태에서도 재실행 가능하도록 처리

-- 1. point_history 제거 (테이블 삭제 시 인덱스도 함께 제거됨)
DROP TABLE IF EXISTS point_history;

-- 2. point_details: 기존 FK 제거 후 user_id -> user_balance_id 변경 (없으면 스킵)
SET @drop_fk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'point_details' AND CONSTRAINT_NAME = 'fk_point_detail_user');
SET @sql_drop_fk = IF(@drop_fk > 0, 'ALTER TABLE point_details DROP FOREIGN KEY fk_point_detail_user', 'SELECT 1');
PREPARE stmt FROM @sql_drop_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_user_id = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_details' AND COLUMN_NAME = 'user_id');
SET @sql_change = IF(@has_user_id > 0, 'ALTER TABLE point_details CHANGE COLUMN user_id user_balance_id BIGINT', 'SELECT 1');
PREPARE stmt FROM @sql_change;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 새 FK 추가 (이미 있으면 스킵)
SET @has_fk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'point_details' AND CONSTRAINT_NAME = 'fk_point_detail_user_balance');
SET @sql_add_fk = IF(@has_fk = 0, 'ALTER TABLE point_details ADD CONSTRAINT fk_point_detail_user_balance FOREIGN KEY (user_balance_id) REFERENCES user_balance (user_id)', 'SELECT 1');
PREPARE stmt FROM @sql_add_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. user_balance에 없는 유저는 0원 잔액으로 추가
INSERT INTO user_balance (user_id, total_amount, updated_at)
SELECT id, 0, NOW()
FROM users
WHERE id NOT IN (SELECT user_id FROM user_balance);

-- 5. description 컬럼 없으면 추가 (있으면 스킵)
SET @has_desc = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_details' AND COLUMN_NAME = 'description');
SET @sql_add_col = IF(@has_desc = 0, 'ALTER TABLE point_details ADD COLUMN description VARCHAR(255) NOT NULL DEFAULT ''''', 'SELECT 1');
PREPARE stmt FROM @sql_add_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- NOT NULL만 유지하려면 기본값 제거 (기본값 있으면 기존 행 허용)
SET @has_desc2 = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_details' AND COLUMN_NAME = 'description');
SET @sql_mod = IF(@has_desc2 > 0, 'ALTER TABLE point_details MODIFY COLUMN description VARCHAR(255) NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql_mod;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
