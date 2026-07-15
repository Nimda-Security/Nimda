-- 1. 그룹(Group) 테이블
CREATE TABLE `groups` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    description VARCHAR(200),
    created_at DATETIME, -- BaseTimeEntity
    updated_at DATETIME  -- BaseTimeEntity
);

-- 2. 그룹 멤버(GroupMember) 테이블
CREATE TABLE group_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME, -- BaseTime
    updated_at DATETIME, -- BaseTime

    CONSTRAINT fk_group_member_group FOREIGN KEY (group_id) REFERENCES `groups` (id),
    CONSTRAINT fk_group_member_user FOREIGN KEY (user_id) REFERENCES users (id),

    CONSTRAINT uk_group_member UNIQUE (group_id, user_id) -- 중복 가입 방지
);

-- 3. 그룹 가입 요청(GroupJoinRequest) 테이블
CREATE TABLE group_join_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    join_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME, -- BaseTimeEntity
    updated_at DATETIME, -- BaseTimeEntity

    CONSTRAINT fk_join_request_group FOREIGN KEY (group_id) REFERENCES `groups` (id),
    CONSTRAINT fk_join_request_user FOREIGN KEY (user_id) REFERENCES users (id),

    CONSTRAINT uk_group_join_request UNIQUE (group_id, user_id) -- 중복 신청 방지
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_join_requests_group_id ON group_join_requests(group_id);
CREATE INDEX idx_group_join_requests_user_id ON group_join_requests(user_id);
