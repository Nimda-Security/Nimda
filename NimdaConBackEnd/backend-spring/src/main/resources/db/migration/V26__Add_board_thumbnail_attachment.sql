ALTER TABLE board
    ADD COLUMN thumbnail_attachment_id BIGINT NULL;

ALTER TABLE category
    ADD COLUMN shopEnabled BOOLEAN DEFAULT false;