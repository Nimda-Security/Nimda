package com.nimda.cite.actuator;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalManagementPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Redis 장애가 무중단 배포를 막지 않는다는 설계 결정에 대한 검증.
 *
 * <p>readiness 그룹은 {@code readinessState,db} 만 포함한다. Redis 는 메일 인증코드
 * 저장과 채점 큐에 쓰이므로 중요하지만, Redis 가 죽었을 때 배포 자체가 차단되면
 * 오히려 복구가 어려워진다. 따라서 Redis 는 readiness 에서 제외하고 전체
 * {@code /actuator/health} 에서만 반영한다.
 *
 * <p>이 테스트는 Redis 포트를 죽은 포트로 지정해 그 동작을 실제로 확인한다.
 */
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "management.server.port=0",
                // 리스닝하지 않는 포트 → Redis 헬스 인디케이터가 DOWN 이 된다
                "spring.data.redis.host=127.0.0.1",
                "spring.data.redis.port=6399",
                "spring.data.redis.timeout=300ms",
                "spring.data.redis.connect-timeout=300ms",
                "jwt.secret=dGVzdHNlY3JldHRlc3RzZWNyZXR0ZXN0c2VjcmV0dGVzdHNlY3JldHRlc3NlYw=="
        })
@ActiveProfiles("test")
class ActuatorReadinessExcludesRedisTest {

    @Autowired
    private TestRestTemplate rest;

    @LocalManagementPort
    private int managementPort;

    private String mgmt(String path) {
        return "http://localhost:" + managementPort + path;
    }

    @Test
    @DisplayName("Redis 가 죽어 있어도 readiness 는 200 UP — 배포가 차단되지 않는다")
    void readinessStaysUpWhenRedisIsDown() {
        ResponseEntity<String> response =
                rest.getForEntity(mgmt("/actuator/health/readiness"), String.class);

        assertThat(response.getStatusCode())
                .as("Redis 장애가 readiness 를 끌어내리면 무중단 배포가 막혀버린다 "
                        + "(readiness 그룹에 redis 가 포함됐는지 확인)")
                .isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("\"status\":\"UP\"");
    }

    @Test
    @DisplayName("전체 health 는 Redis 장애를 반영한다 — 모니터링용 신호는 유지")
    void overallHealthReflectsRedisOutage() {
        ResponseEntity<String> response =
                rest.getForEntity(mgmt("/actuator/health"), String.class);

        // Redis 가 DOWN 이므로 전체 집계는 DOWN(503). 즉 장애가 숨겨지지 않는다.
        assertThat(response.getStatusCode())
                .as("전체 health 까지 UP 이면 Redis 장애를 관측할 수 없게 된다")
                .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }
}
