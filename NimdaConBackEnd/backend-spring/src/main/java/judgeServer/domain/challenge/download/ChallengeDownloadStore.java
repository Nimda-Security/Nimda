package judgeServer.domain.challenge.download;

import judgeServer.domain.challenge.mq.consumer.ChallengeDownloadResultConsumer;
import judgeServer.domain.challenge.mq.message.ChallengeDownloadResultMessage;
import judgeServer.domain.challenge.mq.stream.StreamResultStore;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

// redis 캐싱 storage
@Service
public class ChallengeDownloadStore extends StreamResultStore<ChallengeDownloadResultMessage> {

    public ChallengeDownloadStore(StringRedisTemplate redisTemplate) {
        super(redisTemplate, ChallengeDownloadResultConsumer.RESULT_KEY_PREFIX,
                ChallengeDownloadResultMessage::fromStreamFields);
    }
}
