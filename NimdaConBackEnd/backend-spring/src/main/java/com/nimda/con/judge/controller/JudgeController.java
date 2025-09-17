package com.nimda.con.judge.controller;

import com.nimda.con.judge.dto.JudgeResultDTO;
import com.nimda.con.judge.dto.SubmissionDTO;
import com.nimda.con.judge.service.JudgeService;
import com.nimda.con.common.util.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/judge")
@CrossOrigin(origins = "*")
public class JudgeController {
    
    private static final Logger logger = LoggerFactory.getLogger(JudgeController.class);
    
    @Autowired
    private JudgeService judgeService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * 코드 제출 및 채점
     * @param submission 제출된 코드 정보
     * @return 채점 결과
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitCode(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody SubmissionDTO submission) {
        try {
            String username = "익명"; // 기본값
            
            // Authorization 헤더가 있으면 토큰에서 사용자 추출
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7); // "Bearer " 제거
                
                try {
                    // JwtUtil로 사용자명 추출
                    String tokenUsername = jwtUtil.extractUsername(token);
                    if (tokenUsername != null && !jwtUtil.isTokenExpired(token)) {
                        username = tokenUsername;
                    } else {
                        logger.warn("만료된 토큰으로 제출 시도");
                    }
                } catch (Exception e) {
                    logger.warn("유효하지 않은 토큰으로 제출 시도: {}", e.getMessage());
                }
            }
            
            logger.info("코드 제출 요청 - 사용자: {}, 언어: {}, 제목: {}", username, submission.getLanguage(), submission.getTitle());
            
            // 코드 채점 실행
            JudgeResultDTO result = judgeService.judgeCode(submission);
            
            // 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "채점이 완료되었습니다.");
            response.put("result", result);
            response.put("submittedBy", username); // 제출자 정보 포함
            
            logger.info("채점 완료 - 사용자: {}, 상태: {}, 점수: {}", username, result.getStatus(), result.getScore());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("채점 중 오류 발생", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "채점 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.put("result", new JudgeResultDTO(
                JudgeResultDTO.Status.SYSTEM_ERROR,
                "시스템 오류",
                e.getMessage()
            ));
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * 지원하는 언어 목록 조회
     * @return 지원 언어 목록
     */
    @GetMapping("/languages")
    public ResponseEntity<Map<String, Object>> getSupportedLanguages() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("languages", new String[]{"Java", "C++17"});
        response.put("message", "지원하는 언어 목록입니다.");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 채점 시스템 상태 확인
     * @return 시스템 상태 정보
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getJudgeSystemStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Java 컴파일러 확인
            ProcessBuilder javaCheck = new ProcessBuilder("javac", "-version");
            Process javaProcess = javaCheck.start();
            boolean javaAvailable = javaProcess.waitFor() == 0;
            
            // G++ 컴파일러 확인
            ProcessBuilder gppCheck = new ProcessBuilder("g++", "--version");
            Process gppProcess = gppCheck.start();
            boolean gppAvailable = gppProcess.waitFor() == 0;
            
            Map<String, Boolean> compilers = new HashMap<>();
            compilers.put("java", javaAvailable);
            compilers.put("g++", gppAvailable);
            
            response.put("success", true);
            response.put("compilers", compilers);
            response.put("message", "채점 시스템이 정상 작동 중입니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("시스템 상태 확인 중 오류", e);
            
            response.put("success", false);
            response.put("message", "시스템 상태 확인 실패: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * 테스트용 간단한 채점 API
     * @return 테스트 결과
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testJudge() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Java Hello World 테스트
            SubmissionDTO testSubmission = new SubmissionDTO();
            testSubmission.setTitle("테스트 문제");
            testSubmission.setLanguage("Java");
            testSubmission.setCode(
                "import java.util.Scanner;\n" +
                "public class Solution {\n" +
                "    public static void main(String[] args) {\n" +
                "        Scanner sc = new Scanner(System.in);\n" +
                "        int a = sc.nextInt();\n" +
                "        int b = sc.nextInt();\n" +
                "        System.out.println(a + b);\n" +
                "    }\n" +
                "}"
            );
            
            JudgeResultDTO result = judgeService.judgeCode(testSubmission);
            
            response.put("success", true);
            response.put("message", "테스트 채점이 완료되었습니다.");
            response.put("result", result);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("테스트 채점 중 오류", e);
            
            response.put("success", false);
            response.put("message", "테스트 실패: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
