package judgeServer.domain.problem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "problems")
@Builder
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Problem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 문제 고유 식별자 (예: "WEEK1-A", "DP-001")
    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    // 시간 제한 (초 단위)
    @Column(nullable = false)
    private Double timeLimit = 1.0;

    // 메모리 제한 (MB 단위)
    @Column(nullable = false)
    private Integer memoryLimit = 256;

    // 기본 배점
    @Column(nullable = false)
    private Integer points = 100;

    // 공개 여부 (초안 작성 중엔 false)
    @Column(nullable = false)
    private Boolean isPublic = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}