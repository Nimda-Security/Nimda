CREATE TABLE profile_decorations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    decoration_key VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE TABLE profile_decoration_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    decoration_id BIGINT NOT NULL,
    authority_name VARCHAR(50) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_profile_decoration_roles_decoration
        FOREIGN KEY (decoration_id) REFERENCES profile_decorations(id) ON DELETE CASCADE,
    CONSTRAINT uk_profile_decoration_roles UNIQUE (decoration_id, authority_name)
);

CREATE TABLE user_profile_decorations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    decoration_id BIGINT NOT NULL,
    acquired_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_user_profile_decorations_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_profile_decorations_decoration
        FOREIGN KEY (decoration_id) REFERENCES profile_decorations(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_profile_decorations UNIQUE (user_id, decoration_id)
);
