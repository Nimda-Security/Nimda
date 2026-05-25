ALTER TABLE board
    ADD COLUMN thumbnail_attachment_id BIGINT NULL;

ALTER TABLE category
    ADD COLUMN shop_enabled BOOLEAN DEFAULT false;

ALTER TABLE board ADD COLUMN item_price INT DEFAULT 0 NOT NULL;