package judgeServer.domain.submission.mq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisSubmissionProducer implements SubmissionProducer {

    private final StringRedisTemplate redisTemplate;
    private final JudgeQueueProperties queueProperties;

    @Override
    public void publish(SubmissionMessage message) {
        var recordId = redisTemplate.opsForStream()
                .add(queueProperties.getStreamKey(), message.toStreamFields());

        log.info("채점 요청 : submissionId={}, streamKey={}, recordId={}",
                message.getSubmissionId(), queueProperties.getStreamKey(), recordId);
    }
}