UPDATE users
SET email_hide = TRUE
WHERE email_hide IS NULL OR email_hide = FALSE;

ALTER TABLE users
MODIFY COLUMN email_hide BOOLEAN NOT NULL DEFAULT TRUE;
