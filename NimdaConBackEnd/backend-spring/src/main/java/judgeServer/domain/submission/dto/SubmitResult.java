package judgeServer.domain.submission.dto;

import judgeServer.domain.submission.entity.Submission;
import judgeServer.domain.submission.enums.SubmissionStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SubmitResult {

    // 1. 식별 정보
    private Long submissionId;
    private Long problemId;
    private Long userId;

    // 2. 제출 내용
    private String language;
    private String sourceCode; // 내가 짠 코드
    private LocalDateTime createdAt; // 제출 시간

    // 3. 채점 결과
    private SubmissionStatus status; // ACCEPTED, WRONG_ANSWER 등
    private Integer executionTimeMs; // 실행 시간
    private Integer usedMemoryKb; // 사용 메모리
    private String errorMessage;

    public static SubmitResult from(Submission submission) {
        return SubmitResult.builder()
                .submissionId(submission.getId())
                .problemId(submission.getProblemId())
                .userId(submission.getUserId())
                .language(submission.getLanguage())
                .sourceCode(submission.getSourceCode())
                .status(submission.getStatus())
                .executionTimeMs(submission.getExecutionTimeMs())
                .usedMemoryKb(submission.getUsedMemoryKb())
                .createdAt(submission.getCreatedAt())
                .build();
    }
}