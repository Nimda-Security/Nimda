package com.nimda.con.judge.entity;

import com.nimda.con.judge.enums.Language;
import com.nimda.con.judge.enums.JudgeStatus;
import com.nimda.con.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@AllArgsConstructor
public class Submission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // N:1 관계 - 여러 제출이 하나의 사용자에 속함
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // N:1 관계 - 여러 제출이 하나의 문제에 속함
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String code;           // 제출한 소스코드
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language;     // 사용한 프로그래밍 언어
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JudgeStatus status;    // 채점 상태
    
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt; // 제출 시간
    
    // 1:1 관계 - 하나의 제출에 하나의 채점 결과
    @OneToOne(mappedBy = "submission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private JudgeResult judgeResult;
    
    // 기본 생성자
    public Submission() {
        this.status = JudgeStatus.PENDING;
        this.submittedAt = LocalDateTime.now();
    }
    
    // 생성용 생성자
    public Submission(User user, Problem problem, String code, Language language) {
        this();
        this.user = user;
        this.problem = problem;
        this.code = code;
        this.language = language;
    }
    
    /**
     * 채점 상태 업데이트
     */
    public void updateStatus(JudgeStatus status) {
        this.status = status;
    }
    
    /**
     * 제출자 사용자명 반환
     */
    public String getUsername() {
        return user != null ? user.getUsername() : "익명";
    }
    
    /**
     * 문제 제목 반환
     */
    public String getProblemTitle() {
        return problem != null ? problem.getTitle() : "알 수 없는 문제";
    }
}
