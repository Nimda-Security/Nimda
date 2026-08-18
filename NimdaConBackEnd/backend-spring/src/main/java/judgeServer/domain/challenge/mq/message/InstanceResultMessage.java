package judgeServer.domain.challenge.mq.message;

import judgeServer.domain.challenge.mq.stream.StreamFields;
import lombok.Builder;
import lombok.Getter;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * CTF 문제 인스턴스 "생성 결과" 메시지 (Go 조율자 → 웹 백엔드).
 *
 * <p>{@link InstanceCreateMessage} 요청을 받은 조율자가 컨테이너를 띄우고 포트를 연 뒤,
 * 그 접근 정보를 이 메시지로 돌려준다. 웹 백엔드는 {@code requestId}로 원래 요청과 짝지어
 * 사용자에게 "이 host:port로 접속하라"고 알려준다.
 *
 * <ul>
 *   <li>공유(SHARED) 컨테이너: 모두에게 같은 host/port가 온다.</li>
 *   <li>온디맨드(PER_USER) 컨테이너: 사용자마다 다른 port가 온다.</li>
 * </ul>
 *
 * <p>첨부파일 다운로드용 presigned URL은 이 메시지에 담지 않는다. 그건 CTF 서버가 별도로
 * 전달하는 경로이고, 여기서는 "떠 있는 인스턴스에 접근할 포트"만 다룬다.
 *
 * <h3>계약(contract)</h3>
 * 이 필드 구성이 Go 조율자와의 약속이다. Go는 이 필드 이름 그대로 Stream에 실어 보내고,
 * 웹 백엔드는 {@link #fromStreamFields(Map)}로 읽는다. 필드를 바꾸면 양쪽 다 고쳐야 한다.
 */
@Getter
@Builder
public class InstanceResultMessage {

    /** 어떤 요청에 대한 결과인지 짝지어 주는 상관 ID. {@link InstanceCreateMessage#getRequestId()}와 같은 값. */
    private final String requestId;

    /** 문제 코드. */
    private final String challengeCode;

    /** 인스턴스를 요청했던 사용자. */
    private final Long userId;

    /** 처리 결과. READY면 host/port가 유효하고, FAILED면 message에 사유가 담긴다. */
    private final InstanceStatus status;

    /** 접속할 호스트 (도메인 또는 IP). FAILED면 null. */
    private final String host;

    /** 열린 포트. 공유는 통일된 포트, 온디맨드는 사용자별 포트. FAILED면 null. */
    private final Integer port;

    /** 인스턴스 만료 시각 (ISO-8601). 회수 예정이 없으면 null. */
    private final String expiresAt;

    /** FAILED일 때의 사유. READY면 null. */
    private final String message;

    /**
     * Redis Stream field-value 맵을 결과 메시지로 파싱한다. (웹 백엔드가 결과를 읽을 때 사용)
     * 값이 없는 선택 필드(host/port/expiresAt/message)는 null로 둔다.
     */
    public static InstanceResultMessage fromStreamFields(Map<String, String> fields) {
        String statusRaw = required(fields, "status");
        return InstanceResultMessage.builder()
                .requestId(required(fields, "requestId"))
                .challengeCode(required(fields, "challengeCode"))
                .userId(Long.valueOf(required(fields, "userId")))
                .status(InstanceStatus.valueOf(statusRaw))
                .host(fields.get("host"))
                .port(parseIntOrNull(fields.get("port")))
                .expiresAt(fields.get("expiresAt"))
                .message(fields.get("message"))
                .build();
    }

    /**
     * 결과 메시지를 Stream field-value 맵으로 편다. 실제 발행은 Go 조율자가 하므로 웹 백엔드에서
     * 쓸 일은 없지만, Go가 실어야 하는 필드 이름·형식을 코드로 명시해 두고 테스트에도 쓰기 위해 둔다.
     * null인 선택 필드는 아예 넣지 않는다.
     */
    public Map<String, String> toStreamFields() {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("requestId", requestId);
        fields.put("challengeCode", challengeCode);
        fields.put("userId", String.valueOf(userId));
        fields.put("status", status.name());
        if (host != null) {
            fields.put("host", host);
        }
        if (port != null) {
            fields.put("port", String.valueOf(port));
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
        return StreamFields.required(fields, key, "결과 메시지");
    }

    private static Integer parseIntOrNull(String value) {
        return StreamFields.intOrNull(value);
    }
}
