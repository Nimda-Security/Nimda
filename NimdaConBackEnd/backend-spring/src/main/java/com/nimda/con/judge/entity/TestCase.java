package com.nimda.con.judge.entity;

import com.nimda.con.common.entity.BaseTimeEntity;
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
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String input;           // 입력 데이터 (예: "1 2")
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String output;          // 예상 출력 (예: "3")
    
    @Embedded
    private BaseTimeEntity timeInfo;
    
    // 기본 생성자
    public TestCase() {
        this.timeInfo = BaseTimeEntity.now();
    }
    
    // 생성용 생성자
    public TestCase(Problem problem, String input, String output) {
        this();
        this.problem = problem;
        this.input = input;
        this.output = output;
    }
    
    // 시간 정보 헬퍼 메서드
    public LocalDateTime getCreatedAt() {
        return timeInfo.getCreatedAt();
    }
    
    public LocalDateTime getUpdatedAt() {
        return timeInfo.getUpdatedAt();
    }
    
    /**
     * 테스트케이스 실행 결과 검증 메서드
     */
    public boolean isCorrect(String actualOutput) {
        if (actualOutput == null || this.output == null) {
            return false;
        }
        return this.output.trim().equals(actualOutput.trim());
    }
}
