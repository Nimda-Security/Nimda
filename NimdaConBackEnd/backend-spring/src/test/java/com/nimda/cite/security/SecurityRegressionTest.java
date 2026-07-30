package com.nimda.cite.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * 심층 보안 점검에서 발견된 P0/P1 취약점에 대한 회귀 테스트.
 *
 * <p>각 테스트는 "수정 전이라면 실패하는" 형태로 작성되어 있다.
 */
@SpringBootTest(properties = {
        "judge.callback.secret=test-judge-callback-secret",
        "cors.allowed-origins=https://nimda.kr,https://*.nimda.kr"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityRegressionTest {

    private static final String JUDGE_SECRET = "test-judge-callback-secret";
    private static final String CALLBACK_PATH = "/api/judge/submission/result";
    private static final String CALLBACK_BODY = """
            {"submissionId":1,"status":"ACCEPTED","executionTimeMs":1,"usedMemoryKb":1}
            """;

    @Autowired
    private MockMvc mockMvc;

    // ── P0-1: 미인증 첨부 presigned URL 노출 ──

    @Test
    @DisplayName("P0-1: 비로그인 상태로 첨부 download-url 을 호출하면 인증을 요구한다")
    void attachmentDownloadUrlRequiresAuthentication() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/cite/attachments/1/download-url"))
                .andReturn();

        int status = result.getResponse().getStatus();

        // 수정 전에는 permitAll 이라 200(또는 컨트롤러 예외)이 나오면서
        // 임의의 attachmentId 에 대한 S3 presigned URL 이 발급되었다.
        assertThat(status)
                .as("비로그인 요청은 401/403 이어야 한다 (실제 status=%d)", status)
                .isIn(401, 403);
    }

    // ── P0-2: 채점 결과 콜백 위조 ──

    @Test
    @DisplayName("P0-2: 공유 시크릿 헤더 없이 채점 결과 콜백을 호출하면 401")
    void judgeCallbackWithoutSecretIsRejected() throws Exception {
        mockMvc.perform(post(CALLBACK_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CALLBACK_BODY))
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus())
                                .as("시크릿 없는 콜백은 401 이어야 한다")
                                .isEqualTo(401));
    }

    @Test
    @DisplayName("P0-2: 잘못된 공유 시크릿이면 401")
    void judgeCallbackWithWrongSecretIsRejected() throws Exception {
        mockMvc.perform(post(CALLBACK_PATH)
                        .header("X-Judge-Secret", "wrong-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CALLBACK_BODY))
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus()).isEqualTo(401));
    }

    @Test
    @DisplayName("P0-2: 올바른 공유 시크릿이면 필터를 통과해 컨트롤러까지 도달한다")
    void judgeCallbackWithCorrectSecretPassesFilter() {
        // 존재하지 않는 submissionId 이므로 서비스단에서 IllegalArgumentException 이 터진다.
        // "인증에서 막히지 않고 서비스 로직까지 도달했다"는 것이 시크릿 통과의 증거다.
        assertThatThrownBy(() -> mockMvc.perform(post(CALLBACK_PATH)
                .header("X-Judge-Secret", JUDGE_SECRET)
                .contentType(MediaType.APPLICATION_JSON)
                .content(CALLBACK_BODY)))
                .hasRootCauseInstanceOf(IllegalArgumentException.class)
                .rootCause()
                .hasMessageContaining("존재하지 않는 제출 건");
    }

    // ── P1: CORS 서드파티 와일드카드 제거 ──

    @Test
    @DisplayName("P1: 허용 목록에 없는 서드파티 Origin 은 CORS 허용 헤더를 받지 못한다")
    void disallowedOriginGetsNoCorsAllowHeader() throws Exception {
        MvcResult result = mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "https://attacker.vercel.app")
                        .header("Access-Control-Request-Method", "POST"))
                .andReturn();

        // 수정 전에는 https://*.vercel.app 이 allowCredentials=true 와 함께 허용되어
        // 임의의 Vercel 배포본이 인증 쿠키를 실은 교차 출처 요청을 보낼 수 있었다.
        assertThat(result.getResponse().getHeader("Access-Control-Allow-Origin"))
                .as("허용되지 않은 Origin 에는 Access-Control-Allow-Origin 이 없어야 한다")
                .isNull();
    }

    @Test
    @DisplayName("P1: 허용 목록의 Origin 은 정상적으로 CORS 를 통과한다")
    void allowedOriginGetsCorsAllowHeader() throws Exception {
        MvcResult result = mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "https://nimda.kr")
                        .header("Access-Control-Request-Method", "POST"))
                .andReturn();

        assertThat(result.getResponse().getHeader("Access-Control-Allow-Origin"))
                .as("허용된 Origin 은 CORS 를 통과해야 한다")
                .isEqualTo("https://nimda.kr");
    }

    // ── P1: 보안 응답 헤더 ──

    @Test
    @DisplayName("P1: API 응답에 보안 헤더가 설정된다")
    void securityHeadersArePresent() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/cite/attachments/1/download-url"))
                .andReturn();

        var response = result.getResponse();

        assertThat(response.getHeader("X-Content-Type-Options")).isEqualTo("nosniff");
        assertThat(response.getHeader("X-Frame-Options")).isEqualTo("DENY");
        assertThat(response.getHeader("Content-Security-Policy"))
                .contains("default-src 'none'");
        assertThat(response.getHeader("Permissions-Policy"))
                .contains("geolocation=()");
        assertThat(response.getHeader("Referrer-Policy")).isEqualTo("same-origin");
    }
}
