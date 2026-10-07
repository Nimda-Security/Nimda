package judgeServer.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
todo 문제마다 ttl 설정하는 기능이 있다면 추가해야 함
 **/
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "ctf.ttl")
public class CtfTtlProperties {

    // 조율자 결과(ctf:result:{uuid}) 보관 시간. 사용자가 폴링으로 가져갈 때까지만 있으면 된다.
    private Duration result = Duration.ofMinutes(10);

    // uuid → {userId, challengeCode} 요청 매핑. 결과를 받아 처리할 때까지 필요하므로 result보다 넉넉히.
    private Duration owner = Duration.ofMinutes(30);

    // 인스턴스 상태(ctf:instance:status{uuid}) 보관 시간.
    private Duration status = Duration.ofMinutes(10);

    // userId:challengeId → requestId 매핑. todo 미구현
    private Duration mapping = Duration.ofMinutes(30);
}
