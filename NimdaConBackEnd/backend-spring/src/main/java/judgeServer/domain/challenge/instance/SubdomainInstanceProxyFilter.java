package judgeServer.domain.challenge.instance;

import com.nimda.cite.user.security.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import judgeServer.domain.challenge.mq.message.InstanceResultMessage;
import judgeServer.domain.challenge.mq.message.InstanceStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * inst-{token}.{baseDomain} 로 들어온 요청을, 그 token이 가리키는 문제 인스턴스로 프록시한다.
 *
 * 이 필터는 시큐리티 체인에서 JWT 인증 필터 "직후"에 실행되도록 SecurityConfig에서 끼운다.
 * 그래서 SecurityContext에는 이미 로그인 사용자가 채워져 있고, 여기서 소유권을 확인할 수 있다.
 *
 * 흐름:
 *   1) Host가 인스턴스 서브도메인이 아니면 → 그냥 통과(평소 앱/인가 규칙대로).
 *   2) 맞으면 token으로 인스턴스(host/port/소유자)를 조회.
 *   3) 준비 안 됨 → 503, 로그인 안 함 → 401, 소유자 아님 → 403.
 *   4) 통과하면 인스턴스로 프록시하고 체인을 더 진행하지 않는다(문제 트래픽은 여기서 끝).
 */
@Slf4j
@RequiredArgsConstructor
public class SubdomainInstanceProxyFilter extends OncePerRequestFilter {

    private final InstanceProperties props;
    private final InstanceResultStore resultStore;
    private final InstanceProxy proxy;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        Optional<String> tokenOpt = ChallengeHost.token(
                request.getHeader(HttpHeaders.HOST), props.getSubdomainPrefix(), props.getBaseDomain());
        if (tokenOpt.isEmpty()) {
            chain.doFilter(request, response); // 인스턴스 서브도메인 아님 → 평소대로
            return;
        }
        String token = tokenOpt.get();

        InstanceResultMessage instance = resultStore.find(token).orElse(null);
        if (instance == null || instance.getStatus() != InstanceStatus.READY
                || instance.getHost() == null || instance.getPort() == null) {
            response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE, "인스턴스가 준비되지 않았습니다.");
            return;
        }

        // ── 소유권 검사 ──────────────────────────────────────────────────
        Long userId = currentUserId();
        if (userId == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "로그인이 필요합니다.");
            return;
        }
        if (!userId.equals(instance.getUserId())) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "본인 인스턴스가 아닙니다.");
            return;
        }

        // ── 프록시 ───────────────────────────────────────────────────────
        // 서브도메인 루트에서 서비스되므로 요청 경로를 그대로 인스턴스에 전달한다.
        String path = request.getRequestURI();
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        byte[] body = request.getInputStream().readAllBytes();

        ResponseEntity<byte[]> upstream = proxy.forward(
                instance.getHost(), instance.getPort(), path, request.getQueryString(),
                request.getMethod(), copyRequestHeaders(request), body);

        writeResponse(response, upstream);
        // 체인을 더 진행하지 않는다: 문제 트래픽은 프록시로 끝낸다.
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return null;
        }
        return userDetails.getUser().getId();
    }

    private HttpHeaders copyRequestHeaders(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> names = request.getHeaderNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            headers.put(name, Collections.list(request.getHeaders(name)));
        }
        return headers;
    }

    private void writeResponse(HttpServletResponse response, ResponseEntity<byte[]> upstream) throws IOException {
        response.setStatus(upstream.getStatusCode().value());
        for (Map.Entry<String, List<String>> e : upstream.getHeaders().entrySet()) {
            for (String v : e.getValue()) {
                response.addHeader(e.getKey(), v);
            }
        }
        byte[] body = upstream.getBody();
        if (body != null) {
            response.getOutputStream().write(body);
        }
    }
}
