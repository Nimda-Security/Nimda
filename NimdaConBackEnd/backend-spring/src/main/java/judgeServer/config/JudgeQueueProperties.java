package judgeServer.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * CTF 서버와 주고받는 Redis Stream 설정 (application.yml의 judge.queue.*).
 *
 * 원래 submission.mq 패키지에 있었으나 알고리즘 채점 도메인을 지우면서 같이 사라졌다.
 * 스트림 자체는 계속 쓰기로 했으므로 이쪽으로 옮겨둔다.
 * 스트림/그룹 이름은 아직 알고리즘 채점 시절 값이며, 메시지 구조를 바꿀 때 같이 정리한다.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "judge.queue")
public class JudgeQueueProperties {

    private String streamKey = "judge:submissions";
    private String consumerGroup = "judge-workers";
}
