package judgeServer.domain.challenge.instance;

import judgeServer.domain.challenge.mq.consumer.InstanceResultConsumer;
import judgeServer.domain.challenge.mq.message.InstanceResultMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

// ctf에서 받아온 인스턴스 정보는 접두사+requestId로 저장되어 만료되기 전까지 redis에 저장
@Service
@RequiredArgsConstructor
public class InstanceResultStore {

    private final StringRedisTemplate redisTemplate;

    public Optional<InstanceResultMessage> find(String requestId) {
        String key = InstanceResultConsumer.RESULT_KEY_PREFIX + requestId;
        Map<Object, Object> raw = redisTemplate.opsForHash().entries(key);
        if (raw == null || raw.isEmpty()) {
            return Optional.empty();
        }
        Map<String, String> fields = new HashMap<>();
        raw.forEach((k, v) -> fields.put(String.valueOf(k), String.valueOf(v)));
        return Optional.of(InstanceResultMessage.fromStreamFields(fields));
    }
}
