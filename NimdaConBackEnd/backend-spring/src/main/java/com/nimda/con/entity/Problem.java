package com.nimda.con.entity;

import com.nimda.con.enums.Difficulty;
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
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;           // 문제 제목
    
    @Column(columnDefinition = "TEXT")
    private String description;     // 문제 설명
    
    @Column(length = 100)
    private String flag;           // 정답 플래그 (A+B 같은 경우 예상 출력값)
    
    @Column(columnDefinition = "TEXT")
    private String hints;          // 힌트
    
    private Integer points;        // 점수 (기본 100점)
    
    private Integer timeLimit;     // 시간 제한 (밀리초, 기본 5000ms)
    
    private Integer memoryLimit;   // 메모리 제한 (KB, 기본 256MB)
    
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty; // 난이도
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 1:N 관계 - 하나의 문제에 여러 제출
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Submission> submissions = new ArrayList<>();
    
    // 기본 생성자
    public Problem() {
        this.points = 100;
        this.timeLimit = 5000;
        this.memoryLimit = 256 * 1024; // 256MB를 KB로
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // 생성용 생성자
    public Problem(String title, String description, String flag, Difficulty difficulty) {
        this();
        this.title = title;
        this.description = description;
        this.flag = flag;
        this.difficulty = difficulty;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
