package com.nimda.cup.scoreboard.controller;

import com.nimda.cup.scoreboard.dto.ScoreboardResponseDTO;
import com.nimda.cup.scoreboard.service.ScoreboardService; 
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map; 

/**
 * 스코어보드 컨트롤러
 * - GET /api/scoreboard: 스코어보드 조회
 */
@RestController
@RequestMapping("/api/scoreboard")
public class ScoreboardController {
    
    private static final Logger logger = LoggerFactory.getLogger(ScoreboardController.class);
    
    @Autowired
    private ScoreboardService scoreboardService;
    
    /**
     * 스코어보드 조회 API
     * 
     * @return 스코어보드 데이터
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getScoreboard() {
        try {
            ScoreboardResponseDTO response = scoreboardService.getScoreboard(); // 서비스 로직 호출
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", response.getSuccess());
            result.put("message", response.getMessage()); 
            result.put("scoreboard", response.getScoreboard()); // 사용자별 스코어 정보
            result.put("problems", response.getProblems()); // 문제 메타 정보
            
            logger.info("스코어보드 조회 완료 - 사용자 수: {}", response.getScoreboard().size()); 
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("스코어보드 조회 중 오류 발생", e); 
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false); // 실패 표시
            errorResponse.put("message", "스코어보드 조회 중 오류가 발생했습니다: " + e.getMessage()); 
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}

