package judgeServer.domain.challenge.mq.message;

import judgeServer.domain.challenge.entity.Challenge;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Builder
public class ChallengeDownloadMessage {

    public static final String ACTION = "DOWNLOAD";

    private final String requestId;

    // ctf 서버에서 문제를 찾기 위해 사용
    private final String challengeCode;

    private final Long userId;

    // challenge에서만 데이터를 탐색해야 하기에 final로 고정
    private final String objectKey;

    private final String requestedAt;

    public static ChallengeDownloadMessage of(Challenge challenge, Long userId, String requestId) {
        return ChallengeDownloadMessage.builder()
                .requestId(requestId)
                .challengeCode(challenge.getCode())
                .userId(userId)
                .objectKey(challenge.getAttachmentKey())
                .requestedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }

    // stream json 변환
    public Map<String, String> toStreamFields() {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("action", ACTION);
        fields.put("requestId", requestId);
        fields.put("challengeCode", challengeCode);
        fields.put("userId", String.valueOf(userId));
        if (objectKey != null && !objectKey.isBlank()) {
            fields.put("objectKey", objectKey);
        }
        fields.put("requestedAt", requestedAt);
        return fields;
    }
}
