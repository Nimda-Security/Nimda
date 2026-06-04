SET @sql := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE profile_decorations ADD COLUMN purchase_required BOOLEAN NOT NULL DEFAULT FALSE',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'profile_decorations'
      AND column_name = 'purchase_required'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE board ADD COLUMN item_type VARCHAR(30) NOT NULL DEFAULT ''GENERAL''',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'board'
      AND column_name = 'item_type'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE board ADD COLUMN profile_decoration_id BIGINT NULL',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'board'
      AND column_name = 'profile_decoration_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE board ADD CONSTRAINT fk_board_profile_decoration FOREIGN KEY (profile_decoration_id) REFERENCES profile_decorations(id)',
        'SELECT 1'
    )
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'board'
      AND constraint_name = 'fk_board_profile_decoration'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS user_profile_decorations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    profile_decoration_id BIGINT NOT NULL,
    acquired_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_profile_decoration (user_id, profile_decoration_id),
    CONSTRAINT fk_user_profile_decorations_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_profile_decorations_decoration
        FOREIGN KEY (profile_decoration_id) REFERENCES profile_decorations(id)
);
