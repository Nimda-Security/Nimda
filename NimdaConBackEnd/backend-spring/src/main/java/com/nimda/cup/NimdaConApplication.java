package com.nimda.cup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaAuditing
@ComponentScan(basePackages = { "com.nimda.cup", "com.nimda.cite" })
@EntityScan(basePackages = { "com.nimda.cup", "com.nimda.cite" })
@EnableJpaRepositories(basePackages = { "com.nimda.cup", "com.nimda.cite" })
public class NimdaConApplication {

    public static void main(String[] args) {
        SpringApplication.run(NimdaConApplication.class, args);
    }
}
