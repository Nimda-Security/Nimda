package judgeServer.domain.challenge.mq.producer;

import judgeServer.config.CtfQueueProperties;
import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.mq.message.ChallengeDownloadMessage;
import judgeServer.domain.challenge.mq.message.InstanceCreateMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

/**
 * CTF 서버(Go 조율자)로 나가는 요청을 Redis Stream(XADD)에 싣는 발행자.
 *
 * <p>인스턴스 생성이든 첨부파일 다운로드든 발행 절차가 같다 — 상관 ID(requestId)를 만들고,
 * 메시지를 field-value 맵으로 펴서, 그 요청이 가야 할 스트림에 XADD한다. 요청 종류마다
 * 달라지는 건 <b>어떤 메시지를 어느 스트림에</b> 넣느냐뿐이라 한 클래스에서 처리한다.
 *
 * <p>상관 ID를 발행하는 쪽에서 만드는 이유는, 요청한 쪽이 그 ID를 쥐고 있어야 나중에 돌아오는
 * 결과와 짝지을 수 있기 때문이다.
 *
 * <p>스트림에 쌓인 엔트리는 자동 삭제되지 않는다. 트리밍(MAXLEN/XTRIM) 정책은 후속 작업이다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisCtfRequestProducer implements InstanceRequestProducer, ChallengeDownloadProducer {

    private final StringRedisTemplate redisTemplate;
    private final CtfQueueProperties queueProperties;

    @Override
    public String requestCreate(Challenge challenge, Long userId) {
        String requestId = UUID.randomUUID().toString();
        publish(queueProperties.getStreamKey(),
                InstanceCreateMessage.of(challenge, userId, requestId).toStreamFields(),
                "인스턴스 생성", requestId, challenge, userId);
        return requestId;
    }

    @Override
    public String requestDownload(Challenge challenge, Long userId) {
        String requestId = UUID.randomUUID().toString();
        publish(queueProperties.getDownloadStreamKey(),
                ChallengeDownloadMessage.of(challenge, userId, requestId).toStreamFields(),
                "첨부파일 다운로드", requestId, challenge, userId);
        return requestId;
    }

    private void publish(String streamKey, Map<String, String> fields, String what,
                         String requestId, Challenge challenge, Long userId) {
        RecordId recordId = redisTemplate.opsForStream().add(streamKey, fields);

        log.info("{} 요청 발행: requestId={}, challengeCode={}, userId={}, stream={}, recordId={}",
                what, requestId, challenge.getCode(), userId, streamKey, recordId);
    }
}
