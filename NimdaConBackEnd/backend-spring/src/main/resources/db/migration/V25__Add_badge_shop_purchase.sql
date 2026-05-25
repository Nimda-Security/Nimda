ALTER TABLE profile_decorations
    ADD COLUMN purchase_required BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE board
    ADD COLUMN item_type VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    ADD COLUMN profile_decoration_id BIGINT NULL;

ALTER TABLE board
    ADD CONSTRAINT fk_board_profile_decoration
        FOREIGN KEY (profile_decoration_id) REFERENCES profile_decorations(id);

CREATE TABLE user_profile_decorations (
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
