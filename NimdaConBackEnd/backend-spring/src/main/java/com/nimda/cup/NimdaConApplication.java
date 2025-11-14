package com.nimda.cup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaAuditing
@EntityScan(basePackages = {
        "com.nimda.cup.user.entity",
        "com.nimda.cup.judge.entity",
        "com.nimda.cup.word.entity",
        "com.nimda.cup.group.entity"
})
public class NimdaConApplication {

    public static void main(String[] args) {
        SpringApplication.run(NimdaConApplication.class, args);
    }
}
