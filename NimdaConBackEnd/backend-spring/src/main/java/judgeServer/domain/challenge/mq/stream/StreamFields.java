package judgeServer.domain.challenge.mq.stream;

import java.util.Map;

public final class StreamFields {

    private StreamFields() {
    }

    // 필드 데이터 누락 확인
    public static String required(Map<String, String> fields, String key, String what) {
        String value = fields.get(key);
        if (value == null || value.isEmpty()) {
            throw new IllegalArgumentException(what + " 필수 필드 누락: " + key);
        }
        return value;
    }

    public static Integer intOrNull(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        return Integer.valueOf(value);
    }
}
