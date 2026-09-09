package judgeServer.domain.challenge.instance.Service;

import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.enums.IsolationType;
import judgeServer.domain.challenge.instance.Config.InstanceProperties;
import judgeServer.domain.challenge.instance.ObjectStatus.InstanceStatus;
import judgeServer.domain.challenge.instance.ObjectStatus.Status;
import judgeServer.domain.challenge.instance.Repository.InstanceResultStore;
import judgeServer.domain.challenge.instance.Proxy.SubdomainInstanceProxyFilter;
import judgeServer.domain.challenge.instance.Repository.InstanceStatusStore;
import judgeServer.domain.challenge.mq.message.ActionType;
import judgeServer.domain.challenge.mq.message.InstanceResultMessage;
import judgeServer.domain.challenge.mq.message.RequestStatus;
import judgeServer.domain.challenge.mq.producer.InstanceRequestProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import redis.util.RedisUtil;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InstanceService {

    private final InstanceRequestProducer producer;
    private final InstanceStatusStore instanceStatusStore;
    private final InstanceProperties instanceProperties;
    private final RedisUtil redisUtil;

    public String createInstance(Challenge challenge, Long userId) {
        // 인스턴스가 공유 | on-demand -> 이미 인스턴스가 만들어져 있다면 제공
        if(challenge.getIsolationType() == IsolationType.PER_USER || challenge.getIsolationType() == IsolationType.SHARED) {
            String uuid = UUID.randomUUID().toString();
            // 요청 객체 생성
            InstanceStatus instanceStatus = InstanceStatus.builder()
                    .status(Status.PENDING)
                    .errorMessage(null)
                    .resultUrl(null)
                    .build();
            // 인스턴스 상태 redis 저장
            instanceStatusStore.saveStatus(uuid, instanceStatus);

            // redis stream에 message 발행
            producer.requestCreate(challenge, userId, uuid, ActionType.CREATE);
            return uuid;
        }
        // todo SHARE인 경우는 아직 미구현
        return null;
    }

    /**
     * 접속 주소. baseDomain이 설정돼 있고 인스턴스가 READY일 때만 만들어진다.
     * 이 호스트로 들어온 요청은 {@link SubdomainInstanceProxyFilter}가 실제 컨테이너로 넘긴다.
     *
     * @param scheme      사용자가 플랫폼에 접속한 스킴 (http/https)
     * @param serverPort  사용자가 플랫폼에 접속한 포트
     */
    public String accessUrl(InstanceResultMessage result, String scheme, int serverPort) {
        String baseDomain = instanceProperties.getBaseDomain();
        if (result == null || result.getStatus() != RequestStatus.READY
                || baseDomain == null || baseDomain.isBlank()) {
            return null;
        }

        boolean defaultPort = ("http".equals(scheme) && serverPort == 80)
                || ("https".equals(scheme) && serverPort == 443);

        return scheme + "://" + instanceProperties.getSubdomainPrefix() + result.getRequestId()
                + "." + baseDomain + (defaultPort ? "" : ":" + serverPort);
    }
}
