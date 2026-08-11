-- 알고리즘 채점 서버 -> CTF 채점 서버 전환에 따른 테이블 제거
--
-- 배경:
--   MSA로 알고리즘 채점 서버를 구현 중이었으나 보안 동아리의 목적에 부합하지 않아
--   CTF 채점 서버로 방향을 바꿈. problems / submissions는 채점(시간 제한, 메모리 제한,
--   소스코드, 실행 시간)을 전제로 설계되어 CTF에서 재사용할 수 있는 컬럼이 거의 없다.
--   구조를 고치는 대신 제거하고 V33에서 challenges / solves로 새로 만든다.
--
--   problems    -> challenges (V33)
--   submissions -> solves     (V33)
--
-- ⚠️ 주의: 이 마이그레이션은 두 테이블의 데이터를 되돌릴 수 없게 삭제한다.
--    운영 DB에 남겨야 할 제출 기록이 있다면 실행 전에 반드시 백업할 것.
--
-- 재실행이나 부분 적용 상황에서도 안전하도록 존재 여부를 명시한다.

-- submissions가 problem_id로 problems를 참조하므로 자식 쪽을 먼저 지운다.
-- (외래키 제약은 걸려 있지 않지만 의미상 순서를 맞춘다)
DROP TABLE IF EXISTS submissions;

DROP TABLE IF EXISTS problems;
