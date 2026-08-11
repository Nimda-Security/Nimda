package judgeServer.domain.solve.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 문제를 맞힌 기록.
 * 오답은 남기지 않는다. 무차별 대입 방어는 Redis 카운터로 처리하고,
 * 오답 통계가 필요해지면 그때 별도 테이블을 추가한다.
 */
@Entity
@Table(
        name = "solves",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_solves_challenge_user",
                columnNames = {"challenge_id", "user_id"}
        )
)
@Builder
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Solve {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 문제 식별자 (기존 도메인 관례를 따라 객체 참조 대신 ID만 저장) */
    @Column(name = "challenge_id", nullable = false)
    private Long challengeId;

    /** 맞힌 사람 */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * 맞힌 시점의 배점을 그대로 남긴다.
     * 나중에 문제 배점을 조정해도 이미 쌓인 점수가 흔들리지 않게 하기 위함이다.
     */
    @Column(name = "awarded_points", nullable = false)
    private Integer awardedPoints;

    @Column(name = "solved_at", updatable = false)
    private LocalDateTime solvedAt;

    @PrePersist
    public void prePersist() {
        this.solvedAt = LocalDateTime.now();
    }
}
