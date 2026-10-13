package com.nimda.cite.actuator;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalManagementPort;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 컨테이너/배포 헬스체크가 의존하는 actuator 동작 검증.
 *
 * <p>확인 대상:
 * <ul>
 *   <li>readiness 프로브가 관리 포트에서 인증 없이 200/UP 을 반환한다
 *       (docker-compose healthcheck 와 deploy.sh 가 쿠키 없이 호출한다)</li>
 *   <li>health 외 엔드포인트는 노출되지 않는다</li>
 *   <li>응답에 내부 구성요소 상세가 노출되지 않는다 (show-details: never)</li>
 *   <li>애플리케이션 포트에서는 actuator 에 도달할 수 없다 (관리 포트 분리)</li>
 * </ul>
 */
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "management.server.port=0",
                "jwt.secret=dGVzdHNlY3JldHRlc3RzZWNyZXR0ZXN0c2VjcmV0dGVzdHNlY3JldHRlc3RzZWM="
        })
@ActiveProfiles("test")
class ActuatorHealthTest {

    @Autowired
    private TestRestTemplate rest;

    @LocalManagementPort
    private int managementPort;

    @LocalServerPort
    private int serverPort;

    private String mgmt(String path) {
        return "http://localhost:" + managementPort + path;
    }

    @Test
    @DisplayName("readiness 프로브가 인증 없이 200 UP 을 반환한다")
    void readinessProbeIsUpWithoutAuthentication() {
        ResponseEntity<String> response =
                rest.getForEntity(mgmt("/actuator/health/readiness"), String.class);

        assertThat(response.getStatusCode())
                .as("컨테이너 헬스체크는 쿠키 없이 호출하므로 200 이어야 한다")
                .isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("\"status\":\"UP\"");
    }

    @Test
    @DisplayName("liveness 프로브도 200 UP 을 반환한다")
    void livenessProbeIsUp() {
        ResponseEntity<String> response =
                rest.getForEntity(mgmt("/actuator/health/liveness"), String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("\"status\":\"UP\"");
    }

    @Test
    @DisplayName("health 응답에 내부 구성요소 상세가 노출되지 않는다")
    void healthResponseHidesDetails() {
        ResponseEntity<String> response =
                rest.getForEntity(mgmt("/actuator/health"), String.class);

        String body = response.getBody() == null ? "" : response.getBody();

        // show-details / show-components = never → 상태 문자열만
        assertThat(body)
                .as("DB 종류·연결 정보 등이 응답에 담기면 정보 노출이다 (실제 응답: %s)", body)
                .doesNotContain("components")
                .doesNotContain("database")
                .doesNotContain("H2");
    }

    @Test
    @DisplayName("health 외 actuator 엔드포인트는 노출되지 않는다")
    void onlyHealthEndpointIsExposed() {
        for (String path : new String[] {
                "/actuator/env", "/actuator/beans", "/actuator/configprops",
                "/actuator/mappings", "/actuator/loggers", "/actuator/threaddump" }) {

            ResponseEntity<String> response = rest.getForEntity(mgmt(path), String.class);

            assertThat(response.getStatusCode())
                    .as("%s 가 노출되면 설정·환경변수(비밀 포함)가 새어나간다", path)
                    .isNotEqualTo(HttpStatus.OK);
        }
    }

    @Test
    @DisplayName("애플리케이션 포트에서는 actuator 에 도달할 수 없다")
    void actuatorIsNotReachableOnApplicationPort() {
        ResponseEntity<String> response = rest.getForEntity(
                "http://localhost:" + serverPort + "/actuator/health", String.class);

        // nginx 는 애플리케이션 포트만 프록시하므로, 여기서 200 이면 외부 노출된다.
        assertThat(response.getStatusCode())
                .as("관리 포트 분리가 깨지면 /actuator 가 공개 인터넷에 노출된다")
                .isNotEqualTo(HttpStatus.OK);
    }
}
