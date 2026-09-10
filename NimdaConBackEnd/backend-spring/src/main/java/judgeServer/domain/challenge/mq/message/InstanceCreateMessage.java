package judgeServer.domain.challenge.mq.message;

import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.enums.FlagType;
import judgeServer.domain.challenge.enums.IsolationType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
@Getter
@Builder
public class InstanceCreateMessage {

    // todo CREATE 고정이 아니라 문제 타입에 맞춰서 연결
    public final ActionType actionType;
    // UUID로 입력되며 응답 시 매핑
    private final String requestId;
    // S3에서 파일을 찾을 때 사용
    private final String challengeCode;
    private final String challengeCategory;
    private final Long userId;
    // PER_USER, SHARED
    private final IsolationType isolationType;
    // STATIC, DYNAMIC
    private final FlagType flagType;

    /** 요청 시각 (ISO-8601). */
    private final String requestedAt;
    
    public static InstanceCreateMessage of(Challenge challenge, Long userId, String requestId, ActionType actionType) {
        return InstanceCreateMessage.builder()
                .actionType(actionType)
                .requestId(requestId)
                .challengeCategory(challenge.getCategory().toString())
                .challengeCode(challenge.getCode())
                .userId(userId)
                .isolationType(challenge.getIsolationType())
                .flagType(challenge.getFlagType())
                .requestedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }

    // redis에 json 형태로 값을 넣을 때 사용
    public Map<String, String> toStreamFields() {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("action", actionType.name());
        fields.put("challengeCategory", challengeCategory);
        // 조율자가 S3 객체 키(challenges/{code}/{code}.zip)를 만들 때 쓴다. 빠지면 어느 문제인지
        // 알 수 없어 조율자가 메시지를 dead-letter로 보낸다.
        fields.put("challengeCode", challengeCode);
        fields.put("requestId", requestId);
        fields.put("userId", String.valueOf(userId));
        fields.put("isolationType", isolationType.name());
        fields.put("flagType", flagType.name());
        fields.put("requestedAt", requestedAt);
        return fields;
    }
}
