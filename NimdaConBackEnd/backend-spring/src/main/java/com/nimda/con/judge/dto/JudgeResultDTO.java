package com.nimda.con.judge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JudgeResultDTO {
    
    public enum Status {
        ACCEPTED,           // 정답
        WRONG_ANSWER,       // 오답
        TIME_LIMIT_EXCEEDED, // 시간 초과
        MEMORY_LIMIT_EXCEEDED, // 메모리 초과
        RUNTIME_ERROR,      // 런타임 에러
        COMPILATION_ERROR,  // 컴파일 에러
        SYSTEM_ERROR        // 시스템 에러
    }
    
    private Status status;
    private String message;
    private String output;
    private String errorOutput;
    private long executionTime; // milliseconds
    private long memoryUsage;   // bytes
    private int score;
    
    // 기본 생성자 명시적 추가
    public JudgeResultDTO() {}
    
    // 성공 결과 생성자
    public JudgeResultDTO(Status status, String output, long executionTime, long memoryUsage, int score) {
        this.status = status;
        this.output = output;
        this.executionTime = executionTime;
        this.memoryUsage = memoryUsage;
        this.score = score;
        this.message = "채점이 완료되었습니다.";
    }
    
    // 에러 결과 생성자
    public JudgeResultDTO(Status status, String message, String errorOutput) {
        this.status = status;
        this.message = message;
        this.errorOutput = errorOutput;
        this.score = 0;
    }
}
