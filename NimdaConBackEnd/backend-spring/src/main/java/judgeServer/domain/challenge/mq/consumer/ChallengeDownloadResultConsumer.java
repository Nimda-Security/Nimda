package judgeServer.domain.challenge.mq.consumer;

import judgeServer.config.CtfQueueProperties;
import judgeServer.domain.challenge.download.ChallengeDownloadUrlCache;
import judgeServer.domain.challenge.mq.message.ChallengeDownloadResultMessage;
import judgeServer.domain.challenge.mq.message.DownloadStatus;
import judgeServer.domain.challenge.mq.stream.StreamResultConsumer;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;

@Component
public class ChallengeDownloadResultConsumer extends StreamResultConsumer<ChallengeDownloadResultMessage> {

    private static final Duration RESULT_TTL = Duration.ofMinutes(10);
    /** 사용자가 결과를 조회할 때 쓰는 키 접두사: ctf:challenge:download:result:{requestId} */
    public static final String RESULT_KEY_PREFIX = "ctf:challenge:download:result:";

    private final CtfQueueProperties props;
    private final ChallengeDownloadUrlCache urlCache;

    public ChallengeDownloadResultConsumer(RedisConnectionFactory connectionFactory,
                                           StringRedisTemplate redisTemplate,
                                           CtfQueueProperties props,
                                           ChallengeDownloadUrlCache urlCache) {
        super(connectionFactory, redisTemplate);
        this.props = props;
        this.urlCache = urlCache;
    }

    @Override
    protected String streamKey() {
        return props.getDownloadResultStreamKey();
    }

    @Override
    protected String consumerGroup() {
        return props.getDownloadResultConsumerGroup();
    }

    @Override
    protected String resultKeyPrefix() {
        return RESULT_KEY_PREFIX;
    }

    @Override
    protected Duration resultTtl() {
        return RESULT_TTL;
    }

    @Override
    protected ChallengeDownloadResultMessage parse(Map<String, String> fields) {
        return ChallengeDownloadResultMessage.fromStreamFields(fields);
    }

    @Override
    protected String requestIdOf(ChallengeDownloadResultMessage result) {
        return result.getRequestId();
    }

    // redis caching
    @Override
    protected void afterStored(ChallengeDownloadResultMessage result, Map<String, String> fields) {
        if (result.getStatus() == DownloadStatus.READY && result.getUrl() != null) {
            urlCache.put(result.getChallengeCode(), result.getUrl(), result.getExpiresAt());
        }
    }

    @Override
    protected String logSummary(ChallengeDownloadResultMessage result) {
        return String.format("requestId=%s, status=%s, expiresAt=%s",
                result.getRequestId(), result.getStatus(), result.getExpiresAt());
    }

    @Override
    protected String resultName() {
        return "다운로드 결과";
    }
}
