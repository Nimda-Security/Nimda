package com.nimda.cup.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.core.annotation.Order;

/**
 * Flyway와 JPA의 순환 의존성 문제 해결을 위한 설정
 * Flyway가 EntityManagerFactory보다 먼저 실행되도록 보장
 */
@Configuration
@Order(1) // 가장 먼저 실행되도록 설정
public class FlywayConfig {

    /**
     * Flyway 초기화를 명시적으로 처리
     * 이 Bean이 먼저 초기화되도록 보장하여 순환 의존성 방지
     */
    @Bean
    @DependsOn("flyway")
    public FlywayMigrationInitializer flywayInitializer() {
        // Flyway가 이미 자동으로 초기화되므로, 여기서는 순서만 보장
        return new FlywayMigrationInitializer(null, null);
    }
}
