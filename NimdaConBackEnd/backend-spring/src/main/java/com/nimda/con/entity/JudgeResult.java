package com.nimda.con.entity;

import com.nimda.con.enums.JudgeStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "judge_results")
@Data
@AllArgsConstructor
public class JudgeResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 1:1 관계 - 하나의 채점 결과는 하나의 제출에 속함
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JudgeStatus status;    // 채점 결과 상태
    
    @Column(length = 500)
    private String message;        // 채점 메시지
    
    @Column(columnDefinition = "TEXT")
    private String output;         // 프로그램 출력 결과
    
    @Column(columnDefinition = "TEXT")
    private String errorOutput;    // 에러 출력 (컴파일/런타임 에러 시)
    
    private Long executionTime;    // 실행 시간 (밀리초)
    
    private Long memoryUsage;      // 메모리 사용량 (바이트)
    
    private Integer score;         // 획득 점수
    
    @Column(name = "judged_at", nullable = false)
    private LocalDateTime judgedAt; // 채점 완료 시간
    
    // 기본 생성자
    public JudgeResult() {
        this.judgedAt = LocalDateTime.now();
        this.score = 0;
    }
    
    // 성공 결과 생성자
    public JudgeResult(Submission submission, JudgeStatus status, String output, 
                      Long executionTime, Long memoryUsage, Integer score) {
        this();
        this.submission = submission;
        this.status = status;
        this.output = output;
        this.executionTime = executionTime;
        this.memoryUsage = memoryUsage;
        this.score = score;
        this.message = "채점이 완료되었습니다.";
    }
    
    // 에러 결과 생성자
    public JudgeResult(Submission submission, JudgeStatus status, String message, String errorOutput) {
        this();
        this.submission = submission;
        this.status = status;
        this.message = message;
        this.errorOutput = errorOutput;
        this.score = 0;
    }
    
    /**
     * 채점 결과가 정답인지 확인
     */
    public boolean isAccepted() {
        return status == JudgeStatus.ACCEPTED;
    }
    
    /**
     * 채점 결과가 에러인지 확인
     */
    public boolean isError() {
        return status == JudgeStatus.COMPILATION_ERROR || 
               status == JudgeStatus.RUNTIME_ERROR || 
               status == JudgeStatus.SYSTEM_ERROR;
    }
    
    /**
     * 실행 시간을 초 단위로 반환
     */
    public double getExecutionTimeInSeconds() {
        return executionTime != null ? executionTime / 1000.0 : 0.0;
    }
    
    /**
     * 메모리 사용량을 KB 단위로 반환
     */
    public long getMemoryUsageInKB() {
        return memoryUsage != null ? memoryUsage / 1024 : 0;
    }
}
