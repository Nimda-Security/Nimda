package judgeServer.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * CTF 서버(Go 조율자)와 주고받는 Redis Stream 설정 (application.yml의 ctf.queue.*).
 *
 * 스트림에는 인스턴스 생성 요청(웹 백엔드 → 조율자)이 발행되고, 조율자는 같은 그룹의
 * 컨슈머로 이를 나눠 처리한다.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "ctf.queue")
public class CtfQueueProperties {

    private String streamKey = "ctf:instance:ops";
    private String consumerGroup = "ctf-provisioners";

    // 조율자가 인스턴스 생성 결과(host/port)를 돌려주는 스트림.
    private String resultStreamKey = "ctf:instance:results";
    private String resultConsumerGroup = "ctf-result-consumers";
}
