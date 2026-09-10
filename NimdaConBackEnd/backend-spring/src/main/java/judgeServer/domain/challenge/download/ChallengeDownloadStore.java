package judgeServer.domain.challenge.download;

import judgeServer.domain.challenge.mq.consumer.CtfResultConsumer;
import judgeServer.domain.challenge.mq.message.CtfResultMessage;
import judgeServer.domain.challenge.mq.stream.StreamResultStore;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

// redis 캐싱 storage
@Service
public class ChallengeDownloadStore extends StreamResultStore<CtfResultMessage> {

    public ChallengeDownloadStore(StringRedisTemplate redisTemplate) {
        // 결과 스트림이 하나라 저장 위치도 하나다. 인스턴스 결과와 같은 접두사를 쓴다.
        super(redisTemplate, CtfResultConsumer.RESULT_KEY_PREFIX,
                CtfResultMessage::fromStreamFields);
    }
}
