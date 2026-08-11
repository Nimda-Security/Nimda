-- CTF 문제(challenges)와 정답 기록(solves) 테이블 생성
--
-- V32에서 제거한 problems / submissions를 대체한다.
-- 운영 형태는 상시 워게임(문제 상시 공개)이며 배점은 정적 점수를 쓴다.
--
-- 기존 테이블과 달라진 점:
--   - time_limit / memory_limit / language / source_code 없음 (코드를 실행하지 않음)
--   - category 추가 (문제 분류마다 서버가 제공해야 하는 것이 다름)
--   - flag_hash 추가 (정답 판정의 기준)
--   - isolation_type 추가 (문제 환경을 어떻게 띄울지)
--
-- 재실행 상황에서도 안전하도록 존재 여부를 명시한다.

CREATE TABLE IF NOT EXISTS challenges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- 문제 고유 식별자. 문제 파일/이미지 이름과 맞춰서 쓴다 (예: rev-01, web-03)
    code VARCHAR(50) NOT NULL,

    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,

    -- REVERSING / FORENSICS / CRYPTO / WEB / PWN / MISC
    -- 분류에 따라 서버가 해줄 일이 달라진다 (파일만 주면 되는지, 접속할 서버가 필요한지)
    category VARCHAR(20) NOT NULL,

    -- 배점. 상시 워게임이라 푼 사람 수에 따라 변하지 않는 고정 점수를 쓴다
    points INT NOT NULL DEFAULT 100,

    -- STATIC  : 모두에게 같은 플래그. flag_hash에 저장해둔 값과 비교한다
    -- DYNAMIC : 사용자마다 다른 플래그. 제출 시점에 계산해서 비교하므로 미리 저장하지 않는다
    flag_type VARCHAR(20) NOT NULL DEFAULT 'STATIC',

    -- 정답 플래그의 SHA-256 해시(hex 64자). 평문은 저장하지 않는다.
    -- DB가 유출되어도 전 문제의 정답이 그대로 새지 않게 하기 위함이며,
    -- 비교도 해시끼리 하게 되어 응답 시간으로 정답을 추측하는 공격에서 자유롭다.
    -- flag_type이 DYNAMIC이면 미리 저장할 값이 없으므로 NULL이다.
    flag_hash CHAR(64) NULL,

    -- 참가자가 내려받는 첨부파일의 S3 객체 키 (예: challenges/rev-01/rev-01.zip)
    --
    -- 다운로드 주소를 그대로 저장하지 않는다. 참가자가 문제를 열면 이 키를 CTF 서버에
    -- 넘겨 잠깐만 유효한 presigned URL을 받아서 내려준다.
    -- presigned URL은 만료 시각이 박혀 있어 저장해두면 금세 못 쓰는 값이 되고,
    -- 저장된 값이 새어 나가면 그 자체가 파일 접근 권한이 되기 때문이다.
    --
    -- 첨부파일이 없는 문제(접속만 하면 되는 web/pwn 등)는 NULL이다.
    attachment_key VARCHAR(255) NULL,

    -- NONE     : 접속할 서버가 없는 문제 (파일만 받아서 푼다)
    -- SHARED   : 문제당 서버 하나를 전원이 같이 쓴다
    -- PER_USER : 참가자마다 서버를 따로 띄운다 (pwn처럼 한 명이 망가뜨릴 수 있는 문제)
    isolation_type VARCHAR(20) NOT NULL DEFAULT 'NONE',

    -- 초안 작성 중에는 false로 두고 공개할 때 true로 바꾼다
    is_public BIT(1) NOT NULL DEFAULT b'0',

    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NULL,

    UNIQUE KEY uk_challenges_code (code),
    KEY idx_challenges_category (category),
    KEY idx_challenges_is_public (is_public)
);

-- 정답 기록. 오답은 남기지 않는다.
-- 무차별 대입 방어는 Redis 카운터로 처리하고, 오답 통계가 필요해지면 별도 테이블을 추가한다.
CREATE TABLE IF NOT EXISTS solves (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    challenge_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    -- 맞힌 시점의 배점을 그대로 남긴다.
    -- 나중에 문제 배점을 조정해도 이미 쌓인 점수가 흔들리지 않게 하기 위함이다.
    awarded_points INT NOT NULL,

    solved_at DATETIME(6) NOT NULL,

    -- 같은 사람이 같은 문제를 두 번 맞히는 것을 DB에서 막는다.
    -- 응용 코드가 중복 체크를 빠뜨려도 점수가 두 번 들어가지 않는다.
    UNIQUE KEY uk_solves_challenge_user (challenge_id, user_id),

    KEY idx_solves_user_id (user_id),
    KEY idx_solves_challenge_id (challenge_id)
);
