-- notification_type 컬럼을 MySQL ENUM에서 VARCHAR(50)으로 변경
-- Hibernate 6.2+가 @Enumerated(EnumType.STRING)을 네이티브 ENUM으로 매핑하여
-- 새로 추가된 NoticePost 값이 거부되는 문제 수정
ALTER TABLE notification MODIFY COLUMN notification_type VARCHAR(50) NOT NULL;
