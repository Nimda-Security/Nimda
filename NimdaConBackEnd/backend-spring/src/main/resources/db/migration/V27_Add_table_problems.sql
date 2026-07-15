create table problems (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        code varchar(50) not null,
        created_at datetime(6),
        description TEXT not null,
        is_public bit not null,
        memory_limit integer not null,
        points integer not null,
        time_limit float(53) not null,
        title varchar(100) not null,
    );