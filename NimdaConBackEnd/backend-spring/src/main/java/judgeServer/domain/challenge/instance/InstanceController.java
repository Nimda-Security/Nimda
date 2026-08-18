package judgeServer.domain.challenge.instance;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.user.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.mq.message.InstanceResultMessage;
import judgeServer.domain.challenge.mq.message.InstanceStatus;
import judgeServer.domain.challenge.mq.producer.InstanceRequestProducer;
import judgeServer.domain.challenge.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;

/**
 * 사용자가 문제 인스턴스를 요청하고, 준비되면 그 화면을 (프록시로) 보는 API.
 *
 *   POST /api/ctf/instance/{code}            -> 인스턴스 생성 요청, requestId 반환
 *   GET  /api/ctf/instance/{requestId}       -> 상태/접속정보(host,port) 조회
 *   *    /api/ctf/instance/{requestId}/app/** -> 인스턴스로 리버스 프록시 (화면 열람)
 */
@RestController
@RequestMapping("/api/ctf/instance")
@RequiredArgsConstructor
public class InstanceController {

    private final ChallengeRepository challengeRepository;
    private final InstanceRequestProducer producer;
    private final InstanceResultStore resultStore;
    private final InstanceProxy proxy;

    /** 인스턴스 생성 요청을 큐에 발행하고, 결과를 짝지을 requestId를 돌려준다. */
    @PostMapping("/{code}")
    public ResponseEntity<?> create(@PathVariable String code,
                                    @AuthenticationPrincipal CustomUserDetails user) {
        Challenge challenge = challengeRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 문제입니다."));
        String requestId = producer.requestCreate(challenge, user.getUser().getId());
        return ApiResponse.ok(Map.of("requestId", requestId)).toResponse();
    }

    /** 인스턴스 준비 상태와 접속 정보를 조회한다 (준비 전이면 PENDING). */
    @GetMapping("/{requestId}")
    public ResponseEntity<?> status(@PathVariable String requestId,
                                    @AuthenticationPrincipal CustomUserDetails user) {
        InstanceResultMessage result = resultStore.find(requestId).orElse(null);
        if (result == null) {
            return ApiResponse.ok(Map.of("status", "PENDING")).toResponse();
        }
        checkOwner(result, user);
        return ApiResponse.ok(result).toResponse();
    }

    /**
     * (미리보기 전용) 경로 접두사 프록시. 화면을 열어 보는 정도만 되고, 문제 페이지가
     * "/login" 같은 절대경로나 JS로 경로를 만들면 깨진다. 완전한 상호작용은 서브도메인
     * 프록시(SubdomainInstanceProxyFilter, ADR-0011)를 쓴다.
     */
    @Deprecated
    @RequestMapping(value = "/{requestId}/app/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<byte[]> proxy(@PathVariable String requestId,
                                        @AuthenticationPrincipal CustomUserDetails user,
                                        HttpServletRequest request) throws IOException {
        InstanceResultMessage result = resultStore.find(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "인스턴스를 찾을 수 없습니다."));
        checkOwner(result, user);
        if (result.getStatus() != InstanceStatus.READY || result.getHost() == null || result.getPort() == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "인스턴스가 아직 준비되지 않았습니다.");
        }

        // /{requestId}/app/ 뒤의 경로만 잘라 인스턴스로 전달한다.
        String prefix = "/api/ctf/instance/" + requestId + "/app/";
        String uri = request.getRequestURI();
        String path = uri.length() > prefix.length() ? uri.substring(prefix.length()) : "";

        HttpHeaders headers = new HttpHeaders();
        if (request.getContentType() != null) {
            headers.set(HttpHeaders.CONTENT_TYPE, request.getContentType());
        }
        byte[] body = request.getInputStream().readAllBytes();
        return proxy.forward(result.getHost(), result.getPort(), path,
                request.getQueryString(), request.getMethod(), headers, body);
    }

    private void checkOwner(InstanceResultMessage result, CustomUserDetails user) {
        if (user == null || result.getUserId() == null
                || !result.getUserId().equals(user.getUser().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 인스턴스가 아닙니다.");
        }
    }
}
