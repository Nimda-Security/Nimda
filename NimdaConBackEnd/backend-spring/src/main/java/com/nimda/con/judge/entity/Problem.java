package com.nimda.con.judge.entity;

import com.nimda.con.judge.enums.Difficulty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problems")
@Data
@AllArgsConstructor
public class Problem {
    
    // * 문제 기본 정보 *
    // * Id : 문제 id (pk)
    // * title : 문제 제목 
    // * description : 문제 설명 TEXT(65,535)
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;          
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;    
    
    private Integer points;        // 점수 (기본 100점) 
    private Integer timeLimit;     // 시간 제한 (밀리초, 기본 5000ms)
    private Integer memoryLimit;   // 메모리 제한 (KB, 기본 256MB)
    
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty; 
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 1:N 관계 - 하나의 문제에 여러 제출
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Submission> submissions = new ArrayList<>();
    
    // 1:N 관계 - 하나의 문제에 여러 테스트케이스
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestCase> testCases = new ArrayList<>();
    
    // 기본 생성자
    public Problem() {
        // @PrePersist에서 초기화 처리
    }
    
    // 생성용 생성자
    public Problem(String title, String description, Difficulty difficulty) {
        this();
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
    }
    
    @PrePersist
    public void prePersist() {

        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        
        // 기본값 설정
        if (this.points == null) {
            this.points = 100;
        }
        if (this.timeLimit == null) {
            this.timeLimit = 5000;
        }
        if (this.memoryLimit == null) {
            this.memoryLimit = 256 * 1024; // 256MB를 KB로
        }
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * 테스트케이스 추가 헬퍼 메서드
     */
    public void addTestCase(String input, String expectedOutput) {
        TestCase testCase = new TestCase(this, input, expectedOutput);
        this.testCases.add(testCase);
    }
}
