package judgeServer.domain.challenge.instance.Repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import judgeServer.config.CtfTtlProperties;
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
    private final CtfTtlProperties ttlProperties;

    private static final String KEY_PREFIX = "ctf:instance:status";

    public void saveStatus(String uuid, InstanceStatus statusDto) {
        try {
            String key = KEY_PREFIX + uuid;
            String jsonValue = objectMapper.writeValueAsString(statusDto);
            redisUtil.setDataWithExpiration(key, jsonValue, ttlProperties.getStatus().toSeconds());
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
