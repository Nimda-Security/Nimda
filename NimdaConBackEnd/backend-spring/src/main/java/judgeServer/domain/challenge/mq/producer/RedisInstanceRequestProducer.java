package judgeServer.domain.challenge.mq.producer;

import judgeServer.config.CtfQueueProperties;
import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.mq.message.InstanceCreateMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Redis Stream(XADD) 기반 인스턴스 요청 발행자.
 *
 * <p>상관 ID(requestId)는 여기서 생성한다. 요청을 발행한 쪽이 이 ID를 쥐고 있어야
 * 나중에 돌아오는 결과와 짝지을 수 있기 때문이다.
 *
 * <p>스트림에 쌓인 엔트리는 자동 삭제되지 않는다. 트리밍(MAXLEN/XTRIM) 정책은 후속 작업이다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisInstanceRequestProducer implements InstanceRequestProducer {

    private final StringRedisTemplate redisTemplate;
    private final CtfQueueProperties queueProperties;

    @Override
    public String requestCreate(Challenge challenge, Long userId) {
        String requestId = UUID.randomUUID().toString();
        InstanceCreateMessage message = InstanceCreateMessage.of(challenge, userId, requestId);

        RecordId recordId = redisTemplate.opsForStream()
                .add(queueProperties.getStreamKey(), message.toStreamFields());

        log.info("인스턴스 생성 요청 발행: requestId={}, challengeCode={}, userId={}, recordId={}",
                requestId, challenge.getCode(), userId, recordId);

        return requestId;
    }
}
