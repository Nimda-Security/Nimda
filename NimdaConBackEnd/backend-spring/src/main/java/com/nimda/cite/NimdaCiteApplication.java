package com.nimda.cite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@EnableJpaAuditing
@EnableAsync // 알림 비동기 방식으로 처리
@SpringBootApplication
@ComponentScan(basePackages = {"com.nimda.cite", "judgeServer"})
@EnableJpaRepositories(basePackages = {"com.nimda.cite", "judgeServer"})
@EntityScan(basePackages = {"com.nimda.cite", "judgeServer"})
public class NimdaCiteApplication {
    public static void main(String[] args) {
        SpringApplication.run(NimdaCiteApplication.class, args);
    }
}
