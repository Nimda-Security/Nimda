package judgeServer.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

//CTF 서버(Go 조율자)와 주고받는 Redis Stream 설정 (application.yml의 ctf.queue.*).
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "ctf.queue")
public class CtfQueueProperties {
    private String streamKey = "ctf:request:ops";
    private String consumerGroup = "ctf-provisioners";

    // 조율자가 결과(host/port 또는 downloadUrl)를 돌려주는 스트림.
    private String resultStreamKey = "ctf:request:results";
    private String resultConsumerGroup = "ctf-result-consumers";
}
