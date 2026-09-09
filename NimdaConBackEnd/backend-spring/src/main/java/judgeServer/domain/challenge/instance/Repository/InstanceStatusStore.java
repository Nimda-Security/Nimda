package judgeServer.domain.challenge.instance.Repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import judgeServer.domain.challenge.instance.ObjectStatus.InstanceStatus;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import redis.util.RedisUtil;

import java.util.Optional;

@Component
@AllArgsConstructor
public class InstanceStatusStore {
    private final RedisUtil redisUtil;
    private final ObjectMapper objectMapper;

    private static final String KEY_PREFIX = "ctf:instance:status";
    // 일단 기본값으로 적용 todo TTL 바꾸는 로직 구현
    private static final long DEFAULT_TTL = 600;

    public void saveStatus(String uuid, InstanceStatus statusDto) {
        try {
            String key = KEY_PREFIX + uuid;
            String jsonValue = objectMapper.writeValueAsString(statusDto);
            redisUtil.setDataWithExpiration(key, jsonValue, DEFAULT_TTL);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Redis 상태 저장 실패 (JSON 변환 오류)", e);
        }
    }

    // 상태 조회
    public Optional<InstanceStatus> getStatus(String requestId) {
        String key = KEY_PREFIX + requestId;
        String jsonValue = redisUtil.getData(key);

        if (jsonValue == null || jsonValue.isBlank()) {
            return Optional.empty();
        }

        try {
            return Optional.of(objectMapper.readValue(jsonValue, InstanceStatus.class));
        } catch (JsonProcessingException e) {
            return Optional.empty();
        }
    }
}
