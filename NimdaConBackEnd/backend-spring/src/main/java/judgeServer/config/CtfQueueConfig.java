package judgeServer.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * 기동 시 인스턴스 요청 스트림에 컨슈머 그룹을 만든다 (이미 있으면 그냥 넘어간다).
 * Go 조율자가 이 그룹의 컨슈머로 붙어 요청을 나눠 받는다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CtfQueueConfig implements ApplicationRunner {

    private static final String BUSY_GROUP_ERROR = "BUSYGROUP";

    private final StringRedisTemplate redisTemplate;
    private final CtfQueueProperties queueProperties;

    @Override
    public void run(ApplicationArguments args) {
        String streamKey = queueProperties.getStreamKey();
        String consumerGroup = queueProperties.getConsumerGroup();

        try {
            byte[] rawKey = streamKey.getBytes(StandardCharsets.UTF_8);
            redisTemplate.execute((org.springframework.data.redis.core.RedisCallback<String>) connection ->
                    connection.streamCommands().xGroupCreate(rawKey, consumerGroup, ReadOffset.from("0"), true));
            log.info("Consumer Group Create: streamKey={}, group={}", streamKey, consumerGroup);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains(BUSY_GROUP_ERROR)) {
                log.debug("Consumer Group is already exist: streamKey={}, group={}", streamKey, consumerGroup);
            } else {
                log.warn("Fail to create Consumer Group : streamKey={}, group={}", streamKey, consumerGroup, e);
            }
        }
    }
}
