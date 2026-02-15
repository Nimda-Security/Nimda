-- ============================================
-- 기존 DB 마이그레이션 (feat.md 기준)
-- ============================================
-- 이 스크립트는 기존 DB가 있을 경우 실행됩니다.
-- baseline-on-migrate: true 설정 시 자동으로 실행됩니다.
-- 기존 데이터는 유지하면서 스키마 변경사항을 적용합니다.

-- ============================================
-- 1. Users 테이블 스키마 업데이트
-- ============================================

-- created_at, updated_at 컬럼 추가 (없는 경우만)
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'created_at'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'updated_at'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- status 컬럼이 없거나 타입이 다른 경우 처리
-- MySQL 8.0 이상에서는 직접 IF NOT EXISTS 지원 안 함
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'status';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1', -- 컬럼이 이미 있으면 아무것도 안 함
  'ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''PENDING'''
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 기존 사용자는 모두 APPROVED로 설정 (feat.md 요구사항)
UPDATE users 
SET status = 'APPROVED' 
WHERE status IS NULL OR status = '' OR status NOT IN ('PENDING', 'APPROVED', 'REJECTED');

-- ============================================
-- 2. Board 테이블 스키마 업데이트
-- ============================================

-- created_at, updated_at 컬럼 추가 (없는 경우만)
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'board'
      AND COLUMN_NAME = 'created_at'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE board ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'board'
      AND COLUMN_NAME = 'updated_at'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE board ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- user_id 컬럼 추가 (없는 경우)
SET @columnname = 'user_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = 'board')
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE board ADD COLUMN user_id BIGINT, ADD FOREIGN KEY (user_id) REFERENCES users(id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- board_type 컬럼 추가 (없는 경우)
SET @columnname = 'board_type';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = 'board')
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE board ADD COLUMN board_type VARCHAR(20) NOT NULL DEFAULT ''FREE'''
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 기존 board 데이터에 user_id가 NULL인 경우 처리
-- 주의: 실제 데이터 상황에 맞게 수정 필요
-- UPDATE board SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;

-- 기존 board 데이터에 board_type이 NULL인 경우 기본값 설정
UPDATE board 
SET board_type = 'FREE' 
WHERE board_type IS NULL OR board_type = '';

-- ============================================
-- 3. 기타 테이블 스키마 업데이트 (필요시)
-- ============================================

-- Problems 테이블에 created_at 추가 (없는 경우만)
SET @columnname = 'created_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = 'problems')
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE problems ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Problems 테이블에 updated_at 추가 (없는 경우만)
SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = 'problems')
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE problems ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Contest 테이블에 created_at 추가 (없는 경우만)
SET @columnname = 'created_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = 'contest')
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE contest ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Contest 테이블에 updated_at 추가 (없는 경우만)
SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = 'contest')
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE contest ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
