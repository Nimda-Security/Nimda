package judgeServer.domain.submission.mq;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 채점 큐(Redis Stream) 관련 설정.
 * 채점 서버(consumer)는 동일한 stream-key / consumer-group 값을 사용해야 한다.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "judge.queue")
public class JudgeQueueProperties {

    /** 제출물이 발행되는 Redis Stream 키 */
    private String streamKey = "judge:submissions";

    /** 채점 서버(consumer)들이 속할 Consumer Group 이름 */
    private String consumerGroup = "judge-workers";
}