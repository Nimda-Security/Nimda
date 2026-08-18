package judgeServer.domain.challenge.mq.stream;

import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

// stream json 저장 인터페이스
public class StreamResultStore<T> {

    private final StringRedisTemplate redisTemplate;
    private final String keyPrefix;
    private final Function<Map<String, String>, T> parser;

    protected StreamResultStore(StringRedisTemplate redisTemplate, String keyPrefix,
                                Function<Map<String, String>, T> parser) {
        this.redisTemplate = redisTemplate;
        this.keyPrefix = keyPrefix;
        this.parser = parser;
    }

    public Optional<T> find(String requestId) {
        Map<Object, Object> raw = redisTemplate.opsForHash().entries(keyPrefix + requestId);
        if (raw == null || raw.isEmpty()) {
            return Optional.empty();
        }
        Map<String, String> fields = new HashMap<>();
        raw.forEach((k, v) -> fields.put(String.valueOf(k), String.valueOf(v)));
        return Optional.of(parser.apply(fields));
    }
}
