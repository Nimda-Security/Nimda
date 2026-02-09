package com.nimda.cup;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Spring Boot 애플리케이션 기본 테스트
 * 애플리케이션이 정상적으로 시작되는지 확인합니다.
 * 
 * 테스트 프로파일을 사용하여 H2 인메모리 데이터베이스를 사용합니다.
 * 실제 MySQL 연결 없이 테스트가 가능합니다.
 */
@SpringBootTest
@ActiveProfiles("test") // 테스트 프로파일 활성화 (application-test.yml 사용)
class NimdaConApplicationTests {

    @Test
    void contextLoads() {
        // 애플리케이션 컨텍스트가 정상적으로 로드되는지 확인
        // H2 인메모리 데이터베이스를 사용하여 실제 MySQL 없이 테스트 가능
    }
}
