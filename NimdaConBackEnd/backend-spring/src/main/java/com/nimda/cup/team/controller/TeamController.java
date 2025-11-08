package com.nimda.cup.team.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/team") // 팀 관련 API는 모두 /api/team으로 시작합니다.
@RequiredArgsConstructor
public class TeamController {

    // final TeamService teamService;

    /**
     * API가 작동 테스트
     */
    @GetMapping("/hello")
    public ResponseEntity<String> helloTeam() {
        return ResponseEntity.ok("Hello, Team API!");
    }
}
