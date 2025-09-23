-- insert into "user" (username, password, nickname, activated) values ('admin', '$2a$08$lDnHPz7eUkSi6ao14Twuau08mzhWrL4kyZGGU5xfiGALO/Vxd5DOi', 'admin', 1);
-- insert into "user" (username, password, nickname, activated) values ('user', '$2a$08$UkVvwpULis18S19S5pZFn.YHPZt3oaqHZnDwqbCW9pft6uFtkXKDC', 'user', 1);

-- insert into authority (authority_name) values ('ROLE_USER');
-- insert into authority (authority_name) values ('ROLE_ADMIN');

-- insert into user_authority (user_id, authority_name) values (1, 'ROLE_USER');
-- insert into user_authority (user_id, authority_name) values (1, 'ROLE_ADMIN');
-- insert into user_authority (user_id, authority_name) values (2, 'ROLE_USER');


-- 기본 권한 데이터 삽입
INSERT IGNORE INTO authority (authority_name) VALUES 
('ROLE_USER'),
('ROLE_ADMIN');

-- 기본 관리자 계정 생성 (비밀번호: password)
INSERT IGNORE INTO users (username, password, email) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com'),
('익명', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'anonymous@nimda.com');

-- 관리자에게 USER 권한 부여
INSERT IGNORE INTO user_authorities (user_id, authority_id) VALUES 
(1, 'ROLE_USER'),
(2, 'ROLE_USER');

-- 기본 문제 데이터 삽입
INSERT IGNORE INTO problems (id, title, description, points, time_limit, memory_limit, difficulty) VALUES 
(1, 'A + B', '두 정수 A와 B를 입력받아 A+B를 출력하는 프로그램을 작성하시오.', 100, 5000, 262144, 'EASY'),
(2, 'Hello World', 'Hello World를 출력하는 프로그램을 작성하시오.', 50, 5000, 262144, 'EASY');

-- 기본 테스트케이스 데이터 삽입
-- A + B 문제용 (ID: 1)
INSERT IGNORE INTO test_cases (problem_id, input, output) VALUES 
(1, '1 2', '3'),           -- A + B 테스트케이스 1
(1, '5 7', '12'),          -- A + B 테스트케이스 2
(1, '100 200', '300'),     -- A + B 테스트케이스 3
(1, '0 0', '0'),           -- A + B 테스트케이스 4

-- Hello World 문제용 (ID: 2)
(2, '', 'Hello World');    -- Hello World 테스트케이스 (입력 없음)