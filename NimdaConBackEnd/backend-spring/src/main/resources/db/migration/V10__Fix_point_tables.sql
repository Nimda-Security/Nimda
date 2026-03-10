DROP INDEX idx_point_history_detail_id ON point_history;

DROP TABLE point_history;

-- 2. user_id 컬럼을 user_balance_id로 변경 (또는 삭제 후 새로 생성)
-- 기존에 데이터가 있다면 데이터를 옮기는 로직이 필요할 수 있으나, 구조 변경 위주로 작성합니다.
ALTER TABLE point_details CHANGE COLUMN user_id user_balance_id BIGINT;

-- 3. 새로운 외래 키 제약 조건 추가 (user_balance 테이블의 user_id 참조)
ALTER TABLE point_details
    ADD CONSTRAINT fk_point_detail_user_balance
    FOREIGN KEY (user_balance_id) REFERENCES user_balance (user_id);