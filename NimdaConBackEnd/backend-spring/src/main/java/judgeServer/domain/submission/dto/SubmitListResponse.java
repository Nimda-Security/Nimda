package judgeServer.domain.submission.dto;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import judgeServer.domain.submission.entity.Submission;
import judgeServer.domain.submission.enums.SubmissionStatus;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor @NoArgsConstructor @SuperBuilder
public class SubmitListResponse {
    // 1. 식별 정보
    private Long submissionId;
    private Long problemId;
    private String problemTitle;
    private Long userId;

    // 2. 제출 내용
    private String language;
    private LocalDateTime createdAt; // 제출 시간

    // 3. 채점 결과
    private SubmissionStatus status; // ACCEPTED, WRONG_ANSWER 등
    private Integer executionTimeMs; // 실행 시간
    private Integer usedMemoryKb; // 사용 메모리
    private String errorMessage;

    public static SubmitListResponse from(Submission submission) {
        return SubmitListResponse.builder()
                .submissionId(submission.getId())
                .problemId(submission.getProblemId())
                .userId(submission.getUserId())
                .language(submission.getLanguage())
                .status(submission.getStatus())
                .executionTimeMs(submission.getExecutionTimeMs())
                .usedMemoryKb(submission.getUsedMemoryKb())
                .errorMessage(submission.getErrorMessage())
                .createdAt(submission.getCreatedAt())
                .build();
    }
}
