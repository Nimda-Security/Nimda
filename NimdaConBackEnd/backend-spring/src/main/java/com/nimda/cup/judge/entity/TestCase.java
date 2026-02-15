package com.nimda.cup.judge.entity;

import com.nimda.cup.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "test_cases")
@Data
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
public class TestCase extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // N:1 관계 - 여러 테스트케이스가 하나의 문제에 속함
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String input; // 입력 데이터 (예: "1 2")

    @Column(columnDefinition = "TEXT", nullable = false)
    private String output; // 예상 출력 (예: "3")

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic; // 프론트엔드에 공개 여부 (true: 공개, false: 백엔드 전용)

    // 기본 생성자
    public TestCase() {
        this.isPublic = false; // 기본값: 백엔드 전용 (기존 데이터 호환성)
    }

    // 생성용 생성자
    public TestCase(Problem problem, String input, String output) {
        this();
        this.problem = problem;
        this.input = input;
        this.output = output;
        this.isPublic = false; // 기본값: 백엔드 전용
    }

    // * 문제 생성 시 테스트케이스를 화면단에 출력 여부를 결정하는 생성자.
    // * isPublic: true -> 화면단에 출력, false -> 내부 테스트케이스
    public TestCase(Problem problem, String input, String output, Boolean isPublic) {
        this();
        this.problem = problem;
        this.input = input;
        this.output = output;
        this.isPublic = isPublic != null ? isPublic : false;
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
