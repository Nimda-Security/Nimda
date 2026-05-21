ALTER TABLE category
    ADD COLUMN shop_enabled BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE category
SET shop_enabled = FALSE
WHERE shop_enabled IS NULL;

ALTER TABLE board
    ADD COLUMN item_price BIGINT NOT NULL DEFAULT 0;

UPDATE board
SET item_price = 0
WHERE item_price IS NULL;
