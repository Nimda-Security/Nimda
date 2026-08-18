package judgeServer.domain.challenge.mq.consumer;

import judgeServer.config.CtfQueueProperties;
import judgeServer.domain.challenge.mq.message.InstanceResultMessage;
import judgeServer.domain.challenge.mq.stream.StreamResultConsumer;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;

/**
 * 조율자(Go)가 인스턴스 생성 결과(host/port)를 결과 스트림에 발행하면, 이걸 소비해서
 * requestId 키로 Redis에 잠깐 저장한다. 인스턴스를 요청했던 사용자가 그 requestId로
 * 결과를 조회(폴링)하거나, 서브도메인 프록시가 접속 대상을 찾을 때 쓴다.
 *
 * <p>소비·저장 절차는 {@link StreamResultConsumer}가 갖고 있고, 여기서는 "어느 스트림을
 * 인스턴스 결과로 읽는지"만 정한다.
 */
@Component
public class InstanceResultConsumer extends StreamResultConsumer<InstanceResultMessage> {

    private static final Duration RESULT_TTL = Duration.ofMinutes(10);
    /** 사용자가 결과를 조회할 때 쓰는 키 접두사: ctf:instance:result:{requestId} */
    public static final String RESULT_KEY_PREFIX = "ctf:instance:result:";

    private final CtfQueueProperties props;

    public InstanceResultConsumer(RedisConnectionFactory connectionFactory,
                                  StringRedisTemplate redisTemplate,
                                  CtfQueueProperties props) {
        super(connectionFactory, redisTemplate);
        this.props = props;
    }

    @Override
    protected String streamKey() {
        return props.getResultStreamKey();
    }

    @Override
    protected String consumerGroup() {
        return props.getResultConsumerGroup();
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
    protected InstanceResultMessage parse(Map<String, String> fields) {
        return InstanceResultMessage.fromStreamFields(fields);
    }

    @Override
    protected String requestIdOf(InstanceResultMessage result) {
        return result.getRequestId();
    }

    @Override
    protected String logSummary(InstanceResultMessage result) {
        return String.format("requestId=%s, status=%s, host=%s, port=%s",
                result.getRequestId(), result.getStatus(), result.getHost(), result.getPort());
    }

    @Override
    protected String resultName() {
        return "인스턴스 결과";
    }
}
