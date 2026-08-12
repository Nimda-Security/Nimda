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
    public static final String ACTION = "CREATE";

    // UUID로 입력되며 응답 시 매핑
    private final String requestId;

    // S3에서 파일을 찾을 때 사용
    private final String challengeCode;

    private final Long userId;

    /**
     * 정적(SHARED)이면 문제당 컨테이너 하나를 전원이 공유하고, 동적(PER_USER)이면
     * 사용자마다 컨테이너를 따로 띄운다. 조율자가 새로 띄울지 기존 것을 재사용할지 판단하는 기준.
     */
    private final IsolationType isolationType;

    /**
     * DYNAMIC이면 조율자가 이 사용자 전용 플래그를 계산해 컨테이너에 주입한다.
     * STATIC이면 컨테이너에 이미 박혀 있으므로 주입하지 않는다.
     */
    private final FlagType flagType;

    /** 요청 시각 (ISO-8601). */
    private final String requestedAt;
    
    public static InstanceCreateMessage of(Challenge challenge, Long userId, String requestId) {
        return InstanceCreateMessage.builder()
                .requestId(requestId)
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
        fields.put("action", ACTION);
        fields.put("requestId", requestId);
        fields.put("challengeCode", challengeCode);
        fields.put("userId", String.valueOf(userId));
        fields.put("isolationType", isolationType.name());
        fields.put("flagType", flagType.name());
        fields.put("requestedAt", requestedAt);
        return fields;
    }
}
