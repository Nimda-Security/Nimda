package judgeServer.domain.challenge.instance;

import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.enums.IsolationType;
import judgeServer.domain.challenge.mq.message.InstanceResultMessage;
import judgeServer.domain.challenge.mq.message.InstanceStatus;
import judgeServer.domain.challenge.mq.producer.InstanceRequestProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

/**
 * 인스턴스 생성 요청과 조회를 담당한다.
 *
 * <p>컨테이너를 직접 띄우지 않는다. 요청을 큐에 싣고, "이 사용자가 이 문제로 무엇을 요청했는지"만
 * Redis에 기록해 둔다. 실제 생성은 Go 조율자가 하고, 결과(host/port)는
 * {@code InstanceResultConsumer}가 requestId 키로 저장한다.
 *
 * <pre>
 *   createInstance()  →  매핑 저장(userId:challengeId → requestId)  →  XADD
 *                                        │
 *   findInstance()  ─── 매핑으로 requestId 찾고 ──► 결과 조회 ──► accessUrl 안내
 * </pre>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InstanceService {

    private final InstanceRequestProducer producer;
    private final InstanceResultStore resultStore;
    private final InstanceProperties instanceProperties;

    /**
     * 인스턴스 생성을 요청하고 상관 ID(requestId)를 돌려준다.
     *
     * <p>이미 이 문제로 살아 있는(또는 생성 중인) 인스턴스가 있으면 새로 요청하지 않고 그 requestId를
     * 그대로 준다. 버튼을 여러 번 눌러도 컨테이너가 사용자 수보다 많이 뜨지 않게 하기 위함이다.
     * 직전 요청이 FAILED로 끝났을 때만 새로 요청한다.
     */
    public String createInstance(Challenge challenge, Long userId) {
        if (challenge.getIsolationType() == IsolationType.NONE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인스턴스를 띄우지 않는 문제입니다.");
        }

        Optional<String> reusable = findReusableRequestId(userId, challenge.getId());
        if (reusable.isPresent()) {
            log.info("인스턴스 재사용: userId={}, challengeCode={}, requestId={}",
                    userId, challenge.getCode(), reusable.get());
            return reusable.get();
        }

        // 상관 ID를 먼저 정하고 매핑부터 남긴다. 그래야 결과가 돌아오기 전에도 "이 사용자가 이 문제로
        // 무엇을 요청했는지" 문제 코드만으로 찾을 수 있다.
        String requestId = UUID.randomUUID().toString();
        resultStore.saveUserChallengeMapping(userId, challenge.getId(), requestId,
                instanceProperties.getMappingTtl());

        try {
            producer.requestCreate(challenge, userId, requestId);
        } catch (RuntimeException e) {
            // 발행에 실패하면 매핑만 남아 영영 PENDING으로 보이므로 되돌린다.
            resultStore.deleteUserChallengeMapping(userId, challenge.getId());
            throw e;
        }
        return requestId;
    }

    /** 이 사용자가 이 문제로 요청해 둔 requestId. 결과가 아직 안 왔어도(생성 중) 값이 있다. */
    public Optional<String> findRequestId(Long userId, Long challengeId) {
        return resultStore.findRequestId(userId, challengeId);
    }

    /** 이 사용자가 이 문제로 띄운 인스턴스 결과. 생성 중이거나 만료됐으면 empty. */
    public Optional<InstanceResultMessage> findInstance(Long userId, Long challengeId) {
        return resultStore.findByUserIdAndChallengeId(userId, challengeId);
    }

    /** requestId로 직접 조회 (생성 직후 폴링용). */
    public Optional<InstanceResultMessage> findByRequestId(String requestId) {
        return resultStore.find(requestId);
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
        if (result == null || result.getStatus() != InstanceStatus.READY
                || baseDomain == null || baseDomain.isBlank()) {
            return null;
        }

        boolean defaultPort = ("http".equals(scheme) && serverPort == 80)
                || ("https".equals(scheme) && serverPort == 443);

        return scheme + "://" + instanceProperties.getSubdomainPrefix() + result.getRequestId()
                + "." + baseDomain + (defaultPort ? "" : ":" + serverPort);
    }

    /**
     * 재사용할 수 있는 요청이 있으면 그 requestId.
     *
     * <ul>
     *   <li>매핑이 없다 → 새로 요청해야 한다.</li>
     *   <li>매핑은 있는데 결과가 없다 → 아직 생성 중(PENDING). 기다리면 되므로 재사용.</li>
     *   <li>READY → 살아 있는 인스턴스. 재사용.</li>
     *   <li>FAILED → 다시 시도해야 하므로 재사용하지 않는다.</li>
     * </ul>
     */
    private Optional<String> findReusableRequestId(Long userId, Long challengeId) {
        return resultStore.findRequestId(userId, challengeId)
                .filter(requestId -> resultStore.find(requestId)
                        .map(result -> result.getStatus() == InstanceStatus.READY)
                        .orElse(true));
    }
}
