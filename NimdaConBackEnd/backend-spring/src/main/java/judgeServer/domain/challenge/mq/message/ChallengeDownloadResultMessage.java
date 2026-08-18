package judgeServer.domain.challenge.mq.message;

import com.fasterxml.jackson.annotation.JsonIgnore;
import judgeServer.domain.challenge.mq.stream.StreamFields;
import lombok.Builder;
import lombok.Getter;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Builder
public class ChallengeDownloadResultMessage {

    private final String requestId;

    private final String challengeCode;

    /**
     * 발급을 요청했던 사용자. 응답으로 그대로 내보낼 이유가 없어(남의 ID 노출) JSON에서는 뺀다.
     * 본인 확인에만 쓴다.
     */
    @JsonIgnore
    private final Long userId;

    // READY, FAILED
    private final DownloadStatus status;

    // FAILED 시 null
    private final String url;

    // FAILED 시 null
    private final String expiresAt;

    // FAILED 시 사유 저장
    private final String message;

    // raw data 파싱 함수
    public static ChallengeDownloadResultMessage fromStreamFields(Map<String, String> fields) {
        return ChallengeDownloadResultMessage.builder()
                .requestId(required(fields, "requestId"))
                .challengeCode(required(fields, "challengeCode"))
                .userId(Long.valueOf(required(fields, "userId")))
                .status(DownloadStatus.valueOf(required(fields, "status")))
                // 아래 셋은 선택 필드라 없으면 null로 둔다.
                .url(fields.get("url"))
                .expiresAt(fields.get("expiresAt"))
                .message(fields.get("message"))
                .build();
    }

    // dto -> raw data로 변환
    public Map<String, String> toStreamFields() {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("requestId", requestId);
        fields.put("challengeCode", challengeCode);
        fields.put("userId", String.valueOf(userId));
        fields.put("status", status.name());
        if (url != null) {
            fields.put("url", url);
        }
        if (expiresAt != null) {
            fields.put("expiresAt", expiresAt);
        }
        if (message != null) {
            fields.put("message", message);
        }
        return fields;
    }

    private static String required(Map<String, String> fields, String key) {
        return StreamFields.required(fields, key, "다운로드 결과 메시지");
    }
}
