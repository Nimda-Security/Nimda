package com.nimda.con;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaAuditing
@EntityScan(basePackages = {"com.nimda.con.user.entity", "com.nimda.con.judge.entity"})
@EnableJpaRepositories(basePackages = {"com.nimda.con.user.repository", "com.nimda.con.judge.repository"})
public class NimdaConApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(NimdaConApplication.class, args);
    }
}
