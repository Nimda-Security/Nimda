package judgeServer.domain.challenge.mq.message;

import judgeServer.domain.challenge.mq.stream.StreamFields;
import lombok.Builder;
import lombok.Getter;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * CTF 서버(Go 조율자)가 돌려주는 결과 메시지.
 *
 * <p>인스턴스든 첨부파일이든 이 메시지 하나로 온다. 무엇이 왔는지는 채워진 필드로 구분한다 —
 * 인스턴스면 host/port, 첨부파일이면 downloadUrl이다. 요청에 action이 없으므로 결과에도 없다.
 *
 * <p>식별자는 {@code uuid} 하나뿐이다. 어느 사용자의 어느 문제였는지는 웹 백엔드가 자기 쪽
 * 매핑으로 되짚는다 — CTF 서버는 그걸 모른다.
 *
 * <h3>계약(contract)</h3>
 * 이 필드 이름이 Go 조율자와의 약속이다(Go: {@code queue.Result}).
 * uuid와 status는 항상 오고, 나머지는 값이 있을 때만 온다. 값이 없으면 키 자체가 없다 —
 * 빈 문자열이나 0으로 오지 않는다.
 */
@Getter
@Builder
public class CtfResultMessage {

    /** 어떤 요청에 대한 결과인지 짝지어 주는 값. 요청의 uuid와 같다. */
    private final String uuid;

    /** 처리 결과. READY면 아래 값들이 유효하고, FAILED면 message에 사유가 담긴다. */
    private final RequestStatus status;

    /** FAILED일 때의 사유. READY면 null. */
    private final String message;

    /** 접속할 호스트. 인스턴스 결과일 때만. */
    private final String host;

    /** 열린 포트. 인스턴스 결과일 때만. */
    private final Integer port;

    /**
     * 만료 시각 (ISO-8601 / RFC3339).
     * 인스턴스는 PER_USER일 때 회수 예정 시각, 첨부파일은 링크가 죽는 시각.
     */
    private final String expiresAt;

    /** presigned 다운로드 링크. 첨부파일 결과일 때만. */
    private final String downloadUrl;

    /** 인스턴스 결과인지(host/port가 실렸는지). */
    public boolean isInstance() {
        return host != null && port != null;
    }

    /** 첨부파일 결과인지(downloadUrl이 실렸는지). */
    public boolean isDownload() {
        return downloadUrl != null;
    }

    /** Redis Stream field-value 맵을 결과 메시지로 파싱한다. */
    public static CtfResultMessage fromStreamFields(Map<String, String> fields) {
        return CtfResultMessage.builder()
                .uuid(StreamFields.required(fields, "uuid", "결과 메시지"))
                .status(RequestStatus.valueOf(StreamFields.required(fields, "status", "결과 메시지")))
                .message(fields.get("message"))
                .host(fields.get("host"))
                .port(StreamFields.intOrNull(fields.get("port")))
                .expiresAt(fields.get("expiresAt"))
                .downloadUrl(fields.get("downloadUrl"))
                .build();
    }

    /**
     * 결과 메시지를 Stream field-value 맵으로 편다. 실제 발행은 Go 조율자가 하므로 웹 백엔드에서
     * 쓸 일은 없지만, Go가 실어야 하는 필드 이름·형식을 코드로 명시해 두고 테스트에도 쓰기 위해 둔다.
     * null인 선택 필드는 아예 넣지 않는다.
     */
    public Map<String, String> toStreamFields() {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("uuid", uuid);
        fields.put("status", status.name());
        if (message != null) {
            fields.put("message", message);
        }
        if (host != null) {
            fields.put("host", host);
        }
        if (port != null) {
            fields.put("port", String.valueOf(port));
        }
        if (expiresAt != null) {
            fields.put("expiresAt", expiresAt);
        }
        if (downloadUrl != null) {
            fields.put("downloadUrl", downloadUrl);
        }
        return fields;
    }
}
