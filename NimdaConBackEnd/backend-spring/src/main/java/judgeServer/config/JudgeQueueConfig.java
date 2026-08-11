package judgeServer.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class JudgeQueueConfig implements ApplicationRunner {

    private static final String BUSY_GROUP_ERROR = "BUSYGROUP";

    private final StringRedisTemplate redisTemplate;
    private final JudgeQueueProperties queueProperties;

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