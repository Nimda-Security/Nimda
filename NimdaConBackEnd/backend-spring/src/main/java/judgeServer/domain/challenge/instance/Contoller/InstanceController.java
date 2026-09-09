package judgeServer.domain.challenge.instance.Contoller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.user.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import judgeServer.domain.challenge.entity.Challenge;
import judgeServer.domain.challenge.enums.ChallengeCategory;
import judgeServer.domain.challenge.instance.Proxy.InstanceProxy;
import judgeServer.domain.challenge.instance.Service.InstanceService;
import judgeServer.domain.challenge.mq.message.InstanceResultMessage;
import judgeServer.domain.challenge.mq.message.RequestStatus;
import judgeServer.domain.challenge.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.http.protocol.HTTP;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 동적 인스턴스 접근 컨트롤러.
 *
 * <pre>
 *   POST /api/ctf/instance/{code}              생성 요청 → requestId
 *   GET  /api/ctf/instance/{code}              이 문제로 내가 띄운 인스턴스 (문제 페이지에서 씀)
 *   GET  /api/ctf/instance/status/{requestId}  생성 직후 폴링
 * </pre>
 *
 * 문제 코드와 requestId는 둘 다 한 조각 경로라 같은 자리에 둘 수 없다(매핑 충돌). 그래서
 * requestId 조회는 {@code /status/} 아래로 내린다.
 */
@RestController
@RequestMapping("/api/ctf/instance")
@RequiredArgsConstructor
public class InstanceController {

    private final ChallengeRepository challengeRepository;
    private final InstanceService instanceService;
    private final InstanceProxy proxy;

    // 컨테이너 생성 요청
    @PostMapping("/{code}")
    public ResponseEntity<?> create(@PathVariable String code,
                                    @AuthenticationPrincipal CustomUserDetails user) {
        Challenge challenge = challengeRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if(challenge.getCategory() != ChallengeCategory.WEB) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 문제는 인스턴스 기능을 지원하지 않습니다.");
        }

        String requestId = instanceService.createInstance(challenge, currentUserId(user));
        return ApiResponse.ok(Map.of("requestId", requestId)).toResponse();
    }

    /**
     * 이 문제에 대해 내가 띄운 인스턴스 정보. 문제 페이지를 열 때마다 호출하면 되고,
     * 새로고침하거나 다른 기기에서 들어와도 requestId를 몰라도 이어서 볼 수 있다.
     *
     * <ul>
     *   <li>요청한 적 없음 → {@code hasInstance:false}</li>
     *   <li>요청했지만 결과 대기 중 → {@code hasInstance:true, status:"PENDING"}</li>
     *   <li>결과 있음 → 상태/주소 전체</li>
     * </ul>
     */
    /*
    @GetMapping("/{code}")
    public ResponseEntity<?> myInstance(@PathVariable String code,
                                        @AuthenticationPrincipal CustomUserDetails user,
                                        HttpServletRequest request) {
        Challenge challenge = findChallenge(code);
        Long userId = currentUserId(user);

        String requestId = instanceService.findRequestId(userId, challenge.getId()).orElse(null);
        if (requestId == null) {
            return ApiResponse.ok(Map.of("hasInstance", false)).toResponse();
        }

        InstanceResultMessage result = instanceService.findByRequestId(requestId).orElse(null);
        if (result == null) {
            // 매핑은 있는데 결과가 없다 = 조율자가 아직 만들고 있는 중.
            return ApiResponse.ok(Map.of(
                    "hasInstance", true,
                    "requestId", requestId,
                    "status", "PENDING")).toResponse();
        }

        Map<String, Object> view = toView(result, request);
        view.put("hasInstance", true);
        return ApiResponse.ok(view).toResponse();
    }

    // 인스턴스 상태 조회 api (생성 직후 폴링)
    @GetMapping("/status/{requestId}")
    public ResponseEntity<?> status(@PathVariable String requestId,
                                    @AuthenticationPrincipal CustomUserDetails user,
                                    HttpServletRequest request) {
        InstanceResultMessage result = instanceService.findByRequestId(requestId).orElse(null);
        if (result == null) {
            return ApiResponse.ok(Map.of("status", "PENDING")).toResponse();
        }
        checkOwner(result, user);
        return ApiResponse.ok(toView(result, request)).toResponse();
    }
 */
    // 결과 메시지 객체화
    private Map<String, Object> toView(InstanceResultMessage result, HttpServletRequest request) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("requestId", result.getRequestId());
        view.put("challengeCode", result.getChallengeCode());
        view.put("status", result.getStatus());
        view.put("host", result.getHost());
        view.put("port", result.getPort());
        view.put("expiresAt", result.getExpiresAt());
        view.put("message", result.getMessage());
        view.put("accessUrl", instanceService.accessUrl(result, request.getScheme(), request.getServerPort()));
        return view;
    }

    // ------------------------------helper--------

    private Challenge findChallenge(String code) {
        return challengeRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 문제입니다."));
    }

    private Long currentUserId(CustomUserDetails user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return user.getUser().getId();
    }

    /**
     * (미리보기 전용) 경로 접두사 프록시. 화면을 열어 보는 정도만 되고, 문제 페이지가
     * "/login" 같은 절대경로나 JS로 경로를 만들면 깨진다. 완전한 상호작용은 서브도메인
     * 프록시(SubdomainInstanceProxyFilter, ADR-0011)를 쓴다.
     */
    /*
    @Deprecated
    @RequestMapping(value = "/{requestId}/app/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<byte[]> proxy(@PathVariable String requestId,
                                        @AuthenticationPrincipal CustomUserDetails user,
                                        HttpServletRequest request) throws IOException {
        InstanceResultMessage result = instanceService.findByRequestId(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "인스턴스를 찾을 수 없습니다."));
        checkOwner(result, user);
        if (result.getStatus() != RequestStatus.READY || result.getHost() == null || result.getPort() == null) {
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
     */
}
