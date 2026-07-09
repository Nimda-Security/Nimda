package judgeServer.domain.submission.entity;

import jakarta.persistence.*;
import judgeServer.domain.submission.enums.SubmissionStatus;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Builder
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 문제 식별자 (MSA 환경이므로 객체 참조 대신 ID만 저장)
    @Column(name = "problem_id" ,nullable = false)
    private Long problemId;

    @Column(name = "problem_title",nullable = false)
    private String problemTitle;

    // 제출자 식별자 (누가 제출했는지 알아야 하므로 필수)
    @Column(name = "user_id",nullable = false)
    private Long userId;

    // 제출 언어 (예: JAVA, PYTHON3, CPP 등)
    @Column(nullable = false, length = 20)
    private String language;

    // 사용자가 제출한 소스 코드
    @Column(name = "source_code",columnDefinition = "TEXT", nullable = false)
    private String sourceCode;

    // 채점 상태 (PENDING, JUDGING, ACCEPTED, WRONG_ANSWER, COMPILE_ERROR 등)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubmissionStatus status;

    // 채점 결과: 실행 시간 (ms 단위)
    @Column(name = "execution_time_ms")
    private Integer executionTimeMs;

    // 채점 결과: 사용 메모리 (KB 또는 MB 단위)
    @Column(name = "used_memory_kb")
    private Integer usedMemoryKb;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "error_message")
    private String errorMessage;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = SubmissionStatus.PENDING; // 기본 상태는 대기중
        }
    }
}