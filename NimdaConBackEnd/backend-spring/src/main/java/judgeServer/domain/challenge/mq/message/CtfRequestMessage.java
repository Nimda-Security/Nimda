package judgeServer.domain.challenge.mq.message;

import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.enums.FlagType;
import judgeServer.domain.challenge.enums.IsolationType;
import lombok.Builder;
import lombok.Getter;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 웹사이트 -> CTF 서버 요청 메시지.
 * 인스턴스 사용 문제는 SHARED, PER_USER로 나눠져 있다.
 * 플래그는 DYNAMIC과 STATIC로 구분되는데 SHARED는 STATIC만을 사용하고 PER_USER는 둘 다 허용한다.
 */
@Getter
@Builder
public class CtfRequestMessage {

    private final String uuid;
    // s3에 저장되어 있는 이름
    private final String challengeCode;
    // REVERSING, FORENSICS, CRYPTO, WEB, PWN, MISC
    private final String challengeCategory;
    // NONE(정적 파일 다운로드), SHARED(인스턴스 공유), PER_USER(요청마다 인스턴스 생성
    private final IsolationType isolationType;
    // STATIC, DYNAMIC
    private final FlagType flagType;

    public static CtfRequestMessage of(Challenge challenge, String uuid) {
        if (challenge.getIsolationType() == IsolationType.SHARED
                && challenge.getFlagType() == FlagType.DYNAMIC) {
            throw new IllegalArgumentException(
                    "SHARED 문제는 DYNAMIC 플래그를 쓸 수 없습니다: challengeCode=" + challenge.getCode());
        }

        return CtfRequestMessage.builder()
                .uuid(uuid)
                .challengeCode(challenge.getCode())
                .challengeCategory(challenge.getCategory().name())
                .isolationType(challenge.getIsolationType())
                .flagType(challenge.getFlagType())
                .build();
    }

    /** Redis Stream은 평평한 문자열 맵만 싣는다. */
    public Map<String, String> toStreamFields() {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("uuid", uuid);
        fields.put("challengeCode", challengeCode);
        fields.put("challengeCategory", challengeCategory);
        fields.put("isolationType", isolationType.name());
        fields.put("flagType", flagType.name());
        return fields;
    }
}
