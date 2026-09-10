package judgeServer.domain.challenge.mq.message;

import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.enums.FlagType;
import judgeServer.domain.challenge.enums.IsolationType;
import lombok.Builder;
import lombok.Getter;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * CTF 서버(Go 조율자)로 나가는 요청 메시지.
 *
 * <p>예전에는 인스턴스 생성과 첨부파일 다운로드가 각자 메시지 클래스와 스트림을 가졌다.
 * 지금은 요청 스트림 하나에 이 메시지 하나만 흐른다.
 *
 * <p>그래서 "무엇을 해달라"(action)를 싣지 않는다. 판단은 전부 조율자가 하고, 기준은
 * {@code challengeCategory} 하나다 — WEB이면 인스턴스를 띄우고, 나머지는 첨부파일
 * presigned URL을 발급한다. 뒤집으면 WEB 문제는 첨부파일을 받을 수 없다는 뜻이다.
 *
 * <p>사용자 ID도 싣지 않는다. CTF 서버는 요청한 사람이 누구인지 알 필요가 없고,
 * {@code uuid} ↔ 사용자 매핑은 웹 백엔드가 자기 쪽 Redis에서 관리한다. 남의 인스턴스에
 * 접근하는 것은 "이 uuid를 모르면 주소를 만들 수 없다"로 막는다.
 *
 * <h3>계약(contract)</h3>
 * 이 필드 이름이 Go 조율자와의 약속이다(Go: {@code queue.Request}). 다섯 개 모두 필수라
 * 하나라도 빠지면 조율자가 메시지를 dead-letter로 보낸다. 바꾸면 양쪽 다 고쳐야 한다.
 */
@Getter
@Builder
public class CtfRequestMessage {

    /** 이 요청의 식별자. 결과도 이 값으로 돌아온다. */
    private final String uuid;

    /** S3에서 문제 파일을 찾을 때 사용. 조율자가 challenges/{code}/{code}.zip을 유도한다. */
    private final String challengeCode;

    /** 조율자가 무엇을 할지 정하는 유일한 기준. */
    private final String challengeCategory;

    /** PER_USER, SHARED */
    private final IsolationType isolationType;

    /** STATIC, DYNAMIC */
    private final FlagType flagType;

    public static CtfRequestMessage of(Challenge challenge, String uuid) {
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
