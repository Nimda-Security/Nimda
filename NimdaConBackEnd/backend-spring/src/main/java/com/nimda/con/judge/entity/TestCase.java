package com.nimda.con.judge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_cases")
@Data
@AllArgsConstructor
public class TestCase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // N:1 관계 - 여러 테스트케이스가 하나의 문제에 속함
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;
    
    @Column(columnDefinition = "TEXT")
    private String input;           // 입력 데이터 (예: "1 2")
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String expectedOutput;  // 예상 출력 (예: "3")
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // 기본 생성자
    public TestCase() {}
    
    // 생성용 생성자
    public TestCase(Problem problem, String input, String expectedOutput) {
        this.problem = problem;
        this.input = input;
        this.expectedOutput = expectedOutput;
    }
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
    
    /**
     * 테스트케이스 실행 결과 검증
     */
    public boolean isCorrect(String actualOutput) {
        if (actualOutput == null || this.expectedOutput == null) {
            return false;
        }
        return this.expectedOutput.trim().equals(actualOutput.trim());
    }
}
