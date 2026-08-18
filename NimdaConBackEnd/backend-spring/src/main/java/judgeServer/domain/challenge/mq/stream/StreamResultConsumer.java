package judgeServer.domain.challenge.mq.stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.stream.StreamListener;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

// stream 소비 인터페이스
public abstract class StreamResultConsumer<T>
        implements StreamListener<String, MapRecord<String, String, String>>, InitializingBean, DisposableBean {

    private static final String BUSY_GROUP = "BUSYGROUP";

    protected final Logger log = LoggerFactory.getLogger(getClass());

    private final RedisConnectionFactory connectionFactory;
    protected final StringRedisTemplate redisTemplate;

    private StreamMessageListenerContainer<String, MapRecord<String, String, String>> container;

    protected StreamResultConsumer(RedisConnectionFactory connectionFactory, StringRedisTemplate redisTemplate) {
        this.connectionFactory = connectionFactory;
        this.redisTemplate = redisTemplate;
    }

    /** 조율자가 결과를 싣는 스트림 키. */
    protected abstract String streamKey();

    /** 이 백엔드가 붙을 컨슈머 그룹. */
    protected abstract String consumerGroup();

    /** 결과를 담아둘 Redis 키 접두사 ({@code 접두사 + requestId}). */
    protected abstract String resultKeyPrefix();

    /** 담아둘 시간. */
    protected abstract Duration resultTtl();

    /** 원본 필드를 결과 메시지로 해석한다. 계약이 깨졌으면 예외를 던져도 된다. */
    protected abstract T parse(Map<String, String> fields);

    protected abstract String requestIdOf(T result);

    /** 로그 한 줄 요약. 서명된 URL 같은 민감한 값은 넣지 말 것. */
    protected abstract String logSummary(T result);

    /** 로그에 쓰는 이름 (예: "인스턴스 결과"). */
    protected abstract String resultName();

    /** 저장 직후 훅. 캐시 갱신처럼 결과별로 더 할 일이 있으면 여기서 한다. */
    protected void afterStored(T result, Map<String, String> fields) {
    }

    @Override
    public void afterPropertiesSet() {
        ensureGroup();

        StreamMessageListenerContainer.StreamMessageListenerContainerOptions<String, MapRecord<String, String, String>> options =
                StreamMessageListenerContainer.StreamMessageListenerContainerOptions.builder()
                        .pollTimeout(Duration.ofSeconds(1))
                        .build();

        container = StreamMessageListenerContainer.create(connectionFactory, options);
        container.receiveAutoAck(
                Consumer.from(consumerGroup(), "backend-" + UUID.randomUUID()),
                StreamOffset.create(streamKey(), ReadOffset.lastConsumed()),
                this);
        container.start();

        log.info("{} 소비 시작: stream={}, group={}", resultName(), streamKey(), consumerGroup());
    }

    private void ensureGroup() {
        try {
            redisTemplate.execute((RedisCallback<String>) connection ->
                    connection.streamCommands().xGroupCreate(
                            streamKey().getBytes(StandardCharsets.UTF_8), consumerGroup(), ReadOffset.from("0"), true));
            log.info("{} 컨슈머 그룹 생성: {} / {}", resultName(), streamKey(), consumerGroup());
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains(BUSY_GROUP)) {
                log.debug("{} 컨슈머 그룹 이미 존재: {} / {}", resultName(), streamKey(), consumerGroup());
            } else {
                log.warn("{} 컨슈머 그룹 생성 실패: {}", resultName(), e.getMessage());
            }
        }
    }

    @Override
    public void onMessage(MapRecord<String, String, String> message) {
        try {
            Map<String, String> fields = message.getValue();
            // 파싱은 검증 + requestId 추출용. 저장은 원본 필드 그대로 해시로 둔다.
            T result = parse(fields);

            String key = resultKeyPrefix() + requestIdOf(result);
            redisTemplate.opsForHash().putAll(key, fields);
            redisTemplate.expire(key, resultTtl());

            afterStored(result, fields);

            log.info("{} 저장: {}", resultName(), logSummary(result));
        } catch (Exception e) {
            log.error("{} 처리 실패 (id={}): {}", resultName(), message.getId(), e.getMessage(), e);
        }
    }

    @Override
    public void destroy() {
        if (container != null) {
            container.stop();
        }
    }
}
