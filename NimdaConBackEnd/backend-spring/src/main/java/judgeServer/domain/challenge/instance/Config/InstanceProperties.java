package judgeServer.domain.challenge.instance.Config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * 인스턴스 서브도메인 접근 설정 (application.yml의 ctf.instance.*).
 *
 * 인스턴스는 inst-{token}.{baseDomain} 형태의 호스트로 접근한다. baseDomain이 비어 있으면
 * 서브도메인 프록시 기능이 꺼진 것으로 보고 아무 요청도 가로채지 않는다(기본값).
 *
 * 예)
 *   운영:  base-domain: nimda.kr           -> inst-abc123.nimda.kr
 *   개발:  base-domain: 127.0.0.1.nip.io   -> inst-abc123.127.0.0.1.nip.io (실제 DNS 불필요)
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "ctf.instance")
public class InstanceProperties {

    /** inst-{token} 뒤에 붙는 도메인. 비어 있으면 서브도메인 프록시 비활성. */
    private String baseDomain = "";

    /** 서브도메인 접두사. */
    private String subdomainPrefix = "inst-";

    /**
     * "이 사용자가 이 문제로 띄운 인스턴스" 매핑(userId:challengeId → requestId)을 들고 있는 시간.
     *
     * <p>인스턴스 결과 자체의 보관 시간(InstanceResultConsumer.RESULT_TTL)보다 짧으면, 결과는
     * 살아 있는데 문제 코드로는 못 찾는 상태가 된다. 그래서 결과 TTL보다 넉넉하게 잡는다.
     */
    private Duration mappingTtl = Duration.ofMinutes(30);
}
