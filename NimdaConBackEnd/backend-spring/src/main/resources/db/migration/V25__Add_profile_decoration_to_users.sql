-- Add profile_decoration column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_decoration VARCHAR(100) NULL DEFAULT NULL;

-- Set comment for clarity (optional, for MySQL documentation)
-- ALTER TABLE users MODIFY COLUMN profile_decoration VARCHAR(100) COMMENT '장착 중인 프로필 장식 키';
