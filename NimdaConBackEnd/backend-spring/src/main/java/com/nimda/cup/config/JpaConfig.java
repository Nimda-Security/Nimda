package com.nimda.cup.config;

import org.springframework.boot.autoconfigure.orm.jpa.EntityManagerFactoryDependsOnPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * JPA와 Flyway의 초기화 순서를 보장하는 설정
 * EntityManagerFactory가 Flyway 이후에 초기화되도록 명시적으로 설정
 */
@Configuration
public class JpaConfig {

    /**
     * EntityManagerFactory가 Flyway 초기화 이후에 실행되도록 보장
     * 이렇게 하면 Flyway가 먼저 마이그레이션을 실행하고, 그 다음에 JPA가 초기화됩니다.
     */
    @Bean
    public static EntityManagerFactoryDependsOnPostProcessor entityManagerFactoryDependsOnPostProcessor() {
        return new EntityManagerFactoryDependsOnPostProcessor("flyway", "flywayInitializer");
    }
}
