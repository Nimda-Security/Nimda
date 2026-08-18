package judgeServer.domain.challenge.instance;

import judgeServer.domain.challenge.mq.consumer.InstanceResultConsumer;
import judgeServer.domain.challenge.mq.message.InstanceResultMessage;
import judgeServer.domain.challenge.mq.stream.StreamResultStore;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * ctf에서 받아온 인스턴스 정보는 접두사+requestId로 저장되어 만료되기 전까지 redis에 저장된다.
 * 읽는 방식은 다운로드 결과와 같아서 {@link StreamResultStore}가 담당하고, 여기서는
 * "어느 접두사에서 어떤 메시지로 읽을지"만 정한다.
 */
@Service
public class InstanceResultStore extends StreamResultStore<InstanceResultMessage> {

    public InstanceResultStore(StringRedisTemplate redisTemplate) {
        super(redisTemplate, InstanceResultConsumer.RESULT_KEY_PREFIX, InstanceResultMessage::fromStreamFields);
    }
}
