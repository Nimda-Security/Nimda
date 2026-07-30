package com.nimda.cite.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * 채점 서버 → 백엔드 결과 콜백(POST /api/judge/submission/result) 전용 인증 필터.
 *
 * <p>이 엔드포인트는 채점 워커가 쿠키 없이 호출하므로 JWT 로 보호할 수 없다.
 * 그렇다고 열어두면 임의의 로그인 사용자가 다른 사람의 제출 결과(status/실행시간/에러메시지)를
 * 임의로 덮어쓸 수 있으므로, 공유 시크릿 헤더로 별도 인증한다.
 *
 * <p>동작 규칙:
 * <ul>
 *   <li>{@code judge.callback.secret} 미설정 → 항상 503 (fail-closed).
 *       시크릿을 잊고 배포했을 때 조용히 열리는 것을 막는다.</li>
 *   <li>헤더 불일치/누락 → 401</li>
 *   <li>비교는 {@link MessageDigest#isEqual}로 상수 시간 비교한다.</li>
 * </ul>
 */
@Component
public class JudgeCallbackAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JudgeCallbackAuthFilter.class);

    public static final String HEADER_NAME = "X-Judge-Secret";
    private static final String CALLBACK_PATH = "/api/judge/submission/result";

    @Value("${judge.callback.secret:}")
    private String callbackSecret;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return !(HttpMethod.POST.matches(request.getMethod())
                && CALLBACK_PATH.equals(request.getRequestURI()));
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        if (callbackSecret == null || callbackSecret.isBlank()) {
            log.error("judge.callback.secret 이 설정되지 않아 채점 결과 콜백을 거부했습니다. "
                    + "JUDGE_CALLBACK_SECRET 환경변수를 설정하세요.");
            writeError(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "채점 결과 콜백이 구성되지 않았습니다.");
            return;
        }

        String provided = request.getHeader(HEADER_NAME);
        if (provided == null || !constantTimeEquals(provided, callbackSecret)) {
            log.warn("채점 결과 콜백 인증 실패 (remoteAddr={})", request.getRemoteAddr());
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "채점 결과 콜백 인증에 실패했습니다.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static boolean constantTimeEquals(String provided, String expected) {
        return MessageDigest.isEqual(
                provided.getBytes(StandardCharsets.UTF_8),
                expected.getBytes(StandardCharsets.UTF_8));
    }

    private static void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\":false,\"message\":\"" + message + "\"}");
    }
}
