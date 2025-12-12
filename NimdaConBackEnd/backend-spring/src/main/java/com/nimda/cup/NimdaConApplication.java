package com.nimda.cup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaAuditing
@ComponentScan(basePackages = { "com.nimda.cup", "com.nimda.cite" })  //  컨트롤러 스캔 추가
@EntityScan(basePackages = { "com.nimda.cup.user.entity", "com.nimda.cup.judge.entity", "com.nimda.cup.word.entity",
        "com.nimda.cup.contest.entity", "com.nimda.cup.group.entity", "com.nimda.cite.board.entity" })
@EnableJpaRepositories(basePackages = { "com.nimda.cup.user.repository", "com.nimda.cup.judge.repository",
        "com.nimda.cup.word.repository", "com.nimda.cup.contest.repository", "com.nimda.cup.group.repository",
        "com.nimda.cite.board.repository" })
public class NimdaConApplication {

    public static void main(String[] args) {
        SpringApplication.run(NimdaConApplication.class, args);
    }
}
