package com.nimda.cite.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * P0-2 fail-closed 검증.
 *
 * <p>judge.callback.secret 이 비어 있으면 채점 결과 콜백은 열리지 않고 503 으로 거부되어야 한다.
 * 시크릿 설정을 잊고 배포했을 때 엔드포인트가 조용히 무인증 상태가 되는 것을 막는다.
 */
@SpringBootTest(properties = "judge.callback.secret=")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class JudgeCallbackFailClosedTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("P0-2: 시크릿 미설정 시 채점 콜백은 503 으로 거부된다 (fail-closed)")
    void callbackIsClosedWhenSecretIsNotConfigured() throws Exception {
        mockMvc.perform(post("/api/judge/submission/result")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"submissionId\":1,\"status\":\"ACCEPTED\"}"))
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus())
                                .as("시크릿 미설정 시 열려서는 안 된다")
                                .isEqualTo(503));
    }
}
