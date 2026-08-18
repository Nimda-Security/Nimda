package judgeServer.domain.challenge.mq.consumer;

import judgeServer.config.CtfQueueProperties;
import judgeServer.domain.challenge.mq.message.InstanceResultMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

/**
 * 조율자(Go)가 인스턴스 생성 결과(host/port)를 결과 스트림에 발행하면, 이걸 소비해서
 * requestId 키로 Redis에 잠깐 저장한다. 인스턴스를 요청했던 사용자가 그 requestId로
 * 결과를 조회(폴링)할 수 있게 하기 위함이다. (조회 API는 후속 작업)
 *
 * 결과 저장은 멱등하고 값싸므로 auto-ack로 소비한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InstanceResultConsumer
        implements StreamListener<String, MapRecord<String, String, String>>, InitializingBean, DisposableBean {

    private static final String BUSY_GROUP = "BUSYGROUP";
    private static final Duration RESULT_TTL = Duration.ofMinutes(10);
    /** 사용자가 결과를 조회할 때 쓰는 키 접두사: ctf:instance:result:{requestId} */
    public static final String RESULT_KEY_PREFIX = "ctf:instance:result:";

    private final RedisConnectionFactory connectionFactory;
    private final StringRedisTemplate redisTemplate;
    private final CtfQueueProperties props;

    private StreamMessageListenerContainer<String, MapRecord<String, String, String>> container;

    @Override
    public void afterPropertiesSet() {
        ensureGroup();

        StreamMessageListenerContainer.StreamMessageListenerContainerOptions<String, MapRecord<String, String, String>> options =
                StreamMessageListenerContainer.StreamMessageListenerContainerOptions.builder()
                        .pollTimeout(Duration.ofSeconds(1))
                        .build();

        container = StreamMessageListenerContainer.create(connectionFactory, options);
        container.receiveAutoAck(
                Consumer.from(props.getResultConsumerGroup(), "backend-" + UUID.randomUUID()),
                StreamOffset.create(props.getResultStreamKey(), ReadOffset.lastConsumed()),
                this);
        container.start();

        log.info("인스턴스 결과 소비 시작: stream={}, group={}",
                props.getResultStreamKey(), props.getResultConsumerGroup());
    }

    private void ensureGroup() {
        String stream = props.getResultStreamKey();
        String group = props.getResultConsumerGroup();
        try {
            redisTemplate.execute((RedisCallback<String>) connection ->
                    connection.streamCommands().xGroupCreate(
                            stream.getBytes(StandardCharsets.UTF_8), group, ReadOffset.from("0"), true));
            log.info("결과 컨슈머 그룹 생성: {} / {}", stream, group);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains(BUSY_GROUP)) {
                log.debug("결과 컨슈머 그룹 이미 존재: {} / {}", stream, group);
            } else {
                log.warn("결과 컨슈머 그룹 생성 실패: {}", e.getMessage());
            }
        }
    }

    @Override
    public void onMessage(MapRecord<String, String, String> message) {
        try {
            Map<String, String> fields = message.getValue();
            // 파싱은 검증 + requestId 추출용. 저장은 원본 필드 그대로 해시로 둔다.
            InstanceResultMessage result = InstanceResultMessage.fromStreamFields(fields);

            String key = RESULT_KEY_PREFIX + result.getRequestId();
            redisTemplate.opsForHash().putAll(key, fields);
            redisTemplate.expire(key, RESULT_TTL);

            log.info("인스턴스 결과 저장: requestId={}, status={}, host={}, port={}",
                    result.getRequestId(), result.getStatus(), result.getHost(), result.getPort());
        } catch (Exception e) {
            log.error("인스턴스 결과 처리 실패 (id={}): {}", message.getId(), e.getMessage(), e);
        }
    }

    @Override
    public void destroy() {
        if (container != null) {
            container.stop();
        }
    }
}
